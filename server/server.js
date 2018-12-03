const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const server = require("http").createServer();
var io = require("socket.io")(server);

var bodyParser = require('body-parser');


//Global Variables
/*  Structure
db ={
        $roomID :
            roomID : $roomID,
            players: {
                $playerID :{
                    name: string,
                    room: string,
                    socketID: $playerID,
                    isHost: bool,
                    isReady: bool,
                    seat: int,
                    hand: [],
                    sanitizedHand: [],
                }
            },
            numberOfPlayers: int,
            seats:{
                1: $playerID,
                2: $playerID,
                3: $playerID,
                4: $playerID,
            }
            dealer: int (seatNumber),
            deck: [],
            order: [2, 3, 4, 1], (etc)
            drawPile: [],
            drawPileColor: string,
            discardPile: [],
            discardPileLength: int,
            currentTurn: int,
            thisTurn:{
                hasDrawn: false,
                hasDiscarded: false,
            }
    }
*/
var db = {}

// Initialize variables
var drawPile = [];
var count = {
    p1 : 0,
    p2 : 0,
    p3 : 0,
    p4 : 0,
}
var hasDrawn = false;
var player = "p1";
var dealer = "p1";


const newPlayer = (socket,player) =>{
    io.on('connect', () => {
        io.emit('new-player',{
            playerName: String(socket.id)
        })
    })
}

function addUserToDb(data){
    var socketID = data.socketID;
    var name = data.name;
    var roomID = data.room;
    var isHost = data.isHost || false;

    //Create a new player object to represent this user
    var playerObj = {
        name: name,
        room: roomID,
        socketID: socketID,
        isHost: isHost,
        isReady: false,
    }

    //Insert this new player object into the database
    if(!db[roomID]){
         db[roomID] = {
             roomID: roomID,
             players: {},
            };
        db[roomID].players[socketID] = playerObj;
    }
    else if(db[roomID].players){
        db[roomID].players[socketID] = playerObj;
    }

    //Assign the player a seat
    if(!db[roomID].seats){
        db[roomID].seats = {
            1: null,
            2: null,
            3: null,
            4: null,
        };
    }
    for(var i = 1; i <= 4; i++){
        if(!db[roomID].seats[i]){
            db[roomID].seats[i] = socketID;
            db[roomID].players[socketID].seat = i;
            break;
        }
    }

    //Increase the player counter
    if(!db[roomID].numberOfPlayers){
        db[roomID].numberOfPlayers = 1;
    }else{
        db[roomID].numberOfPlayers++
    }
}

function chooseDealer(roomID){
    // console.log(db[roomID]);
    var numberOfPlayers = db[roomID].numberOfPlayers;
    if(!db[roomID].dealer || db[roomID].dealer >= numberOfPlayers){
        db[roomID].dealer = 1; //seat 1
    }else{
        var newDealerSeat = db[roomID].dealer + 1;
        db[roomID].dealer = newDealerSeat;
    }
    var dealerSeat = db[roomID].dealer;
    var dealerID = db[roomID].seats[dealerSeat];

    io.to(roomID).emit('newDealer', dealerID);
    io.to(roomID).emit('updateSeats', db[roomID].seats)
}

function generateNewDeck(roomID){
    var newDeck = [];
    var i = 2; //represents facevalue 
    var j = 0; //represents suit
    var k = 0; //represents red/blue
    var index = 0;
    var color = "red";
    var suits = ["h","d","c","s"];
    for(k; k < 2; k++){
        for(j; j < 4; j++){
            for(i; i < 15; i++){
                if(i<11)   var face = i.toString();
                else if(i===11) face = "J";
                else if(i===12) face = "Q";
                else if(i===13) face = "K";
                else if(i===14) face = "A";
                if(k === 1){ color = "blue" }
                newCard = {value: face, suit:suits[j], back: color}
                newDeck.push(newCard);
            };
            i = 2;
        }
        i = 2; j = 0;
    }
    //Add 2 jokers
    newDeck.push({value: "Jo", suit:"*", back: "red"},{value: "Jo", suit:"*",back: "blue"});

    // //TODO - REMOVE FOR PRODUCTION - Max 5 cards in deck
    // newDeck = newDeck.splice(0,32);

    //Check if deck object exists
    !db[roomID].deck ? db[roomID].deck = null : null;
    //Save the deck
    db[roomID].deck = newDeck;
}

function shuffleDeck(roomID, providedDeck){
    if(!db[roomID].deck && !providedDeck){
        throw new Error("Deck does not exist. Deck Cannot be shuffled.");
    }
    var deck = providedDeck || db[roomID].deck;
    var cardsremaining = deck.length;
    var tempCard;
    var i;
    // console.log("deck:", deck);
    //While there are unshuffled cards
    while(cardsremaining){
        //Choose a unshuffled card at random
        i = Math.floor(Math.random() * cardsremaining);
        cardsremaining--;

        //Move the chosen card to end of the end of the unshuffled portion of the deck
        //  and move the last unshuffled card to where the chosen one was
        tempCard = deck[cardsremaining];
        deck[cardsremaining] = deck[i]; //move card to end
        deck[i] = tempCard; //swap the chosen card with the one at the end
    }

    return deck;
}

function discard2DrawPile(roomID){
    //This function will take the cards in the discard pile and shuffle them into a new draw pile
    const discardPile = db[roomID].discardPile;
    const newDrawPile = shuffleDeck(roomID, discardPile);
    
    //Save to the db
    db[roomID].deck = newDrawPile;
    db[roomID].drawPile = newDrawPile;
    db[roomID].drawPileColor = getDrawPileColor(roomID);
    db[roomID].discardPile = [];
    db[roomID].discardPileLength = 0;

}

function getDrawPileColor(roomID){
    //find color of top card
    return db[roomID].drawPile[0].back;
}

app.get("/api/hello", (req,response) => {
    response.send("hello");
});

app.get("/api/getPlayerName", (req, response) =>{
    
});

// app.get("/api/chooseDealer", (req, response) => {
//     if(dealer === "p1"){
//         //get name of the dealer
//         var dealerName = "1";
//     }
//     if(dealer === "p2"){
//         //get name of the dealer
//         var dealerName = "1";
//     }
//     if(dealer === "p3"){
//         //get name of the dealer
//         var dealerName = "1";
//     }
//     if(dealer === "p4"){
//         //get name of the dealer
//         var dealerName = "1";
//     }
//     response.status(200);
//     response.send({dealer: dealer, dealerName: dealerName});
// });

// function cardCount(player,action){
//     console.log("Current Player: " + player);
//     console.log("Current Dealer: " + dealer);
//     if (action === "newGame"){
//         for (var key in count){
//             count[key] = 14;
//         }
//     }
//     if(player){
//         if (action === "newGameDealer"){
//             count[player] = 15;
//         }
//         else if (action === "increase"){
//             count[player] = count[player] + 1;
//         }
//         else if (action === "decrease"){
//             count[player] = count[player] -1;
//         }
//     }
//     // console.log("P1 Card Count is : " + count.p1);
//     // console.log("P2 Card Count is : " + count.p2);
//     // console.log("P3 Card Count is : " + count.p3);
//     // console.log("P4 Card Count is : " + count.p4);
//     return count;
// }

// app.get("/api/drawCard", (req, response) => {
//     //get remaining deck
//     if(count[player] >= 14){
//         console.log("Your hand is full and cannot draw!");
//         response.status(901).send("Your hand is full and cannot draw!");
//     }
//     else if (hasDrawn){
//         console.log("Player has already drawn once this turn!");
//         response.status(902).send("Player has already drawn once this turn!");
//     }
//     else{
//         count = cardCount(player,"increase");
//         hasDrawn = true;
//         drawPile = drawPile;
//         console.log(nextCard);
//         var drawPileColor = getDrawPileColor();
//         var nextCard = drawPile.splice(0,1);
//         response.send({nextCard: nextCard, drawPileColor: drawPileColor});
//     }
// })


io.on("connect", (socket) => {

    console.log("Client Connected.", socket.id);
    //~~~~~~~~~~~~~~ SOCKET LISTENERS ~~~~~~~~~~~~~~~~~~
    socket.on("createNewRoom", (name) =>{
        CreateNewRoom(name);
        console.log("NEW ROOM CREATED!");
    })

    socket.on("joinRoomRequest", (name, room) =>{
        console.log("Request to join room ", room, " by ", name);
        var data = {
            name: name,
            room: room,
            socketID: socket.id,
            isHost: false,
        };
        joinRoom(data);
        socket.emit('joinRoomSuccess', room);
    })
    
    socket.on("pingEveryone", (data) => {
        console.log("Ping attempted by ", data.name, " to room ", data.roomID);
        socket.broadcast.to(data.roomID).emit('pingEveryone', data.name);
    })

    socket.on("toggleReady", (req) => {
        console.log(req.socketID);
        if(db[req.roomID]){
            var isReady = db[req.roomID].players[req.socketID].isReady;
            db[req.roomID].players[req.socketID].isReady = !isReady;
        }
        console.log(db[req.roomID].players[req.socketID].name + " is ready:" + db[req.roomID].players[req.socketID].isReady);
        var players = db[req.roomID].players;
        io.to(req.roomID).emit('userToggled', players);
    })

    socket.on('new-player', state => {
        console.log("a new user connected with state:", state);
        // players[socket.id] = state;
        // io.emit('update-players', players);
    })
    
    socket.on('disconnect', state => {
        // delete players[socket.id];
        // io.emit('update-players', players);
    })

    socket.on('startNewGame', data => {
        var roomID = data.roomID;

        //First choose a dealer
        chooseDealer(roomID);
        //Then deal cards
        dealCards(roomID);
        determineTurn(roomID);
    })

    socket.on('discardCard', data =>{

        console.log("data", data);
        var card = {
            value: data.value,
            suit: data.suit,
            back: data.back,
        }
        var socketID = data.socketID;
        var roomID = data.roomID;
        var seats = db[roomID].seats;
        //Make sure it's this users turn
        if(seats[db[roomID].currentTurn] !== socketID){
            console.log("NOT THE USER WHO IS REQUESTING the DISCARD's TURN!");
            return;
        }
        //Make sure they have drawn already
        if(!db[roomID].thisTurn.hasDrawn){
            console.log("USER MUST DRAW FIRST!")
            return;
        }
        //Make sure they have not yet discarded
        if(db[roomID].thisTurn.hasDiscarded){
            console.log("USER HAS ALREADY DISCARDED THIS TURN!")
            return;
        }   
        
        var player = db[roomID].players[socketID];
        var seat = player.seat;
        
        //Find and Remove card from players hand
        var hand = player.hand;
        console.log("old length", hand.length);
        for(var i =0; i < hand.length; i++){
            if(hand[i].value === card.value
                && hand[i].suit === card.suit && hand[i].back === card.back){
                    //remove this card
                    console.log("Discarded ", card.value, card.suit, card.back);
                    hand.splice(i, 1);
                    db[roomID].thisTurn.hasDiscarded = true;
                    console.log('set thisTurn.hasDiscarded to true');
                }
        }
        console.log("new length", hand.length);
        
        //Get sanitized version
        var sanitizedHand = sanitizeDeck(hand);
        
        //Save
        db[roomID].players[socketID].hand = hand;
        db[roomID].players[socketID].sanitizedHand = sanitizedHand;
        db[roomID].discardPile.unshift(card);
        db[roomID].discardPileLength =  db[roomID].discardPile.length;

        io.to(socketID).emit('cardDiscarded', {hand: hand, discardPile: db[roomID].discardPile.slice(0,3)});
        io.to(roomID).emit("cardDiscarded", {sanitizedHand: sanitizedHand, socketID: socketID, discardPile:db[roomID].discardPile.slice(0,3)});
    })

    socket.on('endTurn', (data) => {
        var socketID = data.socketID;
        var roomID = data.roomID;

        //First check  that it is this current user's turn
        if(db[roomID].players[socketID].seat !== db[roomID].currentTurn){
            console.log("Warning: This person cannot end the turn, it is not their turn.")
            return;
        }
        //Make sure that he has drawn and discarded.
        var thisTurn = db[roomID].thisTurn;
        console.log(thisTurn);
        if(!thisTurn.hasDrawn || !thisTurn.hasDiscarded){
            console.log("Warning: This user has not drawn and discarded this turn. Cannot end turn.")
            return;
        }

        //Tell all clients this person's turn has ended
        io.to(roomID).emit('turnHasEnded', socketID);

        //Go to next person
        determineTurn(roomID);
    })

    socket.on('drawCard', data => {
        var {socketID, roomID} = data;
        var seats = db[roomID].seats;
        //First Make sure it's this person's turn
        if(!seats[db[roomID].currentTurn] === socketID){
            console.log("NOT THE USER WHO IS REQUESTING the DISCARD's TURN!");
            return;
        }
        //Make sure they have not drawn already
        if(db[roomID].thisTurn.hasDrawn){
            console.log(socketID + " HAS ALREADY DRAWN THIS TURN!")
            return;
        }
        //Make sure they have not yet discarded
        if(db[roomID].thisTurn.hasDiscarded){
            console.log("USER HAS ALREADY DISCARDED THIS TURN!")
            return;
        }   
        //Make sure there are cards left in the deck
        if(db[roomID].deck.length < 1){
            console.log("Deck is Empty. cards left:", db[roomID].deck.length);
            return;
        }

        console.log(db[roomID].deck.length);

        //Grab the next card from the deck
        console.log('starting to draw a card');
        var drawnCard = db[roomID].deck.splice(0,1)[0];
        var hand = db[roomID].players[socketID].hand

        hand.push(drawnCard);
        var sanitizedHand = sanitizeDeck(hand);
        
        //save
        db[roomID].players[socketID].hand = hand;
        db[roomID].players[socketID].sanitizedHand = sanitizedHand;
        db[roomID].drawPileColor = db[roomID].drawPile[0] ? db[roomID].drawPile[0].back : 'empty';
        db[roomID].thisTurn.hasDrawn = true;

        console.log('emitting card that was drawn back to user');
        //emit to client
        io.to(socketID).emit('cardDrawn', {hand: hand, drawPileColor: db[roomID].drawPileColor});
        io.to(roomID).emit('cardDrawn', {sanitizedHand: sanitizedHand, socketID: socketID, drawPileColor:db[roomID].drawPileColor});

        //If required, Shuffle Discarded Cards into Draw Pile
        if(db[roomID].deck.length < 1){ 
            console.log('Deck is Empty. cards left:', db[roomID].deck.length);
            discard2DrawPile(roomID);
            io.to(roomID).emit('drawPileColorUpdate', db[roomID].drawPileColor);
            io.to(roomID).emit('discardPileUpdate', db[roomID].discardPile.slice(0,3));
        }
    })

    // ~~~~~~~~~~~~~~~~ FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~

    function CreateNewRoom(name) {
        //Get unique room number
        var thisGameId = (Math.random() * 1000000 ) | 0;
        
        //Send the room number to the browser
        addUserToDb({name: name, room: thisGameId, socketID: socket.id, isHost: true});
        socket.emit('newRoomCreated', {
            roomID: thisGameId,
            socketID: socket.id,
            players: db[thisGameId].players,
        });
        //Tell socket.io this user is joining this room
        socket.join(thisGameId.toString());
    };

    function joinRoom(data){
        console.log("trying to join room:" + data.room);
        console.log(data);
        socket.join(data.room, () => {
            console.log("successfully joined room ", data.room)
            //Add this user to the database
            addUserToDb(data);
            //Let all clients in room know a player has joined
            io.to(data.room).emit("playerJoined", 
                {   
                    roomID: data.room,
                    socketID: data.socketID,
                    players: db[data.room].players,
                });
            // showClients(data.room);
        });
    }

    function showClients(room){
        var roomClients = io.of('/').in(room).clients((err, data)=>{
            if (err) throw err;
            console.log("The people in room ", room, " are: ", data);
        })
    }

    function determineTurn(roomID){
        if(!db[roomID].currentTurn){
            var oldTurn = null;
            var currentTurn = db[roomID].dealer;
            var thisTurn = {
                hasDrawn: true,
                hasDiscarded: false,
            }
        }
        else{
            oldTurn = db[roomID].currentTurn;
            //Go to next player
            if(oldTurn === db[roomID].numberOfPlayers){
                currentTurn = 1;
                thisTurn = {
                    hasDrawn: false,
                    hasDiscarded: false,
                }
            }
            else{
                currentTurn = oldTurn + 1;
                thisTurn = {
                    hasDrawn: false,
                    hasDiscarded: false,
                }
            }
        }
        //save
        db[roomID].currentTurn = currentTurn;
        db[roomID].thisTurn = thisTurn;
        io.to(roomID).emit('newTurn',{
            prevPlayer: oldTurn,
            nextPlayer: currentTurn,
        })
    }

    function dealCards(roomID){
        var deck = generateNewDeck(roomID);
        var shuffledDeck = shuffleDeck(roomID);

        //Save shuffleddeck to the db
        db[roomID].deck = shuffledDeck;
    
        //Deal to each player
            //Start with dealer's seat
            var dealerSeat = db[roomID].dealer;
            var numberOfPlayers =  db[roomID].numberOfPlayers;
            var basic_order = [1,2,3,4];
            if(numberOfPlayers < 4){
                basic_order = basic_order.splice(0, numberOfPlayers);
            }
            var order = basic_order.splice(dealerSeat - 1 , numberOfPlayers - dealerSeat + 1).concat(basic_order);
            console.log(order);
            db[roomID].order = order;
            //will give us ~ order = [2,3,4,1]
            order.forEach( (seat) => {
                var playerID = db[roomID].seats[seat];
                if(dealerSeat == seat){
                    var hand = shuffledDeck.splice(0,15);
                }
                else{
                    hand = shuffledDeck.splice(0,14);
                } 
                var sanitizedHand = sanitizeDeck(hand);
                //save
                db[roomID].players[playerID].hand = hand;
                db[roomID].players[playerID].sanitizedHand = sanitizedHand;
            })
        //Remainig cards for the pile
        var drawPile = shuffledDeck;
        db[roomID].drawPile = drawPile;
        var drawPileColor = getDrawPileColor(roomID);
        db[roomID].drawPileColor = drawPileColor;
        db[roomID].discardPile = [];
    
        //Emit to each player their hand and other players hidden hands
        Object.keys(db[roomID].players).forEach( (socketID) => {
            var hand = db[roomID].players[socketID].hand;
            var sanitizedHand = db[roomID].players[socketID].sanitizedHand;
            io.to(socketID).emit("yourHand", hand);
            io.to(roomID).emit("otherHand", {hand: sanitizedHand, socketID: socketID});
        })
    
        //Emit public data to room
        io.to(roomID).emit("drawPileColorUpdate", db[roomID].drawPileColor)
    }
    
    function sanitizeDeck(deck){
        var sanitizedDeck = deck.map( (item) => {
            return item.back;
        })
        // console.log(sanitizedDeck);
        return sanitizedDeck;
    }
})

io.on("error", (err) =>{
    console.log(err);
});

server.listen(port, () => console.log(`Listening on port ${port}`));