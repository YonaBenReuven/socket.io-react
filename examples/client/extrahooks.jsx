import React from 'react';

import { useOn, useStateOn, useStateEmit, useStateSocket } from "./modules/socket.io";

export const UseOnComponent = () => {
    const [count, setCount] = useState(0);

    // called on the 'hello' event;
    useOn("hello", () => {
        console.log("someone emited hello");
    });

    // increment gets called on the 'increment' event and when the div is clicked;
    const increment = useOn("increment", () => {
        setCount(count + 1);
    }, [count]);

    return <div onClick={increment}>{count}</div>;
};


export const UseStateOnComponent = () => {
    // returns regular state tuple and on the 'count' event it will set the state to the recieved argument;
    const [count, setCount] = useStateOn("count", 0);

    return (
        <div onClick={() => setCount((count) => count + 1)}>
            {count}
        </div>
    );
};


export const UseStateEmitComponent = ({ id }) => {
    // returns regular useState tuple with the emitter;
    const [count, setCount, setCountEmit] = useStateEmit("count", 0);

    useEffect(() => {
        (async () => {
            const something = fetch('someapi');
            setCount(something);
        })();
        setInterval(() => {
            // each time setCount is called it emits the 'count' event with the next state;
            // note: you can send extra arguments to the server;
            setCountEmit((count) => count + 1, id);
        }, 1000);
    }, []);

    return <div>{count}</div>;
};


export const UseStateSocketComponent = ({ id }) => {
    // returns regular state tuple with the emitter and on the 'count' event it will set the state to the recieved argument;
    const [count, setCount, setCountEmit] = useStateSocket("count", 0);

    useEffect(() => {
        (async () => {
            const something = fetch('someapi');
            setCount(something);
        })();
        setInterval(() => {
            // each time setCount is called it emits the 'count' event with the next state;
            // note: you can send extra arguments to the server;
            setCountEmit((count) => count + 1, id);
        }, 1000);
    }, []);

    return <div>{count}</div>;
};