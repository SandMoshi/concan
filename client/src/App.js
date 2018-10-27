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
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    console.log(response.status);
    if (response.status !== 200 ) throw Error(body.message);

    return body;
  };


  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Concan</h1>
          <p className="App-intro">{this.state.response}</p>
        </header>
        <Lobby socket={socket} />
        <Game socket={socket} />
      </div>
    );
  }
}

export default App;
