import React, { Component } from 'react';
import './card.css';

const cardStyle = {
    //
};

const valueStyle = {
    color: 'black',
    fontSize: '20px',
    position: 'absolute',
    top: '4px',
    left: '5px',
    fontWeight: '600',
    margin: '0px'
};

const blackInk = {
    color: 'black'
}

const suiteStyle = {
    position: 'absolute',
    top: '18px',
    left: '4px',
    margin: '0px',
    fontSize: '24px',
    color: 'red'
}

var suiteProp;

class Card extends Component {
    constructor(props){
        super();
    }

    componentWillMount(){
        suiteProp = this.props.suite;
    }

    render(){
        
        if( suiteProp === "h"){ return(
            <div className="card" style={cardStyle}>
              <p className="value" style={valueStyle}>{this.props.value}</p>
              <p className="suite" style={suiteStyle}>️♥</p>️ 
            </div>
            )
        }
        if( suiteProp === "d"){ return(
            <div className="card" style={cardStyle}>
              <p className="value" style={valueStyle}>{this.props.value}</p>
              <p className="suite" style={suiteStyle}>♦️</p>️ 
            </div>
            )
        }
        if( suiteProp === "s"){ return(
            <div className="card" style={cardStyle}>
              <p className="value" style={valueStyle}>{this.props.value}</p>
              <p className="suite" style={Object.assign({}, suiteStyle, blackInk)}>♠️</p>️ 
            </div>
            )
        }
        if( suiteProp === "c"){ return(
            <div className="card" style={cardStyle}>
              <p className="value" style={valueStyle}>{this.props.value}</p>
              <p className="suite" style={Object.assign({}, suiteStyle, blackInk)}>♣️</p>️ 
            </div>
            )
        }
    }
}


export default Card;