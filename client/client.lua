-- ============================================
-- FLAREBIT — CLIENT
-- ============================================

print('^5[Flarebit]^7 Client loaded.')

-- ============================================
-- PUBLIC API
-- ============================================

local function notify(options)
    options = options or {}

    SendNUIMessage({
        action = 'flarebit:notify',
        payload = {
            id = options.id or tostring(GetGameTimer()) .. '-' .. math.random(1000, 9999),
            title = options.title or 'Notification',
            subtitle = options.subtitle or '',
            duration = options.duration or 4000,
            variant = options.variant or 'info'
        }
    })
end

exports('notify', notify)

-- ============================================
-- TEST COMMANDS
-- ============================================

RegisterCommand('flarebit', function()
    notify({
        title = 'Flarebit is alive',
        subtitle = 'System online and operational.',
        variant = 'info'
    })
end, false)

RegisterCommand('fb_info', function()
    notify({
        title = 'New update available',
        subtitle = 'Version 0.2.0 is ready to install.',
        variant = 'info'
    })
end, false)

RegisterCommand('fb_success', function()
    notify({
        title = 'Payment successful',
        subtitle = 'Your transaction has been completed.',
        variant = 'success'
    })
end, false)

RegisterCommand('fb_warning', function()
    notify({
        title = 'Low fuel detected',
        subtitle = 'Please refuel at the next station.',
        variant = 'warning'
    })
end, false)

RegisterCommand('fb_error', function()
    notify({
        title = 'Connection lost',
        subtitle = 'Unable to reach the server. Retrying...',
        variant = 'error'
    })
end, false)

-- ============================================
-- STACK 3 TEST: Multi-Notification Tests
-- ============================================

RegisterCommand('fb_stack', function()
    local variants = { 'info', 'success', 'warning', 'error' }
    for i = 1, 4 do
        Wait(300)
        exports.flarebit:notify({
            title = 'Notification ' .. i,
            subtitle = 'This is a ' .. variants[i] .. ' message.',
            variant = variants[i],
            duration = 6000
        })
    end
end, false)

RegisterCommand('fb_burst', function()
    for i = 1, 7 do
        Wait(150)
        exports.flarebit:notify({
            title = 'Burst #' .. i,
            subtitle = 'Testing maximum stack capacity.',
            variant = ({ 'info', 'success', 'warning', 'error' })[(i % 4) + 1],
            duration = 5000
        })
    end
end, false)

-- ============================================
-- STACK 4 TEST: Animation Polish
-- ============================================

RegisterCommand('fb_polish', function()
    exports.flarebit:notify({
        title = 'Hover over me',
        subtitle = 'I will pause my timer. Click to dismiss.',
        variant = 'info',
        duration = 8000
    })
end, false)

RegisterCommand('fb_dismissall', function()
    SendNUIMessage({ action = 'flarebit:dismissAll' })
end, false)

-- TEMPORARY: Toggle NUI cursor for testing hover
RegisterCommand('fb_cursor', function()
    local current = IsNuiFocused()
    SetNuiFocus(not current, not current)
    print('^5[Flarebit]^7 NUI cursor: ' .. tostring(not current))
end, false)