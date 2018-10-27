import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Lobby from './components/lobby/lobby';
import Game from './components/game/game';

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000');

class App extends Component {

  state = {
    response: '',
    lobby: true,
    userName: "",
    roomID: "",
  };

  componentDidMount(){
    // this.callApi()
    //   .then(res => this.setState({response: res.express}))
    //   .catch(err => console.log("error"));

    socket.on("cardsDealt", () =>{
      alert("CARDS DEALT!");
    });

    socket.on("playerJoined", () => {
      alert("hi!");
      console.log("YAY!!!!!!!!!!!!!!!!!!!!");
    });

    socket.on("pingEveryone", (name) => {
      console.log("Ping Received from ", name);
      alert(name + " pinged you!");
    });
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    console.log(response.status);
    if (response.status !== 200 ) throw Error(body.message);

    return body;
  };

  setName = (name) => {
    this.setState({
      userName: name,
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
        <Lobby socket={socket} setName={this.setName} userName={this.state.userName} saveRoomNumber={this.saveRoomNumber}/>
        <Game socket={socket} userName={this.state.userName} roomID={this.state.roomID}/>
      </div>
    );
  }
}

export default App;
