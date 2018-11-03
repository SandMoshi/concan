import React, { Component } from 'react';
import { withRouter, Switch, Route, NavLink, Redirect }  from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

import Lobby from './components/lobby/lobby';
import Game from './components/game/game';

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', { forceNew: true });

class App extends Component {

  state = {
    response: '',
    lobby: true,
    userName: "",
    roomID: null,
    players: {},
  };

  componentDidMount(){
    // this.callApi()
    //   .then(res => this.setState({response: res.express}))
    //   .catch(err => console.log("error"));

    socket.on("cardsDealt", () =>{
      alert("CARDS DEALT!");
    });

    socket.on("newRoomCreated", (data) => {
        console.log("newRoomCreated");
        console.log(data);
        this.setState({roomID: data.roomID, socketID: data.socketID, players: data.players});
    });

    socket.on("playerJoined", (data) => {
      var socketID = data.socketID;   
      this.setState({
        players: data.players,
      })
    });

    socket.on("pingEveryone", (name) => {
      console.log("Ping Received from ", name);
      alert(name + " pinged you!");
    });

    socket.on("userToggled", (players) => {
      this.setState({
        players: players,
      })
    })
  }

  // callApi = async () => {
  //   const response = await fetch('/api/hello');
  //   const body = await response.json();
  //   console.log(response.status);
  //   if (response.status !== 200 ) throw Error(body.message);

  //   return body;
  // };

  setName = (name) => {
    this.setState({
      userName: name,
      socketID: socket.id,
    })
  }

  saveRoomNumber = (roomID) => {
    this.setState({
      roomID: roomID,
    })
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Concan</h1>
          <p className="App-intro">{this.state.response}</p>
        </header>
        <Switch>
            <Route exact path="/" render={(props) => 
              <Lobby {...props} socket={socket} setName={this.setName} userName={this.state.userName} saveRoomNumber={this.saveRoomNumber} roomID={this.state.roomID} />} />
						<Route exact path="/rooms/:roomID" render={(props) => 
              <Game {...props} socket={socket} userName={this.state.userName} roomID={this.state.roomID} players={this.state.players} socketID={this.state.socketID}/>}/>
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
