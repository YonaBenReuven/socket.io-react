# socket.io-react

## socket io with react using hooks and context;

### providing the socket:

wrap your component tree with the SocketProvider component:

```jsx
<SocketProvider uri="localhost:8080">
    <App />
</SocketProvider>
```

connecting to the socket depends on where you use SocketProvider;

#### SocketProvider Props: 

uri (required): The uri that we'll connect to, including the namespace, where '/' is the default one (e.g. http://localhost:4000/somenamespace);

opts (optional): Any connect options that we want to pass along;


### consuming the socket:

there are a few ways to consume the socket object;

1. the socket is provided with context so you can consume it via the SocketContext context object;

2. using the HOC withSocket you will recieve the socket via the socket prop:
``` jsx
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.socket.emit('hello');
    }
    render() {
        return (
            <div>component using withSocket</div>
        );
    }
}

export default withSocket(MyComponent);
```

3. using the hook useSocket you will recieve the socket:
``` jsx
const MyComponent = () => {
    const socket = useSocket();

    useEffect(() => {
        socket.emit('hello');
    }, []);

    return (
        <div>component using useSocket</div>
    );
};

export default MyComponent;
```


### extra hooks:

#### useOn

hook that listens to event;

__parameters:__

* event (required): the event to listen to;
* fn (required): the listener function;
* dependency list (default = []): the hook returns the listener wrapped by the useCallback hook. the dependency list is passed to useCallback;

example: 
``` jsx
const MyComponent = () => {
    const [count, setCount] = useState(0);

    // called on the 'hello' event;
    useOn('hello', () => {
        console.log('someone emited hello');
    });

    // increment gets called on the 'increment' event and when the div is clicked;
    const increment = useOn('increment', () => {
        setCount(count + 1);
    }, [count]);

    return (
        <div onClick={increment}>component using useOn</div>
    );
};

export default MyComponent;
```

#### useStateSocket

hook that return a useState tuple and emits event on setState;

__parameters:__

* event (required): the event to listen to;
* initial state (optional): the initial state;

example: 
``` jsx
const MyComponent = () => {
    const [count, setCount] = useStateSocket('count', 0);

    useEffect(() => {
        setInterval(() => {
            // each time setCount is called it emits the 'count' event with the next state;
            setCount(count => count +1);
        }, 1000);
    }, []);

    return (
        <div onClick={increment}>component using useOn</div>
    );
};

export default MyComponent;
```