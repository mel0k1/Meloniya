<p align="center"><img src="public/meloniya-logo.png" width="96" alt="Мелония"></p>

# Мелония

Лаунчер Minecraft с модами, скинами и друзьями. Форк [Millida Launcher](https://github.com/millida/launcher).

## Возможности

- Версии от Mojang, загрузчики Fabric, Quilt, Forge и NeoForge
- Моды и модпаки с Modrinth и CurseForge
- Скины, плащи и косметика
- Друзья, чат и голосовые комнаты
- Свой сервер и хостинг сборок
- ИИ-сборщик модов

## Установка

Скачай установщик со страницы [релизов](https://github.com/mel0k1/Meloniya/releases) — Windows, macOS и Linux. Обновления лаунчер ставит сам.

## Сборка из исходников

Нужны [Git](https://git-scm.com), [Bun](https://bun.sh) и [Rust](https://rustup.rs). На Linux дополнительно ставятся `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`, `libxdo-dev`, `libssl-dev`, `build-essential` — полный список по каждой системе в [BUILDING.md](BUILDING.md).

```bash
git clone https://github.com/mel0k1/Meloniya.git
cd Meloniya
bun install
bun run tauri build
```

Готовый установщик появится в `src-tauri/target/release/bundle`.

## Устройство

Три слоя: React-фронтенд, IPC-команды Tauri, движок на Rust. Карта модулей и правила безопасности — в [ARCHITECTURE.md](ARCHITECTURE.md).

## Лицензия

[GPL-3.0](LICENSE). Основан на [Millida Launcher](https://github.com/millida/launcher) — спасибо авторам оригинала. Аккаунты, друзья, чат, косметика и хостинг работают через инфраструктуру Millida.
