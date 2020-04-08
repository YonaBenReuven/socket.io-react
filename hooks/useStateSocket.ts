import { useState, useCallback } from "react";
import { useSocket } from "../";

export type useStateSocketType = (event: string, initialState: any | (() => any)) => [any, (any | ((prevState: any) => any))];

const useStateSocket: useStateSocketType = (event, initialState) => {
    const [state, setState] = useState<any>(initialState);
    const socket = useSocket();

    const setStateEmit = useCallback((nextState: any | ((prevState: any) => any)) => {
        if (typeof nextState === "function") {
            setState((prevState: any) => {
                const nextStateValue = nextState(prevState);
                socket.emit(event, nextStateValue);
                return nextStateValue;
            });
        } else {
            socket.emit(event, nextState);
            setState(nextState);
        }
    }, [socket]);

    return [state, setStateEmit];
};

export default useStateSocket;