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
          if(this.props.winningSquares && this.props.winningSquares.includes((i * boardSize) + j)){
            rowOfSquares.push(this.renderSquare((i * boardSize) + j, true));
          } else {
            rowOfSquares.push(this.renderSquare((i * boardSize) + j, false));
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
      this.boardSize = 3;
      this.state = {
        history: [
          {
            squares: Array(this.boardSize * this.boardSize).fill(null),
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
            col: (i % this.boardSize) + 1,
            row: Math.floor(i / this.boardSize) + 1
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
              boardSize={this.boardSize}
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
    let lines = [];
    let boardSize = Math.sqrt(squares.length);
    
    //Add winning rows
    let row = [];
    for(let i = 0; i < squares.length; i++) {
      row.push(i);
      if(i % boardSize === boardSize - 1 && i !== 0) {
        lines.push(row);
        row = [];
      }
    }
    
    //Add wining columns
    let column = [];
    for(let j = 0; j < squares.length; j++) {
      column.push(conditionalModulus((j * boardSize), (squares.length - 1)))
      if(j % boardSize === boardSize - 1 && j !== 0) {
        lines.push(column);
        column = [];
      }
    }

    //Add winning diagonals
    let diagonal = [];
    for(let i = 0; i < squares.length; i = i + boardSize + 1) {
      diagonal.push(i);
    }

    lines.push(diagonal);
    diagonal = []

    //squares.length - 1 to avoid including bottom right square in second diagonal
    for(let i = boardSize - 1; i < squares.length - 1; i = i + boardSize - 1) {
      diagonal.push(i);
    }
    lines.push(diagonal);

    let isWinner = false;
    for (let i = 0; i < lines.length; i++) {
      let currentSymbol = squares[lines[i][0]];
      if(currentSymbol) {
        isWinner = true;
        for(let j = 0; j < lines[i].length; j++) {
          if(squares[lines[i][j]] !== currentSymbol) {
            isWinner = false;
          }
        }

        if(isWinner) {
          return {
            winner: currentSymbol,
            winningSquares: lines[i]
          };
        }
      }
    }
    return {
      winner: null,
      winningSquares: null
    };
  }

  function conditionalModulus(value, modulus) {
    if(value % modulus === 0 && value !== 0) {
      return modulus;
    }

    return value % modulus;
  }
  