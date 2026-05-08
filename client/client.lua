-- ============================================
-- FLAREBIT — CLIENT
-- ============================================

local resourceName = GetCurrentResourceName()

print('^5[Flarebit]^7 Client loaded.')

-- ============================================
-- PUBLIC API
-- ============================================

--- Show a notification
--- @param options table { title, subtitle, duration, variant }
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

-- Export so andere Resources es nutzen können:
-- exports.flarebit:notify({ title = '...', subtitle = '...' })
exports('notify', notify)

-- ============================================
-- TEST COMMAND
-- ============================================

RegisterCommand('flarebit', function(source, args, rawCommand)
    notify({
        title = 'Flarebit is alive',
        subtitle = 'System online and operational.',
        duration = 4000,
        variant = 'info'
    })
end, false)