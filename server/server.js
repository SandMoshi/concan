// import { Socket } from 'dgram';
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

const http = require("http").Server(app);
var io = require("socket.io")(http);

console.log("Hello world!");

function generateNewDeck(){
    var newDeck = [];
    var i = 2;
    var j = 0;
    var index = 0;
    var suites = ["h","d","c","s"];
    for(j; j < 4; j++){
        for(i; i < 15; i++){
            if(i<11)   var face = i.toString();
            else if(i===11) face = "J";
            else if(i===12) face = "Q";
            else if(i===13) face = "K";
            else if(i===14) face = "A";
            newCard = {value: face, suite:suites[j]}
            newDeck.push(newCard);
        };
        i = 2;
        //Add 2 jokers
        if(j === 3){
            newDeck.push({value: "Jo", suite:"*"},{value: "Jo", suite:"*"});
        }
    }
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
    return hand;
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
    response.send(hand);
});

// app.post("/api/dealCards", (req, response) =>{
//     console.log(req.body);
//     io.emit("cardsDealt", req.body);
//     response.sendStatus(200);
// })

io.on("connection", (socket) => {
    console.log("a user connected");
})



var server = http.listen(port, () => console.log(`Listening on port ${port}`));