'use strict';

const genericEvents = require('../genericEvents');

module.exports = io => {
    io.on(genericEvents.CONNECTION, socket => {
        // in client emit the 'JOIN_ROOM' event to join a room;
        socket.on(genericEvents.JOIN_ROOM, (roomName, fn) => socket.join(roomName, fn));

        // in client emit the 'LEAVE_ROOM' event to leave a room;
        socket.on(genericEvents.LEAVE_ROOM, (roomName, fn) => socket.leave(roomName, fn));
    });
};