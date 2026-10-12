use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;
use tauri::AppHandle;

use super::paths::is_flatpak;

// Native recovery path: the core watches for a startup signal from the
// frontend and, if it never arrives, the player gets a native dialog with a
// download link — no JS involved, so a broken webview is still recoverable.

const BOOT_GRACE: Duration = Duration::from_secs(25);
const DOWNLOAD_PAGE: &str = "https://github.com/mel0k1/Meloniya/releases/latest";
const DOWNLOAD_BUTTON: &str = "Скачать";

static FRONTEND_UP: AtomicBool = AtomicBool::new(false);

/// Called once the frontend runs its own code.
pub fn mark_frontend_ready() {
    FRONTEND_UP.store(true, Ordering::SeqCst);
}

fn frontend_ready() -> bool {
    FRONTEND_UP.load(Ordering::SeqCst)
}

pub fn arm_selfheal(_app: &AppHandle) {
    // Flatpak updates itself; in dev the frontend is served by Vite; autotests
    // never open the frontend at all.
    if is_flatpak() || cfg!(debug_assertions) || std::env::var_os("MILLIDA_AUTOTEST").is_some() {
        return;
    }
    if std::env::var_os("MILLIDA_NO_SELFHEAL").is_some() {
        return;
    }
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(BOOT_GRACE).await;
        if frontend_ready() {
            return;
        }
        offer_manual_download().await;
    });
}

/// Last resort when the frontend never came up: a native system dialog, since
/// the webview is exactly what is broken.
async fn offer_manual_download() {
    let text = "Лаунчер не смог открыться.\n\nСкачай свежую версию со страницы релизов и поставь поверх — сборки, миры и аккаунты останутся на месте.";
    let answer = rfd::AsyncMessageDialog::new()
        .set_title("Мелония")
        .set_description(text)
        .set_level(rfd::MessageLevel::Error)
        .set_buttons(rfd::MessageButtons::OkCancelCustom(DOWNLOAD_BUTTON.into(), "Закрыть".into()))
        .show()
        .await;
    let go = match &answer {
        rfd::MessageDialogResult::Ok => true,
        rfd::MessageDialogResult::Custom(b) => b == DOWNLOAD_BUTTON,
        _ => false,
    };
    if go {
        let _ = crate::engine::open_external(DOWNLOAD_PAGE);
    }
}
