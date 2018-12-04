import React, {Component} from 'react';
import Card from '../card/card';
import {Redirect} from 'react-router-dom';
import RoomManifest from '../roommanifest/roommanifest';
import './game.css';

class Game extends Component {

    constructor(props){
        super(props);
        this.socket = null;
        this.moveCard = this.moveCard.bind(this);
        this.startNewGame = this.startNewGame.bind(this);
        this.updateDiscard = this.updateDiscard.bind(this);
        this.playerJoined = this.playerJoined.bind(this);
        this.state = {
            hand: [],
            drawPile: null,
            drawPileColor: null,
            discardPile: <Card  empty={true} />,
            discardsuit: "",
            discardValue: "",
            dealer: null,
            playerName: "",
            messageToRoom: null,
            hand: null,
            hands: {},
            players: this.props.players,
            seats:{},
            player2: null,
            player3: null,
            player4: null,
            prevPlayer: null,
            nextPlayer: null,
            currentTurn: null,
            // $playerID :{
            //     name: string,
            //     socketID: $playerID,
            //     isHost: bool,
            //     isReady: bool,
            //     seat: int,
            //     hand: [],
            // }
        };
    }

    componentWillMount(){
        this.socket = this.props.socket;
    }

    componentDidMount(){
        // this.cardSelected();
        // this.socket.on("playerJoined", this.playerJoined);
        this.socket.on('newDealer', (dealerID) => this.newDealer(dealerID));
        //yourHand
        this.socket.on('yourHand', (data) => this.updateHand(data));
        //drawPileColorUpdate
        this.socket.on('drawPileColorUpdate', (color) => {this.updateDrawPile(color)})
        //discardPileUpdate
        this.socket.on('discardPileUpdate', (discardPile) => {
            this.updateDiscard(discardPile);
        })
        //otherHand
        this.socket.on('otherHand', (data) => 
        {console.log('OtherHand Received!', data);
        this.updateOtherHand(data)}
        );
        //updateSeats
        this.socket.on('updateSeats', (seats) => this.updateSeats(seats));
        //newTurn
        this.socket.on('newTurn', (data) => this.turnChange(data));
        //cardDiscarded
        this.socket.on('cardDiscarded', (data) => {
            if(data.hand){
                this.updateHand(data.hand);
                this.updateDiscard(data.discardPile);
                console.log("END THIS TURN!");
                this.socket.emit('endTurn', {
                    socketID: this.props.socketID,
                    roomID: this.props.roomID,
                });
            }
            else{
                this.updateOtherHand({
                    hand: data.sanitizedHand,
                    socketID: data.socketID,
                });
                this.updateDiscard(data.discardPile);
            }
        });
        //cardDrawn
        this.socket.on('cardDrawn', (data) => {
            if(data.hand){
                this.updateHand(data.hand);
            }
            else{
                this.updateOtherHand({
                    hand: data.sanitizedHand,
                    socketID: data.socketID,
                })
            }
            this.updateDrawPile(data.drawPileColor);
        })
    }

    playerJoined(){
        console.log("YAY PLAYER joined!");
    }

    updateSeats = (seats) => {

        var socketID = null;
        var mySeat = null;
        var seatNumber = null;
        var updatedSeats = {};
        var seatsByID = {};
        //Find their seat and what position they will be displayed as sitting in (Local Player is always shown Position A regardless of Seat #)

            //First find my seat
        for(var i = 1; i < 5; i++){
            if(seats[i] === this.props.socketID){
                mySeat = i;
            }
        }
        //Now assign positions for each seat
        for(var i = 1; i < 5; i++){
            seatNumber = i;
            //How many seats are they sitting away from you
            var seatDifference = seatNumber - mySeat;
            //Their seat letter (a/b/c/d) is...
            console.log("seatDiff", seatDifference, "my",mySeat,"seatN",seatNumber);
            if(seatDifference === 0){
                //Then that is me, so ignore it
                var theirPosition = "A";
            }
            else if(seatDifference > 0){
                var possiblePositions = ["A","B","C","D"];
                var theirPosition = possiblePositions[seatDifference]
            }
            else if(seatDifference < 0){
                var possiblePositions = ["A","B","C","D"].reverse();
                var theirPosition = possiblePositions[(seatDifference * -1) - 1]
            }
            updatedSeats[i] = {
                socketID : seats[i],
                position: theirPosition,
            }

            seatsByID[seats[i]] = {
                seats: i,
                position: theirPosition,
            } 
        }


        this.setState({
            seats: updatedSeats,
            seatsByID: seatsByID,
        })
    }

    updateDrawPile = (color) => {
        var drawPile = <Card deck={true} facedown={true} color={color} drawCard={this.requestDrawCard} />;

        console.log("drawPile", drawPile);

        this.setState({
            drawPile: drawPile
        })
    }

    updateOtherHand = (data) => {
        var hand = data.hand;
        var socketID = data.socketID;
        var mySeat = null;
        var seatNumber = null;
        //Find their seat and what position they will be displayed as sitting in (Local Player is always shown Position A regardless of Seat #)

        if(!this.state.seats || !this.state.seatsByID){ throw new Error("No Seats in State")};

        var theirPosition = this.state.seatsByID[socketID].position;

        this.customStyle = (type,index) => {
        switch(theirPosition){
            case "B":
                if(type === "card"){
                    return {
                        top: `${index * 10}px`,
                        right: `0`,
                    }
                }
                else if(type === "label"){
                    return {
                        top: `${index * 10 + 80}px`,
                    }
                }
            case "C":
                if(type === "card"){
                    return {
                        right: `${index * 10}px`,
                        top: '10px',
                    }
                }
                else if(type === "label"){
                    return {
                        right: `${index * 10 + 80}px`,
                    }
                }
            case "D":
                if(type === "card"){
                    return {
                        top: `${index * 10}px`,
                        left: '0',
                    }
                }
                else if(type === "label"){
                    return {
                        top: `${index * 10 + 80}px`,
                    }
                }
            }
        }

        hand = hand.map( (color, index) => {
            return <Card facedown={true} color={color} key={`${socketID}-${index}`} style={this.customStyle("card", index)}/>; 
        })
        //add Counter
        hand.push(
            <div key={`label-card-count-${theirPosition}`} className="label--card-count" style={this.customStyle("label", hand.length)}>
                {hand.length}
            </div>
        )

        console.log("Their Position:", theirPosition, "seat #:", seatNumber);

        var objName = `player${theirPosition}`;
        this.setState({
            hands: {
                ...this.state.hands,
                [socketID]: hand
            },
            [objName]: hand,
        })
    }

    updateHand = (hand) =>{
        console.log("data:", hand);
        var myHand = [];
        hand.forEach( (card, index) => {
            var card = <Card value={card.value} suit={card.suit} back={card.back} rank={card.rank} points={card.points} key={`myhand-${card.value}${card.suit}-${index}`}/>;
            myHand.push(card);
        })
        
        console.log("hand:", hand);
        //update state to force render
        this.setState({hand: myHand});
    }

    turnChange = (data) => {
        var prevPlayer = data.prevPlayer;
        var nextPlayer = data.nextPlayer;
        var currentTurn = this.state.seats[nextPlayer].position;


        this.setState({
            prevPlayer: prevPlayer,
            nextPlayer: nextPlayer,
            currentTurn: currentTurn,
            messageToRoom: [...this.state.messageToRoom,<p>Player {prevPlayer}'s turn has ended.</p>,<p>Player {nextPlayer}'s turn has begun.</p>],
        })

    }

    // cardSelected(){
    //     //toggle if a card is selected
    //     var cards = document.getElementsByClassName("card");
    //     [].forEach.call(cards, (card)=>{
    //         card.addEventListener('click',()=>{
    //             card.classList.toggle("selected");
    //         })
    //     })
    // }

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

    toggleReady = () =>{
        this.socket.emit("toggleReady", {
            socketID: this.props.socketID,
            roomID: this.props.roomID,
        })
    }

    startNewGame(){
        //Make sure everyone is ready
        var players = this.props.players;
        for (var player in players){
            if(players[player].isReady === false){
                alert("Not All Players Ready!");
                break;
            }
        }

        this.socket.emit("startNewGame",{roomID: this.props.roomID});
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

        console.log(selected[0]);
        var faceValue = selected[0].dataset.value;
        var suitValue = selected[0].dataset.suit;
        var backValue = selected[0].dataset.back;

        //move from hand to discard pile
        this.socket.emit('discardCard', {
            value: faceValue,
            suit: suitValue,
            back: backValue,
            socketID: this.props.socketID,
            roomID: this.props.roomID,
        })
    }
    
    updateDiscard(data){
        //Updates the discard pile with the last few discarded cards
        //Note, server only sends the most recent 3 discards for display

        var discardPile = data.map( (card) => {
            return <Card value={card.value} suit={card.suit} rank={card.rank} points={card.points} 
                    key={`discard-${card.value}-${card.suit}`}  />
        })
        this.setState({
            discardPile: discardPile,
        })
    }
    
    requestDrawCard = () => {
        console.log(this.props.socketID , 'requesting to draw a card !');
        //Rquest to draw a card
        this.socket.emit('drawCard', {socketID: this.props.socketID, roomID: this.props.roomID});
    }


    newDealer = (dealerID) => {
        console.log("new dealer is:" + dealerID);
        var dealerName = this.props.players[dealerID].name;
        var message = 
                <p>{dealerName} is now the dealer.</p>

        this.setState({
            dealer: dealerID,
            messageToRoom: [message],
        })
    }

    placeCardSet = () => {
        const selected = this.findSelectedCards();
        //Make sure enough cards are selected
        if(selected.length < 3){
            alert('You need to drop at least 3 cards');
            return;
        }

        const cardData = selected.map( card => {
            return {
                value: card.dataset.value, 
                suit: card.dataset.suit, 
                back: card.dataset.back,
                rank: card.dataset.rank,
                points: card.dataset.points,
            }
        })



        //Check if all the suits are the same
        const suitCheck = cardData.every( (card) => {
            return card.suit === cardData[0].suit;
        });

        console.log('cardData', cardData);

        //Check if the cards are in a sequence
        cardData.sort( (a,b) => {
            //Check for joker
            if(a.rank == 15 || b.rank == 15){
                return 0;
            }
            //Check for Ace with a 2 or 3
            if( (a.rank == 14 && (b.rank < 8))){
                return -1; 
            }
            if( (b.rank == 14 && (a.rank < 8))){
                return 1; 
            }
            return a.rank - b.rank
        })

        console.log("sorted cards", cardData);
    }

    convert2Number = (value) => {

    }

    render(){
        if(!this.props.roomID || this.props.match.params.roomID != this.props.roomID) return( <Redirect to={"/"} />)

        return(
            <div className="Game">
                    <p className="playerName">Connected Player: {this.props.userName}</p>
                    {this.state.prevPlayer}
                    {this.state.nextPlayer}
                    <div className="Menu">
                        <RoomManifest socket={this.socket} players={this.props.players} roomID={this.props.roomID} dealer={this.state.dealer}/>
                        <div className="MessageBox">
                            {this.state.messageToRoom}
                        </div>
                        <div className="playerControls">
                            <button className="ready" onClick={this.toggleReady}>Ready</button>
                            <button className="newgame" onClick={() => this.startNewGame()}>Start New Game</button>
                            <br />
                            <button className="ping" onClick={() => this.pingEveryone()}>Ping Everyone!</button>
                            <br />
                            <button className="cardLeft" onClick={() => this.moveCard("left")}>Move Left</button>
                            <button className="cardRight" onClick={() => this.moveCard("right")}>Move Right</button>
                            <br />
                            <button className="discard" onClick={() => this.discardSelected()}>Discard</button>
                            <br />
                            <button className="draw" onClick={() => this.requestDrawCard()}>Draw Card</button>
                            <button className="place" onClick={() => this.placeCardSet()}>Place Set</button>
                            <br />
                        </div>
                    </div>
                    <div className="felt">
                        <div className="deck">
                            <p className="area--label">Deck</p>
                            {this.state.drawPile}
                        </div>
                        <div className="discard">
                            <p className="area--label">Discard Pile</p>
                            {this.state.discardPile}
                        </div>
                        <div className={`player playerHand seat-a seat ${this.state.currentTurn === "A" ? " currentTurn" : ""}`}>
                                <div className="hand-container">
                                    {this.state.hand}
                                </div>
                        </div>
                        <div className={`player seat-b seat ${this.state.currentTurn === "B" ? " currentTurn" : ""}`}>
                            <div className="hand-container">
                                {this.state.playerB}
                            </div>
                        </div>
                        <div className={`player seat-c seat ${this.state.currentTurn === "C" ? " currentTurn" : ""}`}>
                            <div className="hand-container">
                                {this.state.playerC}
                            </div>
                        </div>
                        <div className={`player seat-d seat ${this.state.currentTurn === "D" ? " currentTurn" : ""}`}>
                            <div className="hand-container">
                                {this.state.playerD}
                            </div>
                        </div>
                    </div>
            </div>
        );
    }

}

export default Game;