import React from 'react';
import { useSocket } from "../";
import { ExtendedSocket } from '../SocketProvider';

export interface WithSocketProps {
    socket: ExtendedSocket;
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