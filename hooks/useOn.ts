import { useEffect, useCallback } from "react";
import { useSocket } from ".";

const useOn = (event: string, fn: (...args: any[]) => any, deps: React.DependencyList | undefined): (...args: any[]) => any => {

    const socket = useSocket();

    useEffect(() => {
        socket.on(event, fn);

        return () => {
            socket.off(event, fn);
        };
    }, []);

    return deps ? useCallback<(...args: any[]) => any>(fn, deps) : fn;
};

export default useOn;