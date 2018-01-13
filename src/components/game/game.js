import React, {Component} from 'react';
import Card from '../card/card';
import './game.css';

class Game extends Component {

    constructor(props){
        super();
        this.gameCode = this.gameCode.bind(this);
    }

    gameCode(){

    }

    componentDidMount(){
        this.gameCode();
        this.cardSelected();
    }

    cardSelected(){
        var cards = document.getElementsByClassName("card");
        [].forEach.call(cards, (card)=>{
            card.addEventListener('click',()=>{
                card.classList.toggle("selected");
            })
        })
    }

    render(){
        return(
            <div className="Game">
                <p>Game Component</p>
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
            </div>
        );
    }

}

export default Game;