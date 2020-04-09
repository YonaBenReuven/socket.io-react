import { useStateEmit, useOn } from ".";

export type useStateSocketType = (event: string, initialState: any | (() => any)) => [any, React.Dispatch<any>, (any | ((prevState: any) => any))];

const useStateSocket: useStateSocketType = (event, initialState) => {
    const stateEmitTuple = useStateEmit(event, initialState);
    const [, setState] = stateEmitTuple;

    useOn(event, (nextState: any) => {
        setState(nextState);
    });

    return stateEmitTuple;
};

export default useStateSocket;