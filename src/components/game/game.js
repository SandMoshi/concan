import React, {Component} from 'react';
import Card from '../card/card';
import './game.css';

class Game extends Component {

    constructor(props){
        super();
        this.gameCode = this.gameCode.bind(this);
        this.moveCard = this.moveCard.bind(this);
    }

    gameCode(){

    }

    componentDidMount(){
        this.gameCode();
        this.cardSelected();
    }

    cardSelected(){
        //toggle if a card is selected
        var cards = document.getElementsByClassName("card");
        [].forEach.call(cards, (card)=>{
            card.addEventListener('click',()=>{
                card.classList.toggle("selected");
            })
        })
    }

    moveCard(direction){
        //moves cards in either direction in player's hand
        console.log("move card to " + direction);
        var selectedCards = this.findSelectedCards();
        selectedCards.forEach((card,index) => {
            var parentList = card.parentNode;
            if(direction === "left"){
                parentList.insertBefore(card,card.previousSibling);
            }
            if(direction === "right"){
                var nextCard = card.nextSibling;
                if(nextCard !== null){
                    var referencePosition = nextCard.nextSibling;
                }
                parentList.insertBefore(card,referencePosition);
            }
        })
    }

    findSelectedCards(){
        //returns array of selected cards are currently selected
        var selectedElements = document.getElementsByClassName("selected");
        var selected = [];
        var i = 0;
        //convert to array
        [].forEach.call(selectedElements, (card) => {
            selected[i] = card;
            i++;
        })
        return selected;
    }

    render(){
        return(
            <div className="Game">
                    <div className="playerHand">
                        <Card value={"9"} suite={"h"}/>
                        <Card value={"A"} suite={"c"}/>
                        <Card value={"Q"} suite={"s"}/>
                        <Card value={"J"} suite={"d"}/>
                        <Card value={"4"} suite={"d"}/>
                        <Card value={"5"} suite={"d"}/>
                        <Card value={"6"} suite={"d"}/>
                        <Card value={"K"} suite={"h"}/>
                        <Card value={"K"} suite={"s"}/>
                        <Card value={"K"} suite={"d"}/>
                        <Card value={"9"} suite={"s"}/>
                        <Card value={"9"} suite={"h"}/>
                        <Card value={"9"} suite={"c"}/>
                        <Card value={"2"} suite={"d"}/>
                        <Card value={"8"} suite={"s"}/>
                    </div>
                    <div className="playerControls">
                        <button className="cardLeft" onClick={() => this.moveCard("left")}>Move Left</button>
                        <button className="cardRight" onClick={() => this.moveCard("right")}>Move Right</button>
                    </div>
            </div>
        );
    }

}

export default Game;