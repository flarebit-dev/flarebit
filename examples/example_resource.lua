-- ============================================
-- FLAREBIT — Example Integration
-- ============================================
-- 
-- This file shows how to use Flarebit in your own resource.
-- Copy snippets you need into your own resource files.
-- ============================================

-- ===== BASIC NOTIFICATION =====
exports.flarebit:notify({
    title = 'Welcome',
    subtitle = 'You have joined the server.',
    variant = 'info'
})

-- ===== ALL VARIANTS =====
exports.flarebit:notify({ variant = 'success', title = 'Saved', subtitle = 'Your data is safe.' })
exports.flarebit:notify({ variant = 'warning', title = 'Watch out', subtitle = 'Low fuel.' })
exports.flarebit:notify({ variant = 'error',   title = 'Failed',   subtitle = 'Try again.' })

-- ===== POSITIONS =====
exports.flarebit:notify({ title = 'Hello', position = 'top-right' })
exports.flarebit:notify({ title = 'Hello', position = 'bottom-left' })

-- ===== CUSTOM COLOR (server brand) =====
exports.flarebit:notify({
    title = 'Custom Brand',
    subtitle = 'Server-branded notification.',
    color = '#3b82f6'  -- any hex color
})

-- ===== PERSISTENT (no auto-close) =====
local id = exports.flarebit:notify({
    title = 'Read carefully',
    subtitle = 'Click to dismiss.',
    persistent = true
})

-- Dismiss it manually later:
-- exports.flarebit:dismiss(id)

-- ===== ACTION BUTTONS =====
exports.flarebit:notify({
    title = 'Trade Request',
    subtitle = 'Player_Mike wants to trade.',
    persistent = true,
    actions = {
        {
            label = 'Accept',
            style = 'primary',
            callback = function()
                -- your accept logic here
                print('Trade accepted')
            end
        },
        {
            label = 'Decline',
            style = 'danger',
            callback = function()
                print('Trade declined')
            end
        }
    }
})

-- ===== EVENT-BASED ACTIONS =====
exports.flarebit:notify({
    title = 'Job Offer',
    subtitle = 'Accept the new mission?',
    persistent = true,
    actions = {
        { label = 'Accept', style = 'primary', event = 'myjob:acceptOffer' },
        { label = 'Skip',   style = 'default', event = 'myjob:skipOffer' }
    }
})

-- ===== SERVER-TRIGGERED (from server.lua) =====
-- exports.flarebit:notifyClient(playerId, { title = 'Hi from server' })
-- exports.flarebit:notifyAll({ title = 'Server announcement', variant = 'warning' })

-- ===== CONFIGURE GLOBAL DEFAULTS =====
exports.flarebit:configure({
    defaultDuration = 5000,
    defaultPosition = 'top-right',
    defaultTheme = 'cinematic',
    defaultVolume = 0.5
})

-- ===== THEME SWITCHING =====
exports.flarebit:setTheme('cinematic')  -- 'refined' | 'cinematic' | 'minimal'

-- ===== VOLUME / MUTE =====
exports.flarebit:setVolume(0.6)
exports.flarebit:setMuted(true)