import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

function TicTacToeGame({ onGameEnd, onScoreUpdate, onMoveUpdate, gameStats }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameResult, setGameResult] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);

  useEffect(() => {
    onMoveUpdate(9 - board.filter(cell => cell === null).length);
  }, [board]);

  useEffect(() => {
    if (!isPlayerTurn && !gameResult) {
      // AI move after a short delay
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameResult]);

  const checkWinner = (boardState) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], line };
      }
    }

    if (boardState.every(cell => cell !== null)) {
      return { winner: 'draw', line: null };
    }

    return null;
  };

  const makeAIMove = () => {
    const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (availableMoves.length === 0) return;

    // Simple AI: Try to win, then block player, then random
    let move = findBestMove(board, 'O') || findBestMove(board, 'X') || availableMoves[Math.floor(Math.random() * availableMoves.length)];
    
    const newBoard = [...board];
    newBoard[move] = 'O';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      handleGameEnd(result, newBoard);
    } else {
      setIsPlayerTurn(true);
    }
  };

  const findBestMove = (boardState, player) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      const cells = [boardState[a], boardState[b], boardState[c]];
      const playerCount = cells.filter(cell => cell === player).length;
      const nullCount = cells.filter(cell => cell === null).length;

      if (playerCount === 2 && nullCount === 1) {
        return line.find(index => boardState[index] === null);
      }
    }
    return null;
  };

  const handleCellClick = (index) => {
    if (board[index] || !isPlayerTurn || gameResult) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      handleGameEnd(result, newBoard);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const handleGameEnd = (result, finalBoard) => {
    setGameResult(result.winner);
    setWinner(result.winner);
    setWinningLine(result.line);

    let score = 0;
    let won = false;

    if (result.winner === 'X') {
      score = 100;
      won = true;
    } else if (result.winner === 'draw') {
      score = 50;
    }

    onScoreUpdate(score);
    onGameEnd(won, score);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameResult(null);
    setWinner(null);
    setWinningLine(null);
  };

  const getCellClass = (index) => {
    let className = 'tic-tac-toe-cell';
    if (winningLine && winningLine.includes(index)) {
      className += ' winning-cell';
    }
    return className;
  };

  return (
    <div className="game-board">
      <div className="text-center mb-3">
        <h3 style={{ color: isPlayerTurn ? '#667eea' : '#ffa726' }}>
          {gameResult ? (
            gameResult === 'draw' ? "It's a Draw! 🤝" :
            gameResult === 'X' ? "You Win! 🎉" : "AI Wins! 🤖"
          ) : (
            isPlayerTurn ? "Your Turn (X)" : "AI Turn (O)"
          )}
        </h3>
      </div>

      <div className="tic-tac-toe-board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={getCellClass(index)}
            onClick={() => handleCellClick(index)}
            disabled={!isPlayerTurn || gameResult}
            style={{
              color: cell === 'X' ? '#667eea' : cell === 'O' ? '#ff6b6b' : 'transparent',
              background: winningLine && winningLine.includes(index) 
                ? 'linear-gradient(135deg, #56ab2f, #a8e6cf)' 
                : undefined
            }}
          >
            {cell}
          </button>
        ))}
      </div>

      {gameResult && (
        <div className="text-center mt-3">
          <div className="card" style={{ 
            background: winner === 'X' 
              ? 'linear-gradient(135deg, #56ab2f, #a8e6cf)' 
              : winner === 'draw'
              ? 'linear-gradient(135deg, #ffa726, #ff7043)'
              : 'linear-gradient(135deg, #ff6b6b, #ffa726)',
            color: 'white',
            padding: '1.5rem'
          }}>
            <Trophy size={32} style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>
              {winner === 'X' && 'Congratulations! 🎉'}
              {winner === 'O' && 'Better luck next time! 🤖'}
              {winner === 'draw' && 'Great game! 🤝'}
            </h3>
            <p style={{ opacity: 0.9, marginBottom: '1rem' }}>
              Score: {gameStats.score} points
            </p>
            <button className="btn btn-outline" onClick={resetGame}>
              <RotateCcw size={16} />
              Play Again
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .tic-tac-toe-cell.winning-cell {
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default TicTacToeGame;
