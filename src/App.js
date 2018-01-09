import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Game from './components/game';
import Card from './components/card';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Concan</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Game />
        <Card value={"9"} suite={"h"}/>
        <Card value={"A"} suite={"c"}/>
        <Card value={"Q"} suite={"s"}/>
        <Card value={"J"} suite={"d"}/>
      </div>
    );
  }
}

export default App;
