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
        this.getCards = this.getCards.bind(this);
        this.updateDiscard = this.updateDiscard.bind(this);
        this.drawCard = this.drawCard.bind(this);
        this.getPlayer = this.getPlayer.bind(this);
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
        this.socket.on('yourHand', (data) => this.updateHand(data));
        this.socket.on('drawPileColorUpdate', (color) => {this.updateDrawPile(color)})
        this.socket.on('otherHand', (data) => 
        {console.log('OtherHand Received!', data);
        this.updateOtherHand(data)}
        );
        this.socket.on('updateSeats', (seats) => this.updateSeats(seats));
        this.socket.on('newTurn', (data) => this.turnChange(data));
        this.socket.on("cardDiscarded", (data) => {
            if(data.hand){
                this.updateHand(data.hand);
            }
            else{
                this.updateOtherHand({
                    hand: data.sanitizedHand,
                    socketID: data.socketID,
                });
            }
            this.updateDiscard(data.discardPile);
        });
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

        for(var i = 1; i < 5; i++){
            //Find what your seat is
            if(seats[i] === this.props.socketID){
                mySeat = i;
            }
            seatNumber = i;

            //How many seats are they sitting away from you
            var seatDifference = seatNumber - mySeat;
            //Their seat letter (a/b/c/d) is...
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

        var drawPile = <Card deck={true} facedown={true} color={color} drawCard={this.drawCard} />;

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
            var card = <Card value={card.value} suit={card.suit} back={card.back}  key={`myhand-${card.value}${card.suit}-${index}`}/>;
            myHand.push(card);
        })
        
        console.log("hand:", hand);
        //update state to force render
        this.setState({hand: myHand});
    }

    turnChange = (data) => {
        var prevPlayer = data.prevPlayer;
        var nextPlayer = data.nextPlayer;

        this.setState({
            prevPlayer: prevPlayer,
            nextPlayer: nextPlayer,
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
        // this.getDealer();
        // this.getCards();
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
        this.socket.emit('confirmCardDrawn', this.props.socketID);

        //TODO make sure a card has been drawn first before discarding !!!!!!!!!!!!!!!!!!!!!!!!!
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
        //TODO: Wait for server to confirm
        //remove card from the DOM
        // selected[0].remove();
    }
    
    updateDiscard(data){
        var discardPile = data.map( (card) => {
            return <Card value={card.value} suit={card.suit} 
                    key={`discard-${card.value}-${card.suit}`}  />
        })
        this.setState({
            discardPile: discardPile,
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
                            <button className="draw" onClick={() => this.drawCard()}>Draw Card</button>
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
                        <div className="player playerHand seat-a seat">
                                <div className="hand-container">
                                    {this.state.hand}
                                </div>
                        </div>
                        <div className="player seat-b seat">
                            <div className="hand-container">
                                {this.state.playerB}
                            </div>
                        </div>
                        <div className="player seat-c seat">
                            <div className="hand-container">
                                {this.state.playerC}
                            </div>
                        </div>
                        <div className="player seat-d seat">
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