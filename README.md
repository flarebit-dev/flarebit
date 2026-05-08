<div align="center">

# Flarebit

**Cinematic UI for modern FiveM.**

Premium notification system built with modern web standards.
Designed for developers who care about polish.

[Website](https://flarebit.dev) · [Discord](#) · [Docs](#)

</div>

---

## ✨ Features

- 🎨 **3 Built-in Themes** — Refined (default), Cinematic, Minimal
- 🎯 **6 Positions** — top/bottom × left/center/right
- 🎭 **4 Variants** — info, success, warning, error
- 🔊 **Sound System** — Web Audio, no files required
- ⚡ **Smooth Animations** — spring easing, FLIP repositioning, slide exits
- 📚 **Stack System** — multiple notifications, auto-managed
- ⏱️ **Progress Timer** — visual countdown synced with auto-close
- 🖱️ **Hover Pause** — pauses timer on hover
- 🎬 **Action Buttons** — confirm/cancel patterns built-in
- 🔒 **Persistent Mode** — manual dismiss only
- 🎨 **Custom Colors** — brand your notifications
- 🔌 **Server-Side API** — trigger from server scripts
- ♿ **Accessible** — respects prefers-reduced-motion

## 📦 Installation

1. Download or clone this repo into `resources/[flarebit]/flarebit/`
2. Add to your `server.cfg`:
ensure flarebit
3. Restart your server

## 🚀 Quick Start

```lua
exports.flarebit:notify({
    title = 'Welcome',
    subtitle = 'You have joined the server.',
    variant = 'success'
})
```

## 📖 API Reference

### `notify(options)`

Show a notification.

**Options:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | `'Notification'` | Bold title text |
| `subtitle` | string | `''` | Secondary text |
| `variant` | string | `'info'` | `'info'` \| `'success'` \| `'warning'` \| `'error'` |
| `position` | string | `'top-center'` | See positions below |
| `duration` | number | `4000` | Auto-close in ms |
| `persistent` | boolean | `false` | Disable auto-close |
| `sound` | boolean | `true` | Play sound on show |
| `color` | string | `nil` | Custom hex color, e.g. `'#3b82f6'` |
| `actions` | table | `nil` | Action buttons (see below) |

**Returns:** Notification ID (string), can be used with `dismiss()`.

**Positions:**
`top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

### `dismiss(id)`

Dismiss a specific notification.

### `dismissAll()`

Dismiss all active notifications.

### `setTheme(theme)`

Switch theme: `'refined'` · `'cinematic'` · `'minimal'`

### `setVolume(volume)` / `setMuted(muted)`

Control audio. Volume `0.0` to `1.0`.

### `configure(config)`

Set global defaults. See `examples/example_resource.lua`.

## 🎬 Action Buttons

```lua
exports.flarebit:notify({
    title = 'Trade Request',
    subtitle = 'Player_Mike wants to trade.',
    persistent = true,
    actions = {
        {
            label = 'Accept',
            style = 'primary',  -- 'default' | 'primary' | 'danger'
            callback = function() print('accepted') end
        },
        {
            label = 'Decline',
            style = 'danger',
            event = 'myresource:declineTrade'  -- triggers client event
        }
    }
})
```

## 🌐 Server-Side

```lua
-- in your server script
exports.flarebit:notifyClient(playerId, {
    title = 'Welcome',
    subtitle = 'Server says hi.'
})

exports.flarebit:notifyAll({
    title = 'Server Restart',
    subtitle = 'Restarting in 5 minutes.',
    variant = 'warning'
})
```

## 🎨 Themes

| Theme | Use Case |
|-------|----------|
| `refined` | Production default. Subtle, premium, dark. |
| `cinematic` | Showcase / sci-fi servers. Hexagon icons, glows, scan-lines. |
| `minimal` | Realism / RP servers. Clean, monochrome, dezent. |

## 📝 License

MIT — see [LICENSE](LICENSE).

## 🔗 Links

- Website: [flarebit.dev](https://flarebit.dev)
- Issues: [GitHub Issues](https://github.com/flarebit-dev/flarebit/issues)

---

<div align="center">

Made with ❤️ for the FiveM community.

</div>