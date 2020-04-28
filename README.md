# socket.io-react

## socket io with react using hooks and context;

## Dependencies: `npm install socket.io`

## Table of contents:

-   [What is socket.io used for](#What-is-socketio-used-for)
-   [Event-based architecture](#Event-based-architecture)
-   [socket io explanation](#socketio)
-   -   [in the client](#in-the-client)
-   -   [in the server](#in-the-server)
-   [Rooms](#Rooms)
-   [cheatsheet](#cheatsheet)
-   [The Module](#the-module)
-   -   [Installation](#installation)
-   -   [Server Side](#Server-Side)
-   -   [Client Side](#Client-Side)
-   [Extra exports](#Extra-exports)
-   -   [Generic events](#generic-events)
-   -   [Client](#Client)
-   -   -   [join and leave](#join-and-leave)
-   -   -   [extra hooks](#extra-hooks)
-   -   [Server](#Server)
-   -   -   [Authentication](#Authentication)
-   -   -   [Listening to changes to models](#Listening-to-changes-to-models)
-   -   -   -   [Listening in the client](#Listening-in-the-client)

## What is socket.io used for?

Socket.IO enables real-time bidirectional event-based communication. It consists of:

-   a Node.js server;
-   a Javascript client side;

socket.io is an implementation of the Event-based architecture in JavaScript. this means listening and emitting events. let's look at an example that we know from vanilla JS;

### Event-based architecture:

```js
window.addEventListener(SOME_EVENT, () => {
    /*...*/
});
```

In this example we are listening to an event: `addEventListener`;

In socket.io you can emit events which means when something is listening for a certain event the callback will be fired;

Before we get in to how this is handled in socket.io let's look at a simple example that illustrates the Event-based architecture;

```js
const EM = SOMETHING;

// listening to the 'foo' event;
EM.on("foo", (message) => {
    // this callback will be fired on the 'foo' event;
    console.log(message); // 'hello';
});

// the once method means that the callback will only be fired once on the 'foo' event;
EM.once("foo", (message) => {
    console.log(message); // 'hello';
});

// here we are actually emitting the 'foo' event which means the callback above will be fired. you can also send extra argumets to the callback;
EM.emit("foo", "hello");

// stop listening
EM.off("foo");
```

Pretty simple concept, right?

### socket.io

So how does this work in socket.io?

-   in the client you are listening to events that are emitted from the server;
-   in the server you are listening to events that are emitted from the client;

**You can't emit and listen between clients without the server!!**

Before we get into how you use socket.io with this module and loopback let's see how it works on its own:

#### in the client:

```js
import io from "socket.io-client";

// io is a function that connects to the server via the first parameter "localhost:8080". The second parameter is an object of options but we won't go over that here;
const socket = io("localhost:8080", { query: `token=${accessToken}` });
```

Now we have an instance of a socket in our client. The basic things you can do with it is listen to events and emit them:

```js
// here we are listening for the 'foo' event from the server;
socket.on("foo", () => {
    console.log("foo has happened!");
});

// here we are emitting the 'bar' event to the server;
socket.emit("bar");
```

#### in the server:

```js
const io = require("socket.io")(8080);

// the io here is different from the one in the client. here the io manages the different sockets in the server;
// we are listening for the 'connection' event which is emitted from the client when we do: 'io(namespace, options)';
// the 'connection' callback recieves a socket instance that is related to the client socket instance;
io.on("connection", (socket) => {
    // now here we can listen for events from the client. we cannot just do io.on('bar' () => {});
    // !!!!!! here we are listening for the equivalent socket that is in the client! not for every single socket;

    socket.on("bar", () => {
        // here  we are emitting back to the equivalent client!! not all the sockets recieve this!!
        socket.emit("foo");
    });
});
```

So now we've seen how to emit back and forth between the client and the server. But, how do we communicate between different sockets in the client and the server;

There are many ways. Let's look at one:

```js
// !! in the server;
// here we get access to all the sockets currently connected and we are emitting to all of them the event 'foo';
// (this will only be recieved in the clients. that's how its works, remember?)
io.sockets.emit("foo");
```

This isn't that great. The event gets emitted to all sockets. What if we had a case where we are listening for an event in a single socket and we use this method. the event will be emitted back to the sender too:

```js
io.on("connection", (socket) => {
    // now here we can listen for events from the client. we cannot just do io.on('bar' () => {});
    // !!!!!! here we are listening for the equivalent socket that is in the client! not for every single socket;

    socket.on("emitToAll", () => {
        // we are listening from the equivalent client for the 'emitToAll' event and in the server on that event we want to send a message to everyone but the equivalent client;
        io.sockets.emit("hi!");
    });
});
```

we can solve this like this:

```js
io.on("connection", (socket) => {
    socket.on("emitToAll", () => {
        // here we are emitting to all sockets EXCEPT the equivalent client;
        socket.broadcast.emit("hi", "hello friends!");
    });
});
```

#### Rooms

A core concept in socket.io is rooms which is a way to group sockets together;
Rooms are arbitrary channels that sockets can join and leave. Rooms are used to further-separate concerns. Rooms can only be joined on the server side. In the client there is no meaning to rooms. you can emit events to sockets that are in a certain room instead of sending to all sockets;

Let's look at an example of a use of rooms;
Say you have in your app two chats that update in real-time;
You want communication between the clients that are in each separate chat;
If you have an event `'message-recieved'` you don't want to get it from another socket that isn't in the same chat;
That's the idea of rooms;
Let's look at how we use rooms:

```js
io.on("connection", (socket) => {
    // the event 'join' is made up. it's not a specific event like 'connection';
    socket.on("join", (room) => {
        // here we are joining a room;
        socket.join(room);
    });

    // the event 'leave' is made up. it's not a specific event like 'connection';
    socket.on("leave", (room) => {
        // here we are leaving a room;
        socket.leave(room);
    });
});
```

That's how you join and leave a room;
Now emitting events to a specific room:

```js
io.on("connection", (socket) => {
    socket.on("emit-to-room", (room, event, ...moreStuff) => {
        // here we are emitting an event ONLY to the sockets in the room except the socket that emits it;
        socket.to(room).emit(event, ...moreStuff);
    });
});
```

Note that each socket in the server has a unique id and that socket is added to a room of that id. This means you can send to only one socket if you know what their id is;

### cheatsheet

Here is a cheatsheet that is included in the socket.io docs that explains all the different things you can do with emitting (the conept of namespaces is mentioned here but it isn't covered in this page):

```js
io.on("connection", (socket) => {
    // sending to the client
    socket.emit("hello", "can you hear me?", 1, 2, "abc");

    // sending to all clients except sender
    socket.broadcast.emit("broadcast", "hello friends!");

    // sending to all clients in 'game' room except sender
    socket.to("game").emit("nice game", "let's play a game");

    // sending to all clients in 'game1' and/or in 'game2' room, except sender
    socket.to("game1").to("game2").emit("nice game", "let's play a game (too)");

    // sending to all clients in 'game' room, including sender
    io.in("game").emit("big-announcement", "the game will start soon");

    // sending to all clients in namespace 'myNamespace', including sender
    io.of("myNamespace").emit(
        "bigger-announcement",
        "the tournament will start soon"
    );

    // sending to a specific room in a specific namespace, including sender
    io.of("myNamespace").to("room").emit("event", "message");

    // sending to individual socketid (private message)
    io.to(socketId).emit("hey", "I just met you");

    // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
    // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.

    // sending with acknowledgement
    socket.emit("question", "do you think so?", function (answer) {});

    // sending without compression
    socket.compress(false).emit("uncompressed", "that's rough");

    // sending a message that might be dropped if the client is not ready to receive messages
    socket.volatile.emit("maybe", "do you really need it?");

    // specifying whether the data to send has binary data
    socket.binary(false).emit("what", "I have no binaries!");

    // sending to all clients on this node (when using multiple nodes)
    io.local.emit("hi", "my lovely babies");

    // sending to all connected clients
    io.emit("an event sent to all connected clients");
});
```

So that's the basics of socket.io. The client side is very simple. You have basic Event-based architecture like: emit, on, once, off, disconnect... and the server is more complex: rooms, namespaces, emitting to certain clients...

### The module

**Now let's look at this module!!**

### installation:

### Server Side

##### example for how the server.js would loop is in serverExample.js

#### Add to your boot function in server.js file:

```js
boot(app, __dirname, (err) => {
    if (err) throw err;
    if (require.main === module) {
        // OPTIONS for socket: you can add { transports: ["websocket", "xhr-polling"] };
        // this means you'll be using websocket instead of polling (recommended);
        const options = { transports: ["websocket", "xhr-polling"] }; // ! Not required !
        // you can read more about the options here: https://socket.io/docs/server-api/

        // Here we need to add the Socket to our server, like so: require('socket.io')(SERVER, OPTIONS);
        // in loopback's case the SERVER is app.start();
        const io = require("socket.io")(app.start(), options);

        // now here we can do the usual io.on('connection' socket => { ... });

        // setting this means that you can use the io instance anywhere you use app;
        app.io = io;
    }
});
```

### Client Side

**The client side socket instance is based on the Context API from React**

#### providing the socket:

wrap your component tree with the SocketProvider component:

```jsx
import { SocketProvider } from "${path}/modules/socket.io";

<SocketProvider
    uri="localhost:8080"
    options={{ query: `token=${accessToken}` }}
>
    <App />
</SocketProvider>;
```

connecting to the socket depends on where you use SocketProvider as it connects before the initial render of the the component;

#### SocketProvider Props:

**uri (required):** The uri that we'll connect to, including the namespace, where '/' is the default one (e.g. http://localhost:4000/secret-admin);

**options (optional):** Any connect options that we want to pass along: https://socket.io/docs/client-api/#io-url-options

### Consuming the Socket instance:

The way the components get access to the socket instance is through the context object SocketContext, that you can import, but these next two ways are simpler:

1. In a class based components, You can wrap your component with `withSocket` and recieve the socket via the socket prop:

```jsx
import { withSocket } from "./${PATH}/modules/socket.io";

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };
    }

    componentDidMount() {
        this.props.socket.emit("join", this.props.chatId);

        this.props.socket.on("message-recieved", (message) => {
            this.setState(({ messages }) => ({
                messages: [...messages, message],
            }));
        });
    }

    render() {
        return (
            <div>
                {this.state.messages.map((message) => (
                    <div>{message}</div>
                ))}
            </div>
        );
    }
}

export default withSocket(MyComponent);
```

2. In a functional component, you can use the hook "useSocket":

```jsx
import { useSocket } from "./${PATH}/modules/socket.io";

const MyComponent = ({ chatId }) => {
    const [messages, setMessages] = usestate([]);
    const socket = useSocket();

    useEffect(() => {
        socket.emit("join", chatId);

        socket.on("message-recieved", (message) => {
            setMessages((messages) => [...messages, message]);
        });
    }, []);

    return (
        <div>
            {messages.map((message) => (
                <div>{message}</div>
            ))}
        </div>
    );
};

export default MyComponent;
```

That's the end of how you implenent the socket in React and Loopback;

### Extra Exports

### Generic events:

the file `genericEvents.js` includes some generic events like `'connection' 'disconnected'` and more. Other custom events are also included like `'JOIN' 'LEAVE'` events

#### Now let's look at the extra exports in the client and server:

### Client:

### join and leave:

**We added two methods to the socket:**

```ts
/**
* Emits the 'JOIN' event
* @param name The name of the room that we want to join
* @param fn An optional callback to call when we've joined the room. It should take an optional parameter, err, of a possible error
* @return This Socket
*/
join(name: string | string[], fn?: (err?: any) => void): SocketIOClient.Socket;
```

```ts
/**
* Emits the 'LEAVE' event
* @param name The name of the room to leave
* @param fn An optional callback to call when we've left the room. It should take on optional parameter, err, of a possible error
*/
leave(name: string, fn?: Function): SocketIOClient.Socket;
```

Note that the socket will not join or leave the room. This is just in the client. If you want to join or leave a room you need to listen to the events in the server or import the `generic-io-server.js` file and pass the `io` to it.

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

### Server:

### Authentication:

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

### Listening to changes to models:

\*\*if you have data that changes every few seconds/milliseconds rather don't use this because the data will only be emitted when it's added to the server which can take a while;

```js
const afterHookEmit = require(afterHookEmit_FILE_PATH);
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
        disableAfterDelete: true, // default false; means that when an instance of a model is deleted it won't emit (kind of buggy so make true for the meantime);
    },
];
```

Say we have the models AssistantRides and Rides. we want to listen for changes in AssistantRides and emit to the room name Rides.
if the AssistantRides instance is like this

```js
{ id: 234, rideId: 567, moreInfo: {} }
```

the emited event will be: `'Rides'` and will be sent to the `'Rides-567'` room, and will include the info that will look like this

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

#### Listening In the client:

```jsx
import { withSocket } from "./${PATH}/modules/socket.io";

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assistants: []
        };
    }

    async componentDidMount() {
        this.props.socket.on("Rides", (data) => {
            const { assistants } = data.include;
            this.setState({ assistants });
        });

        let [rideId, error] = await Auth.superAuthFetch(`/api/Rides/getRideId`);
        if (response.error || error) { console.error("ERR: ", error || response.error); return; }

        // in the server you need to listen to the 'join' event and join the room;
        this.props.socket.emit("join", `Rides-${rideId}`);
    }

    render() {
        return (
            <div>
                {this.state.assistants.map((assistant) => (
                    <div>{assistant}</div>
                ))}
            </div>
        );
    }
}

export default withSocket(MyComponent);
```
