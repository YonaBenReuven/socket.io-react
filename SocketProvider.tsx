import React, { createContext, useMemo, useEffect } from 'react';
import io from 'socket.io-client';

export type SocketContextValue = SocketIOClient.Socket | null;

export const SocketContext = createContext<SocketContextValue>(null);

export interface SocketProviderProps {
    uri: string;
    opts?: SocketIOClient.ConnectOpts;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children, uri, opts }) => {

    const socket = useMemo<SocketIOClient.Socket>(() => io.connect(uri, opts), []);

    useEffect(() => {
        socket.on('disconnect', socket.removeAllListeners);
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;