import React, { useEffect } from 'react';

import { useSocket } from "./modules/socket.io";

const SomeComponent = () => {
    const socket = useSocket();

    useEffect(() => {
        socket.emit('hello');
    }, []);

    return (
        <div>Some component with useSocket</div>
    );
}

export default SomeComponent;