module.exports = app => {
    const { io } = app;
    io.on('connection', socket => {
        socket.on('hello', () => {
            socket.emit("hello-everyone");
        });
    });
}