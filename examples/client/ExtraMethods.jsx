import React, { Component } from 'react';

import { withSocket } from "./${PATH}/modules/socket.io";

class MyComponent extends Component {

    async componentDidMount() {
        // joining:

        // option 1:
        try {
            await this.props.socket.join("room-1");
            console.log("joined room: 'room-1'");
        } catch (err) {
            console.log("failed to join room 'room-1'");
        }

        // option 2:
        this.props.socket.join("room-1", err => {
            if (err) { console.log("failed to join room 'room-1'"); return; }
            console.log("joined room: 'room-1'");
        });
    }

    async getRooms() {
        // getRooms:

        // option 1:
        const rooms = await this.props.socket.getRooms();
        console.log(rooms);

        // option 2:
        this.props.socket.getRooms(rooms => {
            console.log(rooms);
        });
    }

    async componentWillUnmount() {
        // leaving:

        await this.props.socket.leave("room-1");
        console.log("left room: 'room-1'");

        // option 2:
        this.props.socket.join("room-1", () => {
            console.log("left room: 'room-1'");
        });
    }

    render() {
        return null;
    }
}

export default withSocket(MyComponent);