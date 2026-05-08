-- ============================================
-- FLAREBIT — Cinematic UI for modern FiveM.
-- ============================================
-- 
-- Public API (via exports):
--   exports.flarebit:notify(options)
--   exports.flarebit:dismiss(id)
--   exports.flarebit:dismissAll()
--   exports.flarebit:setTheme(theme)
--   exports.flarebit:setVolume(volume)
--   exports.flarebit:setMuted(muted)
--   exports.flarebit:configure(config)
--
-- Server can trigger via: TriggerClientEvent('flarebit:notify', src, options)
-- ============================================

local resourceName = GetCurrentResourceName()

-- ============================================
-- INTERNAL STATE
-- ============================================

local actionCallbacks = {}

local config = {
    defaultDuration = 4000,
    defaultPosition = 'top-center',
    defaultTheme = 'refined',
    defaultVariant = 'info',
    defaultSound = true,
    defaultVolume = 0.4
}

-- ============================================
-- HELPERS
-- ============================================

local function generateId()
    return 'fb-' .. tostring(GetGameTimer()) .. '-' .. math.random(10000, 99999)
end

local function isValidVariant(v)
    return v == 'info' or v == 'success' or v == 'warning' or v == 'error'
end

local function isValidPosition(p)
    return p == 'top-left' or p == 'top-center' or p == 'top-right'
        or p == 'bottom-left' or p == 'bottom-center' or p == 'bottom-right'
end

local function isValidTheme(t)
    return t == 'refined' or t == 'cinematic' or t == 'minimal'
end

local function safeString(s, fallback)
    if type(s) ~= 'string' then return fallback or '' end
    return s
end

-- ============================================
-- PUBLIC API: notify
-- ============================================

local function notify(options)
    if type(options) ~= 'table' then
        print('^1[Flarebit]^7 notify() requires a table argument.')
        return nil
    end

    local id = options.id or generateId()

    -- Sanitize inputs
    local title = safeString(options.title, 'Notification')
    local subtitle = safeString(options.subtitle, '')
    local variant = isValidVariant(options.variant) and options.variant or config.defaultVariant
    local position = isValidPosition(options.position) and options.position or config.defaultPosition
    local duration = (type(options.duration) == 'number' and options.duration > 0) 
        and options.duration or config.defaultDuration
    local sound = options.sound ~= false
    local persistent = options.persistent == true

    -- Process actions
    local nuiActions = nil
    if type(options.actions) == 'table' and #options.actions > 0 then
        nuiActions = {}
        actionCallbacks[id] = {}

        for i, action in ipairs(options.actions) do
            if type(action) == 'table' and action.label then
                local actionId = 'action_' .. i
                actionCallbacks[id][actionId] = {
                    event = action.event,
                    serverEvent = action.serverEvent,
                    callback = action.callback
                }
                table.insert(nuiActions, {
                    id = actionId,
                    label = safeString(action.label, 'Action'),
                    style = action.style or 'default'
                })
            end
        end
    end

    SendNUIMessage({
        action = 'flarebit:notify',
        payload = {
            id = id,
            title = title,
            subtitle = subtitle,
            duration = duration,
            variant = variant,
            position = position,
            sound = sound,
            persistent = persistent,
            color = options.color,
            icon = options.icon,
            actions = nuiActions
        }
    })

    return id
end

-- ============================================
-- PUBLIC API: dismiss / dismissAll
-- ============================================

local function dismiss(id)
    if not id then return end
    SendNUIMessage({ action = 'flarebit:dismiss', id = id })
    actionCallbacks[id] = nil
end

local function dismissAll()
    SendNUIMessage({ action = 'flarebit:dismissAll' })
    actionCallbacks = {}
end

-- ============================================
-- PUBLIC API: setTheme / setVolume / setMuted
-- ============================================

local function setTheme(theme)
    if not isValidTheme(theme) then
        print('^1[Flarebit]^7 Invalid theme: ' .. tostring(theme))
        return
    end
    config.defaultTheme = theme
    SendNUIMessage({ action = 'flarebit:setTheme', theme = theme })
end

local function setVolume(volume)
    if type(volume) ~= 'number' then return end
    volume = math.max(0, math.min(1, volume))
    config.defaultVolume = volume
    SendNUIMessage({ action = 'flarebit:setVolume', volume = volume })
end

local function setMuted(muted)
    SendNUIMessage({ action = 'flarebit:setMuted', muted = muted == true })
end

-- ============================================
-- PUBLIC API: configure (global defaults)
-- ============================================

local function configure(newConfig)
    if type(newConfig) ~= 'table' then return end

    if newConfig.defaultDuration and type(newConfig.defaultDuration) == 'number' then
        config.defaultDuration = newConfig.defaultDuration
    end
    if newConfig.defaultPosition and isValidPosition(newConfig.defaultPosition) then
        config.defaultPosition = newConfig.defaultPosition
    end
    if newConfig.defaultTheme and isValidTheme(newConfig.defaultTheme) then
        config.defaultTheme = newConfig.defaultTheme
        setTheme(newConfig.defaultTheme)
    end
    if newConfig.defaultVariant and isValidVariant(newConfig.defaultVariant) then
        config.defaultVariant = newConfig.defaultVariant
    end
    if type(newConfig.defaultSound) == 'boolean' then
        config.defaultSound = newConfig.defaultSound
    end
    if type(newConfig.defaultVolume) == 'number' then
        setVolume(newConfig.defaultVolume)
    end
end

-- ============================================
-- EXPORTS
-- ============================================

exports('notify', notify)
exports('dismiss', dismiss)
exports('dismissAll', dismissAll)
exports('setTheme', setTheme)
exports('setVolume', setVolume)
exports('setMuted', setMuted)
exports('configure', configure)

-- ============================================
-- NUI Callback: Action Button Click
-- ============================================

RegisterNUICallback('flarebit:actionClick', function(data, cb)
    local notificationId = data.notificationId
    local actionId = data.actionId

    if actionCallbacks[notificationId] and actionCallbacks[notificationId][actionId] then
        local action = actionCallbacks[notificationId][actionId]

        if action.event then
            TriggerEvent(action.event, notificationId)
        end
        if action.serverEvent then
            TriggerServerEvent(action.serverEvent, notificationId)
        end
        if type(action.callback) == 'function' then
            local ok, err = pcall(action.callback, notificationId)
            if not ok then
                print('^1[Flarebit]^7 Action callback error: ' .. tostring(err))
            end
        end

        actionCallbacks[notificationId] = nil
    end

    cb('ok')
end)

-- ============================================
-- Server-triggered Notifications
-- ============================================

RegisterNetEvent('flarebit:notify')
AddEventHandler('flarebit:notify', function(options)
    notify(options)
end)

-- ============================================
-- Cleanup on resource stop
-- ============================================

AddEventHandler('onResourceStop', function(name)
    if name == resourceName then
        actionCallbacks = {}
    end
end)

print('^5[Flarebit]^7 v0.10.0 loaded. ^2Ready.^7')

-- ============================================
-- TEST COMMANDS (development only — remove for production release)
-- ============================================

RegisterCommand('flarebit', function()
    notify({ title = 'Flarebit is alive', subtitle = 'System online and operational.', variant = 'info' })
end, false)

RegisterCommand('fb_demo', function()
    local variants = { 'info', 'success', 'warning', 'error' }
    local titles = { 'Information', 'Success', 'Warning', 'Error' }
    local subs = {
        'This is an info message.',
        'Operation completed successfully.',
        'Please review your settings.',
        'Something went wrong.'
    }
    for i = 1, 4 do
        Wait(400)
        notify({ title = titles[i], subtitle = subs[i], variant = variants[i], duration = 8000 })
    end
end, false)

RegisterCommand('fb_theme', function(source, args)
    local theme = args[1]
    if not theme then
        print('^3[Flarebit]^7 Usage: /fb_theme <refined|cinematic|minimal>')
        return
    end
    setTheme(theme)
    notify({ title = 'Theme: ' .. theme, subtitle = 'Theme switched.', variant = 'info' })
end, false)

RegisterCommand('fb_pos_all', function()
    local positions = {
        { pos = 'top-left', variant = 'info' },
        { pos = 'top-center', variant = 'success' },
        { pos = 'top-right', variant = 'warning' },
        { pos = 'bottom-left', variant = 'error' },
        { pos = 'bottom-center', variant = 'info' },
        { pos = 'bottom-right', variant = 'success' }
    }
    for _, p in ipairs(positions) do
        notify({ title = 'Position: ' .. p.pos, subtitle = 'Multi-position test', variant = p.variant, position = p.pos, duration = 8000 })
    end
end, false)

RegisterCommand('fb_actions', function()
    notify({
        title = 'Trade Request',
        subtitle = 'Player_Mike wants to trade with you.',
        variant = 'info',
        persistent = true,
        actions = {
            { label = 'Accept', style = 'primary', callback = function() notify({ title = 'Trade Accepted', variant = 'success' }) end },
            { label = 'Decline', style = 'danger', callback = function() notify({ title = 'Trade Declined', variant = 'error' }) end }
        }
    })
end, false)

RegisterCommand('fb_persistent', function()
    notify({ title = 'Persistent', subtitle = 'Click me to close. I will not auto-close.', variant = 'warning', persistent = true })
end, false)

RegisterCommand('fb_color', function(source, args)
    notify({ title = 'Custom Color', subtitle = 'Brand identity test.', color = args[1] or '#ec4899', duration = 5000 })
end, false)

RegisterCommand('fb_long', function()
    notify({
        title = 'A very long notification title that tests how the layout handles overflow gracefully without breaking',
        subtitle = 'And here is a long subtitle that should also wrap properly without ruining the design or overlapping any other elements.',
        variant = 'info',
        duration = 8000
    })
end, false)

RegisterCommand('fb_short', function()
    notify({ title = 'Hi', variant = 'success', duration = 2000 })
end, false)

RegisterCommand('fb_cursor', function()
    local current = IsNuiFocused()
    SetNuiFocus(not current, not current)
end, false)

RegisterCommand('fb_dismissall', function() dismissAll() end, false)