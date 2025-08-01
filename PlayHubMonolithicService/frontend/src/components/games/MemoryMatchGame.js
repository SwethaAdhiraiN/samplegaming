import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';

function MemoryMatchGame({ onGameEnd, onScoreUpdate, onMoveUpdate, gameStats }) {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Card symbols for the memory game
  const symbols = ['🎮', '🎯', '🏆', '⭐', '🎨', '🚀', '💎', '🔥'];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    onMoveUpdate(moves);
  }, [moves]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const timer = setTimeout(() => {
        checkForMatch();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [flippedCards]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      handleGameComplete();
    }
  }, [matchedCards, cards]);

  const initializeGame = () => {
    // Create pairs of cards
    const gameCards = [];
    symbols.forEach((symbol, index) => {
      gameCards.push({ id: index * 2, symbol, matched: false });
      gameCards.push({ id: index * 2 + 1, symbol, matched: false });
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
    }
  };

  const checkForMatch = () => {
    const [firstId, secondId] = flippedCards;
    const firstCard = cards.find(card => card.id === firstId);
    const secondCard = cards.find(card => card.id === secondId);

    if (firstCard.symbol === secondCard.symbol) {
      // Match found
      setMatchedCards(prev => [...prev, firstId, secondId]);
    }

    setFlippedCards([]);
  };

  const handleGameComplete = () => {
    setGameComplete(true);
    
    // Calculate score based on moves and time
    const timeBonus = Math.max(0, 300 - Math.floor((new Date() - gameStats.startTime) / 1000));
    const moveBonus = Math.max(0, 100 - moves * 5);
    const finalScore = timeBonus + moveBonus + 100;

    onScoreUpdate(finalScore);
    onGameEnd(true, finalScore);
  };

  const resetGame = () => {
    initializeGame();
  };

  const isCardFlipped = (cardId) => {
    return flippedCards.includes(cardId) || matchedCards.includes(cardId);
  };

  const isCardMatched = (cardId) => {
    return matchedCards.includes(cardId);
  };

  return (
    <div className="game-board">
      <div className="text-center mb-3">
        <h3 style={{ color: gameComplete ? '#56ab2f' : '#667eea' }}>
          {gameComplete ? "Congratulations! 🎉" : `Find the matching pairs! 🧠`}
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Matches: {matchedCards.length / 2} / {symbols.length} | Moves: {moves}
        </p>
      </div>

      <div className="memory-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`memory-card ${isCardFlipped(card.id) ? 'flipped' : ''} ${
              isCardMatched(card.id) ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
            disabled={gameComplete || flippedCards.length === 2}
            style={{
              background: isCardMatched(card.id)
                ? 'linear-gradient(135deg, #56ab2f, #a8e6cf)'
                : isCardFlipped(card.id)
                ? 'linear-gradient(135deg, #ff6b6b, #ffa726)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              transform: isCardFlipped(card.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'all 0.6s ease'
            }}
          >
            {isCardFlipped(card.id) ? card.symbol : '?'}
          </button>
        ))}
      </div>

      <div className="text-center mt-3">
        <div className="d-flex justify-center gap-3" style={{ flexWrap: 'wrap' }}>
          <div className="stat-item">
            <strong style={{ color: '#667eea' }}>Matches:</strong> {matchedCards.length / 2}/{symbols.length}
          </div>
          <div className="stat-item">
            <strong style={{ color: '#ff6b6b' }}>Moves:</strong> {moves}
          </div>
          <div className="stat-item">
            <strong style={{ color: '#56ab2f' }}>Time:</strong>{' '}
            {gameStats.startTime ? Math.floor((new Date() - gameStats.startTime) / 1000) : 0}s
          </div>
        </div>
      </div>

      {gameComplete && (
        <div className="text-center mt-4">
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #56ab2f, #a8e6cf)',
            color: 'white',
            padding: '1.5rem'
          }}>
            <Trophy size={32} style={{ marginBottom: '0.5rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Perfect Memory! 🧠</h3>
            <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>
              You completed the game in {moves} moves!
            </p>
            <p style={{ opacity: 0.9, marginBottom: '1rem' }}>
              Final Score: {gameStats.score} points
            </p>
            <button className="btn btn-outline" onClick={resetGame}>
              <RotateCcw size={16} />
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <div className="card" style={{ background: 'rgba(102, 126, 234, 0.1)', padding: '1rem' }}>
          <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>💡 Tips</h4>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
            Remember the positions of cards you've seen. Try to complete the game in as few moves as possible for a higher score!
          </p>
        </div>
      </div>

      <style jsx>{`
        .memory-card {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .memory-card.flipped {
          animation: cardFlip 0.6s ease-in-out;
        }
        
        .memory-card.matched {
          animation: matchPulse 0.8s ease-in-out;
        }
        
        @keyframes cardFlip {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(90deg) scale(1.1); }
          100% { transform: rotateY(180deg) scale(1); }
        }
        
        @keyframes matchPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .stat-item {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default MemoryMatchGame;
