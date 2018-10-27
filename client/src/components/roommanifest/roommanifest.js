/* 

    this.props.socket
    this.props.users

*/

import React, {Component} from 'react';
import './roommanifest.css';

class RoomManifest extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }

    componentWillMount(){
        this.socket = this.props.socket;
    }

    render(){

        var roomMembers = Object.keys(this.props.players).map( (uid) =>{
            return(
                <li className="user" key={`manifest-user-${uid}`}>
                    <div className="indicator">
                    </div>
                    <span>{this.props.players[uid].name}</span>
                    <span className="host--label">{this.props.players[uid].isHost ? "(Host)" : ""}</span>
                </li>
            )
        })

        return(
            <div className="manifest">
                <h4 className="title">Players</h4>
                <ul className="list">
                    {roomMembers}
                </ul>
            </div>
        )
    }
}

export default RoomManifest;