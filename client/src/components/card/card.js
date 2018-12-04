/* 
    GENERATE A NEW PLAYING CARD DOM ELEMEN
    To use this component you must use a react tag as follows
    <Card value={"9"} suit={"h"}/>

    Props:
    this.props.deck : [bool] -display a stack of cards imitating a deck
    this.props.facedown: [bool] -whether the card should be displayed facedown
    this.props.color: [string] -"blue" or "red" backing color
    this.props.drawCard : [func]  - the function to run onClick
    this.props.style: [style obj] -pass down styles that are set
    this.props.empty: [bool] -if card should show that deck is empty

*/

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
        //Do Decks first
        if(this.props.deck === true){ 
            if(this.props.facedown === true && this.props.color === "red"){ return(
                    <div className="container">
                        <div className="card topcard facedown red"  onClick={(e) => this.props.drawCard()}></div>
                        <div className="card"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                    </div>
                )
            }
            if(this.props.facedown === true && this.props.color === "blue"){ return(
                    <div className="container">
                        <div className="card topcard facedown blue"  onClick={(e) => this.props.drawCard()}></div>
                        <div className="card"></div>
                        <div className="card"></div>
                        <div className="card"></div>
                    </div>
                )
            }
            if(this.props.facedown === true && (this.props.color === "empty" || !this.props.color)){ return(
                <div className="container">
                    <div className="card empty"  onClick={(e) => this.props.drawCard()}>
                        <p>EMPTY</p>
                    </div>
                </div>
            )
            }
        }
        //Single Cards
        else if(this.props.empty === true){
            return(
                <div className="card empty">
                    <p>EMPTY</p>
                </div>
              )
        }
        else if( suitProp === "" ){ return(
            <div className="card" data-value="" data-suit="" data-rank="" data-points="" >
            </div>
            )
        }
        //Single Face Down Cards
        else if( this.props.facedown === true){
            return(
                <div className={`card topcard facedown ${this.props.color}`}  style={this.props.style} onClick={(e) => this.props.drawCard()}></div>
            )
        }
        //Single Face Up Cards
        else if( suitProp === "h"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp} data-back={this.props.back}  data-rank={this.props.rank} data-points={this.props.points} onClick={(e) => this.cardSelected(e)}>
              <p className="value">{this.props.value}</p>
              <p className="suit">️♥</p>️ 
            </div>
            )
        }
        else if( suitProp === "d"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp} data-back={this.props.back}  data-rank={this.props.rank} data-points={this.props.points}  onClick={(e) => this.cardSelected(e)}>
              <p className="value" >{this.props.value}</p>
              <p className="suit" >♦️</p>️ 
            </div>
            )
        }
         else if( suitProp === "s"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp} data-back={this.props.back}  data-rank={this.props.rank} data-points={this.props.points}  onClick={(e) => this.cardSelected(e)}>
              <p className="value" >{this.props.value}</p>
              <p className="suit" style={Object.assign({}, blackInk)}>♠️</p>️ 
            </div>
            )
        }
        else if( suitProp === "c"){ return(
            <div className="card" data-value={this.props.value} data-suit={suitProp} data-back={this.props.back} data-rank={this.props.rank} data-points={this.props.points} onClick={(e) => this.cardSelected(e)}>              
              <p className="value" >{this.props.value}</p>
              <p className="suit" style={Object.assign({}, blackInk)}>♣️</p>️ 
            </div>
            )
        }
        else if( suitProp === "*"){ return(
            <div className="card joker" data-value={"Jo"} data-suit={"*"} data-back={this.props.back}  data-rank={this.props.rank} data-points={this.props.points} onClick={(e) => this.cardSelected(e)}>  
              <p className="value">Joker</p>
              <p className="suit" style={Object.assign({}, blackInk)}>&#9733;</p>️ 
            </div>
            )
        }
        else{
            console.log("Nothing was returned from <Card />");
            return(null)
        }
    }
}


export default Card;