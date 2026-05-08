fx_version 'cerulean'
game 'gta5'

name 'flarebit'
author 'Flarebit'
description 'Cinematic UI for modern FiveM. — flarebit.dev'
version '0.10.0'
repository 'https://github.com/flarebit-dev/flarebit'
url 'https://flarebit.dev'

ui_page 'ui/index.html'

client_scripts {
    'client/client.lua'
}

server_scripts {
    'server/server.lua'
}

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js'
}

lua54 'yes'