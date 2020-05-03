import { useEffect, useCallback } from "react";

import { useSocket } from ".";

const useOn = (event: string, fn: (...args: any[]) => any, deps?: React.DependencyList): (...args: any[]) => any => {

    const socket = useSocket();

    useEffect(() => {
        socket.on(event, fn);

        return () => {
            socket.off(event, fn);
        };
    }, [event, fn]);

    const memoizedFn = useCallback<(...args: any[]) => any>(fn, deps || []);

    return deps ? memoizedFn : fn;
};

export default useOn;