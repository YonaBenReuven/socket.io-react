'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const afterHookEmit = require('./../src/modules/scocket.io/server/afterHookEmit');

const app = module.exports = loopback();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../build'));
require('./routes')(app);
require('./../src/modules/fileshandler/server/routes')(app);

app.start = () => {
    return app.listen(() => {
        app.emit('started');
        const baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            const explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

boot(app, __dirname, err => {
    if (err) throw err;
    if (require.main === module) {

        const io = require('socket.io')(app.start(), {
            transports: ["websocket", "xhr-polling"]
        });

        app.io = io;

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

        afterHookEmit(app, [
            { model: "AssistantRides", room: "Rides", roomId: "rideId", include: ["assistants", "rides"], }
        ]);
    }
});
