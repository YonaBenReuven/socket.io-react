import { useState } from "react";

import { useOn } from ".";

const useStateOn = (event: string, initialState: any): [any, React.Dispatch<any>] => {
    const stateTuple = useState<any>(initialState);
    const [, setState] = stateTuple;

    useOn(event, (nextState: any) => {
        setState(nextState);
    });

    return stateTuple;
};

export default useStateOn;