'use strict';

// const loopback = require('loopback');
// const boot = require('loopback-boot');
// const path = require('path');
// const express = require('express');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const afterHookEmit = require('./../src/modules/scocket.io/server/afterHookEmit');
const socketIOGeneric = require('./../src/modules/scocket.io/server/socket.io-generic');

// const app = module.exports = loopback();
// app.use(express.json());
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '../build'));
// require('./routes')(app);
// require('./../src/modules/fileshandler/server/routes')(app);

// app.start = () => {
//     return app.listen(() => {
//         app.emit('started');
//         const baseUrl = app.get('url').replace(/\/$/, '');
//         console.log('Web server listening at: %s', baseUrl);
//         if (app.get('loopback-component-explorer')) {
//             const explorerPath = app.get('loopback-component-explorer').mountPath;
//             console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
//         }
//     });
// };

// boot(app, __dirname, err => {
//     if (err) throw err;
//     if (require.main === module) {

    // ? < ---- BASIC INSTALLATION --> 
        // ! require('socket.io')(SERVER, OPTIONS);
        // ! in loopback's case, the SERVER is app.start();
        // ! for the OPTIONS you can add { transports: ["websocket", "xhr-polling"] };
        // ! this means you'll be using websocket instead of polling, recommended;
        const io = require('socket.io')(app.start(),{ transports: ["websocket", "xhr-polling"] });

        // !setting this means that you can use the io instance anywhere you use app;
        app.io = io;

    // ? < ---- EXTANTIONS --> 

        // ! Adds basic events: 'JOIN_ROOM' and 'LEAVE_ROOM' that join and leave sockets in rooms;
        socketIOGeneric(io);

        // ! you can access the cookies through socket.request.headers.cookie;
        // ! call the next() function if the the client is authenticated;
        // ! here's an example for authenticating in loopback;
        io.use((socket, next) => {
            (async () => {
                try {
                    const accessToken = cookie.parse(socket.request.headers.cookie)['access_token'];
                    if (!accessToken) throw { message: "no access token" };
                    const { AccessToken } = app.models;
                    const token = cookieParser.signedCookie(decodeURIComponent(accessToken), app.get('cookieSecret'));
                    const res = await AccessToken.findById(token);
                    if (!res) throw { message: "incorrect access token" };
                    next();
                } catch (err) {
                    console.log(err);
                }
            })();
        });

        // ! HERE YOU CAN ADD YOUR OWN SOCKET.IO PAGE, LIKE THAT:
        require('../MySocketIo.js')(app) // ! "MySocketIo.js" is your own extention to the socket.io model. 

        // !EXPLAIN 
        afterHookEmit(app, [
            { model: "AssistantRides", room: "Rides", roomId: "rideId", include: ["assistants", "rides"]},
            { model: "Rides", include: ["children"] }
        ]);
   // }
//});
