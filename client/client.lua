-- ============================================
-- FLAREBIT — CLIENT
-- ============================================

print('^5[Flarebit]^7 Client loaded.')

RegisterCommand('flarebit', function(source, args, rawCommand)
    SendNUIMessage({
        action = 'test',
        title = 'Flarebit is alive',
        subtitle = 'System online and operational.',
        duration = 4000
    })
    print('^5[Flarebit]^7 NUI message sent.')
end, false)