import React, { createContext, useMemo } from 'react';
import io from 'socket.io-client';

import genericEvents from './genericEvents';

const { JOIN, LEAVE, GET_ROOMS } = genericEvents;

export interface HilmaSocket extends SocketIOClient.Socket {
    /**
    * Emits the 'JOIN' event
    * @param name The name of the room that we want to join
    * @param fn An optional callback to call when we've joined the room. It should take an optional parameter, err, of a possible error
    */
    join(name: string | string[], fn?: (err?: any) => void): Promise<void>;

    /**
    * Emits the 'LEAVE' event
    * @param name The name of the room to leave
    * @param fn An optional callback to call when we've left the room. It should take on optional parameter, err, of a possible error
    */
    leave(name: string, fn?: Function): Promise<void>;
    
    /**
     * Emits the 'GET_ROOMS' event
     */
    getRooms(): Promise<{ [id: string]: string; }>;
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

        socket.join = (name, fn = () => { }) => new Promise((resolve, reject) => {
            socket.emit(JOIN, name, (err: any) => {
                fn(err);
                if (err) { reject(err); return; }
                resolve();
            });
        });

        socket.leave = (name, fn = () => { }) => new Promise(resolve => {
            socket.emit(LEAVE, name, () => {
                fn();
                resolve();
            });
        });

        socket.getRooms = () => new Promise(resolve => socket.emit(GET_ROOMS, resolve));

        return socket;
    }, []);

    return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;