/* 

    this.props.socket
    this.props.users
    this.props.roomID

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
            var isReady = this.props.players[uid].isReady ? "ready" : "not-ready";
            return(
                <li className="user" key={`manifest-user-${uid}`}>
                    <div className={`indicator ${isReady}`} >
                    </div>
                    <span>{this.props.players[uid].name}</span>
                    <span className="host--label">{this.props.players[uid].isHost ? "(Host)" : ""}</span>
                    {this.props.dealer === uid ? 
                        <span className="dealer--label">ⅅ</span>
                        : null
                    }
                </li>
            )
        })

        return(
            <div className="manifest">
                <p className="roomID">Room: <span>{this.props.roomID}</span></p>
                <h4 className="title">Players</h4>
                <ul className="list">
                    {roomMembers}
                </ul>
            </div>
        )
    }
}

export default RoomManifest;