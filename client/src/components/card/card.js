//GENERATE A NEW PLAYING CARD DOM ELEMENT
//To use this component you must use a react tag as follows
// <Card value={"9"} suite={"h"}/>

import React, { Component } from 'react';
import './card.css';

const blackInk = {
    color: 'black'
}

var suiteProp;

class Card extends Component {
    constructor(props){
        super();
    }

    // componentWillMount(){
    // }

    // componentDidUpdate(){
    // }
    
    render(){
        suiteProp = this.props.suite;
        if( suiteProp === "h"){ return(
            <div className="card">
              <p className="value">{this.props.value}</p>
              <p className="suite">️♥</p>️ 
            </div>
            )
        }
        else if( suiteProp === "d"){ return(
            <div className="card">
              <p className="value" >{this.props.value}</p>
              <p className="suite" >♦️</p>️ 
            </div>
            )
        }
         else if( suiteProp === "s"){ return(
            <div className="card">
              <p className="value" >{this.props.value}</p>
              <p className="suite" style={Object.assign({}, blackInk)}>♠️</p>️ 
            </div>
            )
        }
        else if( suiteProp === "c"){ return(
            <div className="card">
              <p className="value" >{this.props.value}</p>
              <p className="suite" style={Object.assign({}, blackInk)}>♣️</p>️ 
            </div>
            )
        }
        else if( suiteProp === "*"){ return(
            <div className="card joker">
              <p className="value">Joker</p>
              <p className="suite" style={Object.assign({}, blackInk)}>&#9733;</p>️ 
            </div>
            )
        }
    }
}


export default Card;