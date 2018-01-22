import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Lobby from './components/lobby/lobby';
import Game from './components/game/game';
import io from 'socket.io-client';

let socket = io();

class App extends Component {

  state = {
    response: '',
    lobby: true,
  };

  componentDidMount(){
    this.callApi()
      .then(res => this.setState({response: res.express}))
      .catch(err => console.log(err));

    socket.on("cardsDealt", () =>{
      alert("CARDS DEALT!");
    });
    socket.on("playerJoined", () => {
      alert("hi!");
    });
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

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
        <Lobby />
        <Game />
      </div>
    );
  }
}

export default App;
