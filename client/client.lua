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