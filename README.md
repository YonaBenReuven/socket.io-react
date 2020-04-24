# socket.io-react

## socket io with react using hooks and context;

## Installation: `npm install socket.io`

### Server Side

##### example for how the server.js would loop is in serverExample.js

#### Add to your boot function in server.js file:

```js
boot(app, __dirname, (err) => {
    if (err) throw err;
    if (require.main === module) {
        // require('socket.io')(SERVER, OPTIONS);
        // in loopback's case the SERVER is app.start();
        // for the OPTIONS you can add { transports: ["websocket", "xhr-polling"] };
        // this means you'll be using websocket instead of polling, recommended;
        const io = require("socket.io")(app.start(), {
            transports: ["websocket", "xhr-polling"],
        });

        // setting this means that you can use the io instance anywhere you use app;
        app.io = io;
    }
});
```

### Auth functions

```js
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
```

#### After setting the io instance:

```js
io.use((socket, next) => {
    // you can access the cookies through socket.request.headers.cookie;
    // call the next() function if the the client is authenticated;
    // here's an example for authenticating in loopback;
    (async () => {
        try {
            const accessToken = cookie.parse(socket.request.headers.cookie)[
                "access_token"
            ];
            if (!accessToken) throw { message: "no access token" };
            const { AccessToken } = app.models;
            const token = cookieParser.signedCookie(
                decodeURIComponent(accessToken),
                app.get("cookieSecret")
            );
            const res = await AccessToken.findById(token);
            if (!res) throw { message: "incorrect access token" };
            next();
        } catch (err) {
            console.log(err);
        }
    })();
});
```

#### If you want to listen to changes to models add this:

```js
const afterHookEmit = require(FILE_PATH);
```

### After setting `app.io = io;`

```js
afterHookEmit(app, MODELS);
```

### MODELS Example:

```js
const MODELS = [
    {
        model: "AssistantRides", // The model name;
        room: "Rides", // the name of the room to send the data to. Default to the model name;
        roomId: "rideId", // The name of the room Id. default to "id";
        include: ["assistants", "rides"], // Not required, can pass relations to include;
    },
];
```

Say we have the models AssistantRides and Rides. we want to listen for changes in AssistantRides and emit to the room name Rides.
if the AssistantRides instance is like this

```js
{ id: 234, rideId: 567, moreInfo: {} }
```

the emited event will be: `'Rides-567'` and will include the info that will look like this

```js
const data = {
    model: "Rides",
    method: "CREATE", // options: "CREATE" | "UPDATE" | "DELETE"
    instance: { id: 234, rideId: 567, moreInfo: {} },
    include: {
        assistants: [{ info: "" }],
        rides: { info: "" },
    },
};
```

### Client Side

#### providing the socket:

wrap your component tree with the SocketProvider component:

```jsx
<SocketProvider uri="localhost:8080">
    <App />
</SocketProvider>
```

connecting to the socket depends on where you use SocketProvider;

#### SocketProvider Props:

uri (required): The uri that we'll connect to, including the namespace, where '/' is the default one (e.g. http://localhost:4000/somenamespace);

options (optional): Any connect options that we want to pass along;

### consuming the socket:

there are a few ways to consume the socket object;

1. the socket is provided with context so you can consume it via the SocketContext context object;

2. using the HOC withSocket you will recieve the socket via the socket prop:

```jsx
class MyComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.socket.emit("hello");
    }

    render() {
        return <div>component using withSocket</div>;
    }
}

export default withSocket(MyComponent);
```

3. using the hook useSocket you will recieve the socket:

```jsx
const MyComponent = () => {
    const socket = useSocket();

    useEffect(() => {
        socket.emit("hello");
    }, []);

    return <div>component using useSocket</div>;
};

export default MyComponent;
```

### extra hooks:

#### useOn

hook that listens to event;

**parameters:**

-   event (required): the event to listen to;
-   listener (required): the listener function;
-   dependency list (optional): the hook returns the listener wrapped by the useCallback hook. the dependency list is passed to useCallback. if it's not provided it will just return the listener;

example:

```jsx
const MyComponent = () => {
    const [count, setCount] = useState(0);

    // called on the 'hello' event;
    useOn("hello", () => {
        console.log("someone emited hello");
    });

    // increment gets called on the 'increment' event and when the div is clicked;
    const increment = useOn(
        "increment",
        () => {
            setCount(count + 1);
        },
        [count]
    );

    return <div onClick={increment}>component using useOn</div>;
};

export default MyComponent;
```

#### useStateOn

hook that combines useState and useOn: it listens to event and sets the state on the event;

**parameters:**

-   event (required): the event to listen to;
-   initial state (optional): the initial state;

example:

```jsx
const MyComponent = () => {
    // returns regular state tuple and on the 'count' event it will set the state to the recieved argument;
    const [count, setCount] = useStateOn("count", 0);

    return (
        <div onClick={() => setCount((count) => count + 1)}>
            component using useStateOn
        </div>
    );
};

export default MyComponent;
```

#### useStateEmit

hook that returns a useState tuple and a function that sets the new state and emits it;

**parameters:**

-   event (required): the event to listen to;
-   initial state (required): the initial state;

example:

```jsx
const MyComponent = ({ id }) => {
    // returns regular useState tuple with the emitter;
    const [count, setCount, setCountEmit] = useStateEmit("count", 0);

    useEffect(() => {
        setInterval(() => {
            // each time setCount is called it emits the 'count' event with the next state;
            // note: you can send extra arguments to the server;
            setCountEmit((count) => count + 1, id);
        }, 1000);
    }, []);

    return <div>component using useStateEmit</div>;
};

export default MyComponent;
```

#### useStateSocket

hook that combines useStateOn and useStateEmit;

**parameters:**

-   event (required): the event to listen to;
-   initial state (required): the initial state;

example:

```jsx
const MyComponent = ({ id }) => {
    // returns regular state tuple with the emitter and on the 'count' event it will set the state to the recieved argument;
    const [count, setCount, setCountEmit] = useStateSocket("count", 0);

    useEffect(() => {
        setInterval(() => {
            // each time setCount is called it emits the 'count' event with the next state;
            // note: you can send extra arguments to the server;
            setCountEmit((count) => count + 1, id);
        }, 1000);
    }, []);

    return <div>component using useStateSocket</div>;
};

export default MyComponent;
```
