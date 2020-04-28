const genericEvents = require('../genericEvents');

const { CONNECTION, JOIN, LEAVE } = genericEvents;

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
    });
};