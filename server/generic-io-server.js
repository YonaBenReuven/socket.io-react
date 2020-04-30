const genericEvents = require('../genericEvents');

const { CONNECTION, JOIN, LEAVE, GET_ROOMS } = genericEvents;

module.exports = io => {

    io.on(CONNECTION, socket => {
        // on the 'JOIN' event the socket joins the room 'name';
        socket.on(JOIN, (name, fn) => {
            socket.join(name, fn);
        });

        // on the 'LEAVE' event the socket leaves the room 'name';
        socket.on(LEAVE, (name, fn) => {
            socket.leave(name, fn);
        });

        // on the 'GET_ROOMS' resolves the rooms of the socket;
        socket.on(GET_ROOMS, fn => {
            fn(socket.rooms);
        });
    });
};