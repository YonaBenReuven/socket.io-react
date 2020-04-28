import React from 'react';

import { SocketProvider } from "./modules/socket.io";

const App = () => {
    return (
        <SocketProvider uri="localhost:8080" options={{ transports: ["websocket", "xhr-polling"] }}>
            routes here
        </SocketProvider>
    );
}

export default App;