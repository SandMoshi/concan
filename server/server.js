// import { Socket } from 'dgram';
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const http = require("http").Server(app);
var io = require("socket.io")(http);

var bodyParser = require('body-parser');

console.log("Hello world!");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

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

function generateNewDeck(){
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

    return newDeck;
}

function shuffleDeck(newDeck){
    var deck = newDeck;
    var cardsremaining = deck.length;
    var tempCard;
    var i;
    
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

function dealCards(shuffledDeck){
    var hand = shuffledDeck.splice(0,15);
    drawPile = shuffledDeck;
    var count = cardCount(null,"newGame");
    var count = cardCount(dealer,"newGameDealer");
    // console.log("Count is : " + count.p1);
    return hand;
}

function updateDrawPileColor(){
    //find color of top card
    return drawPile[0].back;
}

// var newDeck = generateNewDeck();

app.get("/api/hello", (req,response) => {
    response.send("hello");
});

app.get("/api/dealCards", (req,response) => {
    //shuffle deck
    var deck = generateNewDeck();
    var shuffledDeck = shuffleDeck(deck);
    var hand = dealCards(shuffledDeck);
    var drawPileColor = updateDrawPileColor();
    response.send({hand: hand, drawPileColor: drawPileColor});
});

function cardCount(player,action){
    console.log("Current Player: " + player);
    console.log("Current Dealer: " + dealer);
    if (action === "newGame"){
        for (var key in count){
            count[key] = 14;
        }
    }
    if(player){
        if (action === "newGameDealer"){
            count[player] = 15;
        }
        else if (action === "increase"){
            count[player] = count[player] + 1;
        }
        else if (action === "decrease"){
            count[player] = count[player] -1;
        }
    }
    console.log("P1 Card Count is : " + count.p1);
    console.log("P2 Card Count is : " + count.p2);
    console.log("P3 Card Count is : " + count.p3);
    console.log("P4 Card Count is : " + count.p4);
    return count;
}

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
        var drawPileColor = updateDrawPileColor();
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

// app.post("/api/dealCards", (req, response) =>{
//     console.log(req.body);
//     io.emit("cardsDealt", req.body);
//     response.sendStatus(200);
// })

io.on("connection", (socket) => {
    console.log("a user connected");
})

var server = http.listen(port, () => console.log(`Listening on port ${port}`));