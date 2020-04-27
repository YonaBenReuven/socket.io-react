import React, { createContext, useMemo } from 'react';
import io from 'socket.io-client';

export type SocketContextValue = SocketIOClient.Socket | null;

export const SocketContext = createContext<SocketContextValue>(null);

export interface SocketProviderProps {
    uri: string;
    options?: SocketIOClient.ConnectOpts;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children, uri, options }) => {

    const socket = useMemo<SocketIOClient.Socket>(() => io(uri, options), []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;