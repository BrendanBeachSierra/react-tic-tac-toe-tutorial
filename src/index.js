import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className={props.className} onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
  
  class Board extends React.Component {
    renderSquare(i, isHighlighted) {
      return (
        <Square
          key={i}
          className={isHighlighted ? 'highlighted-square' : 'square'}
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
        />
      );
    }
    
    render() {
      const boardSize = this.props.boardSize;

      let board = [];
      
      for(let i = 0; i < boardSize; i++) {
        let rowOfSquares = [];
        for(let j = 0; j < boardSize; j++) {
          if(this.props.winningSquares && this.props.winningSquares.includes((i * 3) + j)){
            rowOfSquares.push(this.renderSquare((i * 3) + j, true));
          } else {
            rowOfSquares.push(this.renderSquare((i * 3) + j, false));
          }
        }

        board.push(
          <div key={i} className="board-row">
            {rowOfSquares}
          </div>
        );
      }

      return (
        <div>
          {board}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [
          {
            squares: Array(9).fill(null),
            col: 0,
            row: 0
          }
        ],
        stepNumber: 0,
        xIsNext: true,
        reversed: false
      };
    }
  
    handleClick(i) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      if (calculateWinner(squares).winner || squares[i]) {
        return;
      }
      squares[i] = this.state.xIsNext ? "X" : "O";
      this.setState({
        history: history.concat([
          {
            squares: squares,
            col: (i % 3) + 1,
            row: Math.floor(i/3) + 1
          }
        ]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext
      });
    }
  
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0
      });
    }

    reorderMoves() {
      this.setState({
        reversed: !this.state.reversed
      });
    }

    checkIfNoMovesRemaining(squares) {
      if(!squares.includes(null)) {
        return true;
      }

      return false;
    }
  
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winnerInfo = calculateWinner(current.squares);
      const winner = winnerInfo.winner;
      const winningSquares = winnerInfo.winningSquares;

      let draw;
      if(null === winner && this.checkIfNoMovesRemaining(current.squares) === true) {
        draw = true;
      } else {
        draw = false;
      }
  
      let moves = history.map((step, move) => {
        let desc = move ?
          'Go to move #' + move + ' (' + step.col + ', ' + step.row + ')' :
          'Go to game start';

        if(move === this.state.stepNumber) {
          desc = (<b>{desc}</b>)
        }

        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
              {desc}
            </button>
          </li>
        );
      });
      
      let renderMoves;
      if(this.state.reversed) {
        moves = moves.reverse();
        renderMoves = (<ol reversed>{moves}</ol>)
      } else {
        renderMoves = (<ol>{moves}</ol>);
      }

      let status;
      if (winner) {
        status = "Winner: " + winner;
      } else if(draw) {
        status = "Tie game!";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
  
      return (
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              winningSquares={winningSquares}
              onClick={i => this.handleClick(i)}
              boardSize={3}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <button onClick={() => this.reorderMoves()}>Reverse move list</button>
            {renderMoves}
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(<Game />, document.getElementById("root"));
  
  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {
          winner: squares[a],
          winningSquares: [a, b, c]
        };
      }
    }
    return {
      winner: null,
      winningSquares: null
    };
  }
  