import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

function RockPaperScissorsGame({ onGameEnd, onScoreUpdate, onMoveUpdate, gameStats }) {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [rounds, setRounds] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const choices = [
    { id: 'rock', emoji: '🪨', name: 'Rock' },
    { id: 'paper', emoji: '📄', name: 'Paper' },
    { id: 'scissors', emoji: '✂️', name: 'Scissors' }
  ];

  useEffect(() => {
    onMoveUpdate(rounds);
    onScoreUpdate(score.player * 10);
  }, [rounds, score]);

  const getRandomChoice = () => {
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player, computer) => {
    if (player.id === computer.id) return 'tie';
    
    if (
      (player.id === 'rock' && computer.id === 'scissors') ||
      (player.id === 'paper' && computer.id === 'rock') ||
      (player.id === 'scissors' && computer.id === 'paper')
    ) {
      return 'player';
    }
    
    return 'computer';
  };

  const handlePlayerChoice = (choice) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setPlayerChoice(choice);
    setResult(null);

    // Animate computer choice selection
    let animationCount = 0;
    const animationInterval = setInterval(() => {
      setComputerChoice(getRandomChoice());
      animationCount++;
      
      if (animationCount >= 8) {
        clearInterval(animationInterval);
        
        // Final computer choice
        const finalComputerChoice = getRandomChoice();
        setComputerChoice(finalComputerChoice);
        
        // Determine winner
        const roundResult = determineWinner(choice, finalComputerChoice);
        setResult(roundResult);
        
        // Update scores
        const newScore = { ...score };
        if (roundResult === 'player') {
          newScore.player++;
        } else if (roundResult === 'computer') {
          newScore.computer++;
        }
        setScore(newScore);
        
        // Update game history
        const newRound = {
          round: rounds + 1,
          playerChoice: choice,
          computerChoice: finalComputerChoice,
          result: roundResult
        };
        setGameHistory(prev => [...prev, newRound]);
        setRounds(prev => prev + 1);
        
        setIsAnimating(false);
      }
    }, 100);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore({ player: 0, computer: 0 });
    setRounds(0);
    setGameHistory([]);
    setIsAnimating(false);
  };

  const getResultMessage = () => {
    if (!result) return '';
    
    switch (result) {
      case 'player':
        return 'You Win This Round! 🎉';
      case 'computer':
        return 'Computer Wins This Round! 🤖';
      case 'tie':
        return "It's a Tie! 🤝";
      default:
        return '';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'player':
        return '#56ab2f';
      case 'computer':
        return '#ff6b6b';
      case 'tie':
        return '#ffa726';
      default:
        return '#667eea';
    }
  };

  return (
    <div className="game-board">
      <div className="text-center mb-4">
        <h3 style={{ color: '#667eea' }}>Rock Paper Scissors ✂️</h3>
        <p style={{ color: '#666' }}>Choose your weapon and beat the computer!</p>
      </div>

      {/* Score Display */}
      <div className="d-flex justify-center gap-4 mb-4">
        <div className="stat-card blue">
          <div className="stat-value">{score.player}</div>
          <div className="stat-label">You</div>
        </div>
        <div className="stat-card" style={{ background: '#ffa726' }}>
          <div className="stat-value">{rounds}</div>
          <div className="stat-label">Rounds</div>
        </div>
        <div className="stat-card" style={{ background: '#ff6b6b' }}>
          <div className="stat-value">{score.computer}</div>
          <div className="stat-label">Computer</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="text-center mb-4">
        <div className="d-flex justify-center align-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
          {/* Player Choice */}
          <div className="choice-display">
            <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>Your Choice</h4>
            <div className="choice-circle" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              {playerChoice ? (
                <span style={{ fontSize: '3rem' }}>{playerChoice.emoji}</span>
              ) : (
                <span style={{ fontSize: '2rem', opacity: 0.5 }}>?</span>
              )}
            </div>
          </div>

          {/* VS */}
          <div className="vs-display">
            <h2 style={{ color: '#ffa726', margin: '2rem 0' }}>VS</h2>
          </div>

          {/* Computer Choice */}
          <div className="choice-display">
            <h4 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Computer Choice</h4>
            <div className="choice-circle" style={{ 
              background: 'linear-gradient(135deg, #ff6b6b, #ffa726)',
              animation: isAnimating ? 'spin 0.1s linear infinite' : 'none'
            }}>
              {computerChoice ? (
                <span style={{ fontSize: '3rem' }}>{computerChoice.emoji}</span>
              ) : (
                <span style={{ fontSize: '2rem', opacity: 0.5 }}>?</span>
              )}
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="card mb-4" style={{ 
            background: `linear-gradient(135deg, ${getResultColor()}, ${getResultColor()}dd)`,
            color: 'white',
            padding: '1rem'
          }}>
            <h3>{getResultMessage()}</h3>
            <p style={{ opacity: 0.9, margin: 0 }}>
              {playerChoice?.name} vs {computerChoice?.name}
            </p>
          </div>
        )}
      </div>

      {/* Choice Buttons */}
      <div className="d-flex justify-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        {choices.map((choice) => (
          <button
            key={choice.id}
            className="choice-button"
            onClick={() => handlePlayerChoice(choice)}
            disabled={isAnimating}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '1rem 1.5rem',
              fontSize: '1.2rem',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isAnimating ? 0.6 : 1
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{choice.emoji}</div>
            <div>{choice.name}</div>
          </button>
        ))}
      </div>

      {/* Game History */}
      {gameHistory.length > 0 && (
        <div className="card">
          <h4 className="card-title">Game History</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {gameHistory.slice(-5).map((round, index) => (
              <div key={round.round} className="history-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: '1px solid #f0f0f0',
                fontSize: '0.9rem'
              }}>
                <span>Round {round.round}</span>
                <span>{round.playerChoice.emoji} vs {round.computerChoice.emoji}</span>
                <span style={{ 
                  color: round.result === 'player' ? '#56ab2f' : 
                        round.result === 'computer' ? '#ff6b6b' : '#ffa726',
                  fontWeight: 'bold'
                }}>
                  {round.result === 'player' ? 'WIN' : 
                   round.result === 'computer' ? 'LOSE' : 'TIE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {rounds > 0 && (
        <div className="text-center mt-4">
          <button className="btn btn-secondary" onClick={resetGame}>
            <RotateCcw size={16} />
            New Game
          </button>
        </div>
      )}

      {/* Game Rules */}
      <div className="card mt-4" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
        <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>🎯 Rules</h4>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          <p><strong>Rock</strong> crushes Scissors</p>
          <p><strong>Paper</strong> covers Rock</p>
          <p><strong>Scissors</strong> cuts Paper</p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Scoring:</strong> Win = 10 points, Tie = 5 points, Loss = 0 points
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .choice-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .choice-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .choice-display {
          text-align: center;
        }
        
        .vs-display {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default RockPaperScissorsGame;
