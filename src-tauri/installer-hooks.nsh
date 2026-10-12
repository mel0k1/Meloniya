!include LogicLib.nsh

!ifdef MAINBINARYNAME
  !define MELONIYA_MAIN_EXE "${MAINBINARYNAME}.exe"
!else
  !define MELONIYA_MAIN_EXE "meloniya-launcher.exe"
!endif

!define MELONIYA_ASIDE ".meloniya-old"

Var MeloniyaAttempt
Var MeloniyaProbe
Var MeloniyaAside
Var MeloniyaExitCode

; NSIS aborts the install with "Error opening file for writing" whenever the
; target is still held: the app running from the tray, an elevated instance the
; per-user installer may not terminate, a virus scanner reading the previous
; build, or a read-only attribute left by one of them. Retrying opens the same
; handle and fails again, so the file is freed here instead: attributes cleared,
; the app asked to quit, then forced, and as a last resort the locked file is
; renamed aside — Windows allows renaming a running image — and removed on the
; next reboot. The installer writes a fresh binary either way.
!macro MeloniyaFreeFile _file
  ${If} ${FileExists} "${_file}"
    SetFileAttributes "${_file}" NORMAL
    StrCpy $MeloniyaAttempt 0
    ${Do}
      ClearErrors
      FileOpen $MeloniyaProbe "${_file}" a
      ${IfNot} ${Errors}
        FileClose $MeloniyaProbe
        ${Break}
      ${EndIf}
      ${If} $MeloniyaAttempt == 0
        nsExec::Exec 'taskkill /IM "${MELONIYA_MAIN_EXE}"'
        Pop $MeloniyaExitCode
      ${ElseIf} $MeloniyaAttempt == 2
        nsExec::Exec 'taskkill /F /IM "${MELONIYA_MAIN_EXE}"'
        Pop $MeloniyaExitCode
      ${ElseIf} $MeloniyaAttempt == 4
        StrCpy $MeloniyaAside "${_file}${MELONIYA_ASIDE}"
        Delete "$MeloniyaAside"
        ClearErrors
        Rename "${_file}" "$MeloniyaAside"
        ${IfNot} ${Errors}
          Delete /REBOOTOK "$MeloniyaAside"
          ${Break}
        ${EndIf}
      ${ElseIf} $MeloniyaAttempt == 5
        StrCpy $MeloniyaAside "${_file}${MELONIYA_ASIDE}2"
        Delete "$MeloniyaAside"
        ClearErrors
        Rename "${_file}" "$MeloniyaAside"
        ${IfNot} ${Errors}
          Delete /REBOOTOK "$MeloniyaAside"
        ${EndIf}
        ${Break}
      ${EndIf}
      Sleep 600
      IntOp $MeloniyaAttempt $MeloniyaAttempt + 1
    ${Loop}
  ${EndIf}
!macroend

!macro MeloniyaFreeInstallDir
  !insertmacro MeloniyaFreeFile "$INSTDIR\${MELONIYA_MAIN_EXE}"
  !insertmacro MeloniyaFreeFile "$INSTDIR\WebView2Loader.dll"
  !insertmacro MeloniyaFreeFile "$INSTDIR\uninstall.exe"
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro MeloniyaFreeInstallDir
!macroend

!macro NSIS_HOOK_POSTINSTALL
  Delete /REBOOTOK "$INSTDIR\*${MELONIYA_ASIDE}*"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro MeloniyaFreeInstallDir
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete /REBOOTOK "$INSTDIR\*${MELONIYA_ASIDE}*"
!macroend
