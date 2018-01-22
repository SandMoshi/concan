// A LOBBY THAT ALLOWS YOU TO CREATE A NEW GAME OR JOIN EXISTING GAME

import React, { Component } from 'react';
import './lobby.css';

const io = require('socket.io-client');
const socket = io()


class Lobby extends Component{
    constructor(props){
        super();
        this.createNewRoom = this.createNewRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.state = {
            currentRoom: "Current Room: _______",
            visible: true,
        }

    }

    createNewRoom(e){
        e.preventDefault();
        //grab the data from the form
        this.setState({visible: false});
        console.log(this.guestName.value);
        var guestName = this.guestName.value;
        socket.emit("createNewRoom",guestName);
        
        socket.on("newRoomCreated", (data) => {
            console.log("newRoomCreated");
            console.log(data);
            var roomID = data.roomID;
            this.setState({currentRoom: roomID});
        });
    }
    
    joinRoom(e){
        e.preventDefault();
        this.setState({visible: false});
        var guestName = this.guestName.value;
        var room = this.room.value;
        socket.emit("joinRoomRequest",guestName, room);
    }


    render(){
        if(this.state.visible === true){
            return(
                <div className="lobby">
                    <form className="lobby_form">
                        <input name="Guest" placeholder="Guest Name" defaultValue="Sand" type="text" ref={guest => this.guestName = guest}></input>
                        <br/>
                        <input name="Room" placeholder="Room Number" type="text" ref={room => this.room = room}></input>
                        <br />
                        <button className="newRoom" onClick={(e) => this.createNewRoom(e)}>Create New Room</button>
                        <button className="joinRoom" onClick={(e) => this.joinRoom(e)}>Join Room</button>
                    </form>
                </div>
            )
        }
        else{
            return(
                <div className="lobby2">
                    <p className="roomID">Current Room: {this.state.currentRoom}</p>
                </div>
            )
        }
    }

}

export default Lobby;