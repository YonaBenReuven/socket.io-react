import { useSocket, useStateOn } from ".";

export type useStateSocketType = (event: string, initialState: any | (() => any)) => [any, (any | ((prevState: any) => any))];

const useStateSocket: useStateSocketType = (event, initialState) => {
    const [state, setState] = useStateOn(event, initialState);
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

export default useStateSocket;