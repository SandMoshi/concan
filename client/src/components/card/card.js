//GENERATE A NEW PLAYING CARD DOM ELEMENT
//To use this component you must use a react tag as follows
// <Card value={"9"} suit={"h"}/>

import React, { Component } from 'react';
import './card.css';

const blackInk = {
    color: 'black'
}

var suitProp;

class Card extends Component {
    constructor(props){
        super();
        this.cardSelected = this.cardSelected.bind(this);
    }

    cardSelected(e){
        //toggle if a card is selected
        var card = e.target;
        if(card.classList.contains("value") || card.classList.contains("suit")){
            card = card.parentElement;
        }
        card.classList.toggle("selected");
    }


    render(){
        suitProp = this.props.suit;
        if(this.props.deck === true){ 
            if(this.props.facedown === true && this.props.color === "red"){ return(
                    <div className="container">
                        <div className="card topcard facedown red"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                    </div>
                )
            }
            if(this.props.facedown === true && this.props.color === "blue"){ return(
                    <div className="container">
                        <div className="card topcard facedown blue"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                    </div>
                )
            }
        }
        else if( suitProp === "" ){ return(
            <div className="card" data-value="" data-suit="" >
            </div>
            )
        }
        else if( suitProp === "h"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp} onClick={(e) => this.cardSelected(e)}>
              <p className="value">{this.props.value}</p>
              <p className="suit">️♥</p>️ 
            </div>
            )
        }
        else if( suitProp === "d"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp}  onClick={(e) => this.cardSelected(e)}>
              <p className="value" >{this.props.value}</p>
              <p className="suit" >♦️</p>️ 
            </div>
            )
        }
         else if( suitProp === "s"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp}  onClick={(e) => this.cardSelected(e)}>
              <p className="value" >{this.props.value}</p>
              <p className="suit" style={Object.assign({}, blackInk)}>♠️</p>️ 
            </div>
            )
        }
        else if( suitProp === "c"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp}  onClick={(e) => this.cardSelected(e)}>              
              <p className="value" >{this.props.value}</p>
              <p className="suit" style={Object.assign({}, blackInk)}>♣️</p>️ 
            </div>
            )
        }
        else if( suitProp === "*"){ return(
            <div className="card joker" data-value={"Jo"} data-suit={"*"} onClick={(e) => this.cardSelected(e)}>  
              <p className="value">Joker</p>
              <p className="suit" style={Object.assign({}, blackInk)}>&#9733;</p>️ 
            </div>
            )
        }
    }
}


export default Card;