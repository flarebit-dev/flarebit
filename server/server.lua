-- ============================================
-- FLAREBIT — Server
-- ============================================

print('^5[Flarebit]^7 Server loaded.')

-- ============================================
-- Server-Side Helper Functions
-- 
-- Usage in other resources:
--   exports.flarebit:notifyClient(playerId, options)
--   exports.flarebit:notifyAll(options)
-- ============================================

local function notifyClient(playerId, options)
    if not playerId or type(options) ~= 'table' then return end
    TriggerClientEvent('flarebit:notify', playerId, options)
end

local function notifyAll(options)
    if type(options) ~= 'table' then return end
    TriggerClientEvent('flarebit:notify', -1, options)
end

exports('notifyClient', notifyClient)
exports('notifyAll', notifyAll)