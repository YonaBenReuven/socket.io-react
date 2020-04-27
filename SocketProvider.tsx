import React, { createContext, useMemo, useEffect } from 'react';
import io from 'socket.io-client';

import { genericEvents } from ".";

export type SocketContextValue = SocketIOClient.Socket | null;

export const SocketContext = createContext<SocketContextValue>(null);

export interface SocketProviderProps {
    uri: string;
    options?: SocketIOClient.ConnectOpts;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children, uri, options }) => {

    const socket = useMemo<SocketIOClient.Socket>(() => io(uri, options), []);

    useEffect(() => {
        socket.on(genericEvents.DISCONNECT, socket.removeAllListeners);
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;