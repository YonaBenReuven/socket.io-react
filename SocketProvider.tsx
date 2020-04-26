import React, { createContext, useMemo, useEffect } from 'react';
import io from 'socket.io-client';

import { genericEvents } from ".";

export interface ExtendedSocket extends SocketIOClient.Socket {
    /**
     * @param room room you want to join
     * @param fn callback function that's called after joining a room
     */
    join(room: string, fn: () => void): SocketIOClient.Socket;
    /**
     * @param room room you want to leave
     * @param fn callback function that's called after leaving a room
     */
    leave(room: string, fn: () => void): SocketIOClient.Socket;
}

export type SocketContextValue = ExtendedSocket | null;

export const SocketContext = createContext<SocketContextValue>(null);

export interface SocketProviderProps {
    uri: string;
    options?: SocketIOClient.ConnectOpts;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children, uri, options }) => {

    const socket = useMemo<ExtendedSocket>(() => {
        const socket = io(uri, options) as ExtendedSocket;
        socket.join = (room: string, fn: () => void) => socket.emit(genericEvents.JOIN_ROOM, room, fn);
        socket.leave = (room: string, fn: () => void) => socket.emit(genericEvents.LEAVE_ROOM, room, fn);
        return socket;
    }, []);

    useEffect(() => {
        socket.on(genericEvents.DISCONNECT, socket.removeAllListeners);
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;