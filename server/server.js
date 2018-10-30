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
                }
            },
            numberOfPlayers: int,
            seats:{
                1: $playerID,
                2: $playerID,
                3: $playerID,
                4: $playerID,
            }
            dealer: $seat,
            deck: [],
            order: [2, 3, 4, 1], (etc)
            drawPile: [],
            drawPileColor: string,
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
    console.log(db[roomID]);
    var numberOfPlayers = db[roomID].numberOfPlayers;
    if(!db[roomID].dealer || db[roomID].dealer >= numberOfPlayers){
        db[roomID].dealer = 1; //seat 1
    }else{
        var newDealerSeat = db[roomID].dealer + 1;
        db[roomID].dealer = newDealerSeat;
    }
    var dealerSeat = db[roomID].dealer;
    var dealerID = db[roomID].seats[dealerSeat];
    console.log(dealerID);
    io.to(roomID).emit('newDealer', dealerID);
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

    if(!db[roomID].deck){ db[roomID].deck = null }
    db[roomID].deck = newDeck;
    // return newDeck;
}

function shuffleDeck(roomID){
    if(!db[roomID].deck){
        throw new Error("Deck does not exist. Deck Cannot be shuffled.");
    }
    var deck = db[roomID].deck;
    var cardsremaining = deck.length;
    var tempCard;
    var i;
    console.log("deck:", deck);
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
    //Save to our data structure
    db[roomID].deck = deck;
    return deck;
}

function dealCards(roomID){
    var deck = generateNewDeck(roomID);
    var shuffledDeck = shuffleDeck(roomID);
    console.log("shuffledDeck:", shuffledDeck);

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
            //save
            db[roomID].players[playerID].hand = hand;
        })
    //Remainig cards for the pile
    var drawPile = shuffledDeck;
    db[roomID].drawPile = drawPile;
    var drawPileColor = getDrawPileColor(roomID);
    db[roomID].drawPileColor = drawPileColor;

    //Emit to each player their hand
    Object.keys(db[roomID].players).forEach( (socketID) => {
        io.to(socketID).emit("yourHand", db[roomID].players[socketID]);
    })
}

function sanitizedData(){

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

app.get("/api/drawCard", (req, response) => {
    //get remaining deck
    if(count[player] >= 14){
        console.log("Your hand is full and cannot draw!");
        response.status(901).send("Your hand is full and cannot draw!");
    }
    else if (hasDrawn){
        console.log("Player has already drawn once this turn!");
        response.status(902).send("Player has already drawn once this turn!");
    }
    else{
        count = cardCount(player,"increase");
        hasDrawn = true;
        drawPile = drawPile;
        console.log(nextCard);
        var drawPileColor = getDrawPileColor();
        var nextCard = drawPile.splice(0,1);
        response.send({nextCard: nextCard, drawPileColor: drawPileColor});
    }
})

app.post("/api/discardCard", (req, response) =>{
    console.log(req.body);
    count = cardCount(player,"decrease");
    io.emit('cardDiscarded', req.body);
    response.sendStatus(200);
})


io.on("connection", (socket) => {

    console.log("Client Connected.");

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
    })

    function CreateNewRoom(name) {
        //Get unique room number
        var thisGameId = (Math.random() * 1000000 ) | 0;
        
        //Send the room number to the browser
        addUserToDb({name: name, room: thisGameId, socketID: socket.id, isHost: true});
        socket.emit('newRoomCreated', {
            roomID: thisGameId,
            socketID: socket.id,
            players: db[thisGameId].players

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
})

io.on("error", (err) =>{
    console.log(err);
});

server.listen(port, () => console.log(`Listening on port ${port}`));