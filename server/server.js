const express = require('express');

const app = express();
const port = process.env.PORT || 5000;


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

var newDeck = generateNewDeck();

var deck = [
    
]

app.get("/api/hello", (req,response) => {
    response.send(newDeck);
});

app.listen(port, () => console.log(`Listening on port ${port}`));