// A LOBBY THAT ALLOWS YOU TO CREATE A NEW GAME OR JOIN EXISTING GAME

import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
import './lobby.css';

class Lobby extends Component{
    constructor(props){
        super();
        this.socket = null;
        this.createNewRoom = this.createNewRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.state = {
            visible: true,
        }
    }

    componentWillMount(){
        this.socket = this.props.socket;
    }

    componentDidMount(){
        console.log("yay");
        console.log(this.socket);
        // this.socket.on("newRoomCreated", (data) => {
        //     console.log("newRoomCreated");
        //     console.log(data);
        //     var roomID = data.roomID;
        //     this.props.saveRoomNumber(roomID);
        //     this.setState({currentRoom: roomID, author: data.author});
        // });

        this.socket.on("joinRoomSuccess", (roomID) => {
            this.props.saveRoomNumber(roomID);
        })
    }

    createNewRoom(e){
        e.preventDefault();
        //grab the data from the form
        this.setState({visible: false});
        var userName = this.guestName.value;
        console.log("guestName:", userName);
        this.socket.emit("createNewRoom", userName);
        this.props.setName(userName);
    }
    
    joinRoom(e){
        e.preventDefault();
        this.setState({visible: false});
        var userName = this.guestName.value;
        var room = this.room.value;
        this.socket.emit("joinRoomRequest", userName, room);
        this.props.setName(userName);
    }


    render(){
        // if(this.state.visible === true){
        if(!this.props.roomID){
            return(
                <div className="lobby">
                    <form className="lobby_form">
                        <input name="Guest" placeholder="Guest Name" defaultValue="Sand" type="text" ref={guest => this.guestName = guest}></input>
                        <br/>
                        <input name="Room" placeholder="Room Number" type="text" ref={room => this.room = room}></input>
                        <br />
                        <button className="newRoom" onClick={(e) => this.createNewRoom(e)}>Create a New Room</button>
                        <button className="joinRoom" onClick={(e) => this.joinRoom(e)}>Join a Room</button>
                    </form>
                </div>
            )
        }
        else{
            return(
                <Redirect to={`/rooms/${this.props.roomID}`} />
                // <div className="lobby2">
                //     <p className="roomID">Current Room: {this.props.roomID}</p>
                // </div>
            )
        }
    }

}

export default Lobby;