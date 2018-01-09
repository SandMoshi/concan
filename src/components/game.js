import React, {Component} from 'react';
import card-deck;

class Game extends Component {

    constructor(props){
        super();
        this.gameCode = this.gameCode.bind(this);
    }

    gameCode(){
    }

    componentDidMount(){
        this.gameCode();
    }

    render(){
        return(
            <div className="Game">
                <p>Game Component</p>
            </div>
        );
    }

}

export default Game;