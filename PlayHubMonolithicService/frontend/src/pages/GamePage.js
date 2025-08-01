import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { ArrowLeft, Trophy, Clock, Users, RotateCcw, Play } from 'lucide-react';

// Game Components
import TicTacToeGame from '../components/games/TicTacToeGame';
import MemoryMatchGame from '../components/games/MemoryMatchGame';
import RockPaperScissorsGame from '../components/games/RockPaperScissorsGame';

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState({
    score: 0,
    startTime: null,
    endTime: null,
    moves: 0
  });

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/games/${gameId}`);
      setGame(response.data);
    } catch (error) {
      console.error('Failed to fetch game:', error);
      if (error.response?.status === 404) {
        navigate('/games');
      }
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameStats({
      score: 0,
      startTime: new Date(),
      endTime: null,
      moves: 0
    });
  };

  const endGame = async (won, finalScore = 0) => {
    const endTime = new Date();
    const duration = Math.floor((endTime - gameStats.startTime) / 1000);
    
    setGameStats(prev => ({
      ...prev,
      endTime,
      score: finalScore
    }));

    // Submit score if user is authenticated
    if (isAuthenticated) {
      try {
        await axios.post('/scores', {
          game_id: gameId,
          score: finalScore,
          duration,
          won
        });
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameStats({
      score: 0,
      startTime: null,
      endTime: null,
      moves: 0
    });
  };

  const getGameIcon = (gameId) => {
    const icons = {
      'tic-tac-toe': '⭕',
      'memory-match': '🧠',
      'rock-paper-scissors': '✂️'
    };
    return icons[gameId] || '🎮';
  };

  const renderGame = () => {
    const gameProps = {
      onGameEnd: endGame,
      onScoreUpdate: (score) => setGameStats(prev => ({ ...prev, score })),
      onMoveUpdate: (moves) => setGameStats(prev => ({ ...prev, moves })),
      gameStats,
      isAuthenticated,
      user
    };

    switch (gameId) {
      case 'tic-tac-toe':
        return <TicTacToeGame {...gameProps} />;
      case 'memory-match':
        return <MemoryMatchGame {...gameProps} />;
      case 'rock-paper-scissors':
        return <RockPaperScissorsGame {...gameProps} />;
      default:
        return (
          <div className="text-center p-4">
            <h3>Game Not Available</h3>
            <p>This game is currently under development.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="card text-center">
        <h2>Game Not Found</h2>
        <p>The requested game could not be found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/games')}>
          Back to Games
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card mb-4">
        <div className="d-flex align-center gap-3 mb-3">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/games')}
          >
            <ArrowLeft size={16} />
            Back to Games
          </button>
          
          <div className="text-center" style={{ flex: 1 }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {getGameIcon(gameId)}
            </div>
            <h1 className="card-title">{game.name}</h1>
            <p className="card-subtitle">{game.description}</p>
          </div>
        </div>

        {/* Game Info */}
        <div className="d-flex justify-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="text-center">
            <Users size={20} style={{ color: '#667eea', marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {game.max_players === 1 ? 'Single Player' : `Up to ${game.max_players} players`}
            </div>
          </div>
          
          <div className="text-center">
            <Trophy size={20} style={{ color: '#667eea', marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'capitalize' }}>
              {game.category}
            </div>
          </div>
          
          {gameStats.startTime && (
            <div className="text-center">
              <Clock size={20} style={{ color: '#667eea', marginBottom: '0.25rem' }} />
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {gameStats.endTime 
                  ? `${Math.floor((gameStats.endTime - gameStats.startTime) / 1000)}s`
                  : `${Math.floor((new Date() - gameStats.startTime) / 1000)}s`
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Stats */}
      {gameStarted && (
        <div className="card mb-4">
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-value">{gameStats.score}</div>
              <div className="stat-label">Score</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value">{gameStats.moves}</div>
              <div className="stat-label">Moves</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-value">
                {gameStats.startTime ? Math.floor((new Date() - gameStats.startTime) / 1000) : 0}s
              </div>
              <div className="stat-label">Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #ffa726, #ff7043)', color: 'white' }}>
          <div className="text-center">
            <h3 style={{ marginBottom: '0.5rem' }}>🏆 Want to Save Your Scores?</h3>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
              Sign up or log in to track your progress and compete on the leaderboards!
            </p>
            <div className="d-flex justify-center gap-2">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div className="card">
        {!gameStarted ? (
          <div className="text-center p-4">
            <h2 style={{ marginBottom: '1rem' }}>Ready to Play?</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
              Click the button below to start your game!
            </p>
            <button className="btn btn-primary" onClick={startGame}>
              <Play size={20} />
              Start Game
            </button>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-center mb-3">
              <button className="btn btn-secondary" onClick={resetGame}>
                <RotateCcw size={16} />
                Reset Game
              </button>
            </div>
            {renderGame()}
          </div>
        )}
      </div>

      {/* Game Instructions */}
      <div className="card mt-4">
        <h3 className="card-title">How to Play</h3>
        <div className="game-instructions">
          {gameId === 'tic-tac-toe' && (
            <div>
              <p><strong>Objective:</strong> Get three of your marks (X or O) in a row, column, or diagonal.</p>
              <p><strong>How to play:</strong> Click on an empty cell to place your mark. Try to get three in a row while blocking your opponent!</p>
              <p><strong>Scoring:</strong> Win = 100 points, Draw = 50 points, Loss = 0 points</p>
            </div>
          )}
          
          {gameId === 'memory-match' && (
            <div>
              <p><strong>Objective:</strong> Match all pairs of cards by remembering their positions.</p>
              <p><strong>How to play:</strong> Click on cards to flip them. Find matching pairs to keep them face up.</p>
              <p><strong>Scoring:</strong> Points based on time and number of moves. Fewer moves = higher score!</p>
            </div>
          )}
          
          {gameId === 'rock-paper-scissors' && (
            <div>
              <p><strong>Objective:</strong> Beat the computer in the classic game of Rock, Paper, Scissors.</p>
              <p><strong>Rules:</strong> Rock beats Scissors, Scissors beats Paper, Paper beats Rock.</p>
              <p><strong>Scoring:</strong> Win = 10 points, Draw = 5 points, Loss = 0 points</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
