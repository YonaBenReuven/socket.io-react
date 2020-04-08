import { useState } from "react";
import { useSocket } from "../";

export type useStateEmitType = (event: string, initialState: any | (() => any)) => [any, (any | ((prevState: any) => any))];

const useStateEmit: useStateEmitType = (event, initialState) => {
    const [state, setState] = useState<any>(initialState);
    const socket = useSocket();

    const setStateEmit = (nextState: any | ((prevState: any) => any), ...args: any[]) => {
        if (typeof nextState === "function") {
            setState((prevState: any) => {
                const nextStateValue = nextState(prevState);
                socket.emit(event, nextStateValue, ...args);
                return nextStateValue;
            });
        } else {
            socket.emit(event, nextState, ...args);
            setState(nextState);
        }
    };

    return [state, setStateEmit];
};

export default useStateEmit;