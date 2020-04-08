import React from 'react';
import { useSocket } from "../hooks";

export interface WithSocketProps {
    socket: SocketIOClient.Socket;
}

const withSocket = <P extends WithSocketProps = WithSocketProps>(Component: React.ComponentType<P>) => {

    const WithSocket: React.FC<P> = props => {
        const socket = useSocket();
        return <Component {...props as P} socket={socket} />;
    };

    WithSocket.displayName = `withSocket(${Component.displayName || Component.name || "Component"})`;

    return WithSocket;
};

export default withSocket;