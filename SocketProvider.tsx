import React, { createContext, useMemo } from 'react';
import io from 'socket.io-client';

import { genericEvents } from '.';

const { JOIN, LEAVE } = genericEvents;

export interface HilmaSocket extends SocketIOClient.Socket {
    /**
    * Emits the 'JOIN' event
    * @param name The name of the room that we want to join
    * @param fn An optional callback to call when we've joined the room. It should take an optional parameter, err, of a possible error
    * @return This Socket
    */
    join(name: string | string[], fn?: (err?: any) => void): SocketIOClient.Socket;

    /**
    * Emits the 'LEAVE' event
    * @param name The name of the room to leave
    * @param fn An optional callback to call when we've left the room. It should take on optional parameter, err, of a possible error
    */
    leave(name: string, fn?: Function): SocketIOClient.Socket;
}

export type SocketContextValue = HilmaSocket | null;

export const SocketContext = createContext<SocketContextValue>(null);

export interface SocketProviderProps {
    uri: string;
    options?: SocketIOClient.ConnectOpts;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children, uri, options }) => {

    const socket = useMemo<HilmaSocket>(() => {
        const socket = io(uri, options) as HilmaSocket;
        socket.join = (name, fn) => socket.emit(JOIN, name, fn);
        socket.leave = (name, fn) => socket.emit(LEAVE, name, fn);
        return socket;
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;