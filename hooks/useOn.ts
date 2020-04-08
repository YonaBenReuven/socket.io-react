import { useEffect, useCallback } from "react";
import { useSocket } from ".";

const useOn = (event: string, fn: (...args: any[]) => any, deps: React.DependencyList = []): (...args: any[]) => any => {

    const socket = useSocket();

    useEffect(() => {
        socket.on(event, fn);

        return () => {
            socket.off(event, fn);
        };
    }, []);

    return useCallback<(...args: any[]) => any>(fn, deps);
};

export default useOn;