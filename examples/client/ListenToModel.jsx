import React, { Component } from 'react';

import { withSocket } from "./${PATH}/modules/socket.io";

class MyComponent extends Component {
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