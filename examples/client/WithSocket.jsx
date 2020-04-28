import React, { Component } from 'react';

import { withSocket } from "./modules/socket.io";

class SomeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    componentDidMount() {
        this.props.socket.join('my-room');
    }
    render() { 
        return (
            <div>Some component with withSocket</div>
        );
    }
}
 
export default withSocket(SomeComponent);