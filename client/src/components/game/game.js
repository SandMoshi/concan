import React, {Component} from 'react';
import Card from '../card/card';
import './game.css';

class Game extends Component {

    constructor(props){
        super();
        this.gameCode = this.gameCode.bind(this);
        this.moveCard = this.moveCard.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.getCards = this.getCards.bind(this);
        this.state = {
            hand: [],
            drawPile: null,
        };
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
        var selectedCards = this.findSelectedCards();
        selectedCards.forEach((card,index) => {
            var parentList = card.parentNode;
            if(direction === "left"){
                parentList.insertBefore(card,card.previousSibling);
            }
            if(direction === "right"){
                var nextCard = card.nextSibling;
                var i;
                for(i = 0 ; i < selectedCards.length; i++){
                    if(nextCard !== null){
                        nextCard = nextCard.nextSibling;
                    }
                }
                var referencePosition = nextCard;
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

    startNewGame(){
        this.getCards();
    }

    discardSelected(){
        var selected = this.findSelectedCards();
        //check to make sure only one card is selected
        if(selected.length !== 1){
            alert("You must discard exactly one card.");
            return;
        }
        //TODO make sure a card has been drawn first before discarding !!!!!!!!!!!!!!!!!!!!!!!!!

        //move from hand to discard pile

        //remove card from the DOM
        selected[0].remove();
    }

    getCards(){
        fetch("http://localhost:3000/api/dealCards")
        .then(results => {
            return results.text(); 
        })
        .then(data => {
            var newArray = JSON.parse(data).hand;
            // console.log(newArray);
            let timestamp = Date.now();

            let hand = newArray.map((card) => {
                // console.log(card);
                ++timestamp;
                return(
                    <Card key={timestamp} value={card.value} suite={card.suite} />
                )
            })

            var drawPileColor = JSON.parse(data).drawPileColor;

            var drawPile = <Card deck={true} facedown={true} color={drawPileColor} />
            this.setState({hand : hand, drawPile: drawPile});
        })
    }

    render(){
        return(
            <div className="Game">
                    <div className="felt">
                        <div className="deck">
                            {this.state.drawPile}
                        </div>
                        <div className="discard">
                             <Card value={"9"} suite={"h"}/>
                        </div>
                    </div>
                    <div className="playerHand">
                        {this.state.hand}
                    </div>
                    <div className="playerControls">
                        <button className="cardLeft" onClick={() => this.moveCard("left")}>Move Left</button>
                        <button className="cardRight" onClick={() => this.moveCard("right")}>Move Right</button>
                        <br />
                        <br />
                        <button className="newgame" onClick={() => this.startNewGame()}>Start New Game</button>
                        <br /> <br />
                        <button className="discard" onClick={() => this.discardSelected()}>Discard</button>
                    </div>
            </div>
        );
    }

}

export default Game;