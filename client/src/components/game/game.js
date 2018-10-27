import React, {Component} from 'react';
import Card from '../card/card';
import './game.css';

class Game extends Component {

    constructor(props){
        super();
        this.socket = null;
        this.moveCard = this.moveCard.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.getCards = this.getCards.bind(this);
        this.updateDiscard = this.updateDiscard.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.getDealer = this.getDealer.bind(this);
        this.getPlayer = this.getPlayer.bind(this);
        this.playerJoined = this.playerJoined.bind(this);
        this.state = {
            hand: [],
            drawPile: null,
            discardsuit: "",
            discardValue: "",
            dealer: null,
            playerName: "",
        };
    }

    componentWillMount(){
        this.socket = this.props.socket;
    }

    componentDidMount(){
        this.cardSelected();
        this.socket.on("cardDiscarded", this.updateDiscard);
        this.socket.on("playerJoined", this.playerJoined);
    }

    playerJoined(){
        console.log("YAY PLAYER joined!");
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
        this.getDealer();
        this.getCards();
    }

    pingEveryone = () =>{
        this.socket.emit('pingEveryone', {
            name: this.props.userName,
            roomID: this.props.roomID,
        });
    }
    
    discardSelected(){
        var selected = this.findSelectedCards();
        //check to make sure only one card is selected
        if(selected.length !== 1){
            alert("You must discard exactly one card.");
            return;
        }
        //TODO make sure a card has been drawn first before discarding !!!!!!!!!!!!!!!!!!!!!!!!!
        console.log(selected[0]);
        var faceValue = selected[0].dataset.value;
        var suitValue = selected[0].dataset.suit;
        //move from hand to discard pile
        fetch("http://localhost:3000/api/discardCard", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: faceValue, 
                suit: suitValue,
                player: "1",
            }),
        })
        //remove card from the DOM
        selected[0].remove();
    }
    
    updateDiscard(data){
        console.log(data);
        // data = JSON.parse(data);
        this.setState({
            discardValue: data.value,
            discardsuit: data.suit
        })
    }
    
    getPlayer(){
        fetch("http://localhost:3000/api/getPlayerName")
            .then(response => {
                if(!response.ok){
                    alert("There was an error. Code 002");
                    return;
                }
                else{
                    return response.text();      
                }
            })
            .then(data => {
                data = JSON.parse(data);
                var playerName = data.playerName;
                this.setState({playerName : playerName});
            })
    }

    getDealer(){
        fetch("http://localhost:3000/api/chooseDealer")
        .then(response => {
            // console.log(response);
            if(!response.ok){
                alert("There was an error. Code 001.");
                return;
            }
            return response.text();
        })
        .then(data => {
            data = JSON.parse(data);
            var dealer = <p className="dealer">Player {data.dealerName} is the dealer. You are player {this.state.playerName}.</p>;
            //update the state to force render
            this.setState({dealer: dealer});
        })
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
                    <Card key={timestamp} value={card.value} suit={card.suit}  />
                )
            })

            var drawPileColor = JSON.parse(data).drawPileColor;

            var drawPile = <Card deck={true} facedown={true} color={drawPileColor} drawCard={this.drawCard}/>
            this.setState({hand : hand, drawPile: drawPile});
        })
    }

    drawCard(){
        fetch("http://localhost:3000/api/drawCard")
        .then(response => {
            // console.log(response);
            // console.log(response.ok);
            if(!response.ok){
                if(response.status === 901){
                    alert("Cannot draw card right now. You cannot have more than 14 cards in your hand.");
                }
                if(response.status === 902){
                    alert("Player has already drawn a card this turn!");
                }
                return;
            }
            return response.text();
        })
        .then(data => {
            console.log(data);
            data = JSON.parse(data);
            //add new card to hand
            var nextCard = data.nextCard[0];
            let timestamp = Date.now();
            var hand = this.state.hand;
            var card = <Card key={timestamp} value={nextCard.value} suit={nextCard.suit} />;
            hand.push(card);

            //update the pile color
            var drawPileColor  = data.drawPileColor;
            var drawPile = <Card deck={true} facedown={true} color={drawPileColor} drawCard={this.drawCard}/>
            
            //update state to force render
            this.setState({hand: hand, drawPile: drawPile});
        })
        .catch(()=>{
            // do nothing
        })
    }

    render(){
        return(
            <div className="Game">
                    <p className="playerName">Connected Player: {this.state.playerName}</p>     
                    <div className="felt">
                        <div className="deck">
                            {this.state.drawPile}
                        </div>
                        <div className="discard">
                             <Card value={this.state.discardValue} suit={this.state.discardsuit}/>
                        </div>
                    </div>
                    <div className="playerHand">
                        {this.state.hand}
                    </div>
                    <div className="playerControls">
                        <button className="ping" onClick={() => this.pingEveryone()}>Ping Everyone!</button>
                        <button className="cardLeft" onClick={() => this.moveCard("left")}>Move Left</button>
                        <button className="cardRight" onClick={() => this.moveCard("right")}>Move Right</button>
                        <br />
                        <br />
                        <button className="newgame" onClick={() => this.startNewGame()}>Start New Game</button>
                        <br /> <br />
                        <button className="discard" onClick={() => this.discardSelected()}>Discard</button>
                        <br /> <br />
                        <button className="draw" onClick={() => this.drawCard()}>Draw Card</button>
                        <br />
                        {this.state.dealer}
                    </div>
            </div>
        );
    }

}

export default Game;