echo "Installing dependencies."
npm install --save socket.io typescript @types/node @types/react @types/react-dom @types/jest @types/socket.io
sed -i "s/app.start()/ \/\/app.start();\nconst io = require('socket.io')(app.start(), \/* { transports: ['websocket', 'xhr-polling'] *\/ })/g" ../../server/server.js 
# שזה מייבא ל model-config.json
# lb create boot socket.io 
# cat "omeiogeogeoerpogkpore" > ./boot/socket.io

