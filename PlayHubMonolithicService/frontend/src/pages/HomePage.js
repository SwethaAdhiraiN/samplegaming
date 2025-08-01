import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Gamepad2, Trophy, Users, Star } from 'lucide-react';

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamesResponse, leaderboardResponse] = await Promise.all([
        axios.get('/games'),
        axios.get('/leaderboard?limit=3')
      ]);
      
      setGames(gamesResponse.data);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading PlayHub...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section text-center mb-4">
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
            🎮 Welcome to PlayHub
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
            The ultimate destination for casual mini-games. Play, compete, and climb the leaderboards!
          </p>
          
          {!isAuthenticated ? (
            <div className="d-flex justify-center gap-2">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/games" className="btn btn-outline">
                Browse Games
              </Link>
            </div>
          ) : (
            <div className="d-flex justify-center gap-2">
              <Link to="/games" className="btn btn-primary">
                <Gamepad2 size={20} />
                Play Games
              </Link>
              <Link to="/profile" className="btn btn-outline">
                <Users size={20} />
                View Profile
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* User Welcome Section */}
      {isAuthenticated && (
        <section className="user-welcome mb-4">
          <div className="card">
            <h2 className="card-title">Welcome back, {user.username}! 👋</h2>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-value">{user.total_games}</div>
                <div className="stat-label">Games Played</div>
              </div>
              <div className="stat-card green">
                <div className="stat-value">{user.total_wins}</div>
                <div className="stat-label">Games Won</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-value">
                  {user.total_games > 0 ? Math.round((user.total_wins / user.total_games) * 100) : 0}%
                </div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Games Section */}
      <section className="featured-games mb-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Gamepad2 size={24} />
              Featured Games
            </h2>
            <p className="card-subtitle">Choose your favorite game and start playing!</p>
          </div>
          
          <div className="grid grid-3">
            {games.slice(0, 3).map((game) => (
              <Link key={game.id} to={`/games/${game.id}`} className="game-card" style={{ textDecoration: 'none' }}>
                <div className="game-icon">
                  {game.id === 'tic-tac-toe' && '⭕'}
                  {game.id === 'memory-match' && '🧠'}
                  {game.id === 'rock-paper-scissors' && '✂️'}
                </div>
                <h3 className="game-title">{game.name}</h3>
                <p className="game-description">{game.description}</p>
                <div className="game-stats">
                  <span>👥 {game.max_players} players</span>
                  <span>🎯 {game.category}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-3">
            <Link to="/games" className="btn btn-primary">
              View All Games
            </Link>
          </div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="top-players mb-4">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Trophy size={24} />
              Top Players
            </h2>
            <p className="card-subtitle">See who's dominating the leaderboards!</p>
          </div>
          
          {leaderboard.length > 0 ? (
            <div>
              {leaderboard.map((player, index) => (
                <div key={player.username} className="leaderboard-item">
                  <div className={`leaderboard-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                    #{index + 1}
                  </div>
                  <div className="leaderboard-user">
                    <div className="leaderboard-username">{player.username}</div>
                    <div className="leaderboard-stats">
                      {player.total_games} games • {player.total_wins} wins • {player.win_percentage}% win rate
                    </div>
                  </div>
                  <div className="leaderboard-score">
                    <Star size={16} style={{ color: '#ffd700' }} />
                    {player.total_score}
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-3">
                <Link to="/leaderboard" className="btn btn-secondary">
                  View Full Leaderboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Trophy size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
              <p style={{ color: '#666' }}>No leaderboard data yet. Be the first to play!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Why Choose PlayHub?</h2>
            <p className="card-subtitle">Everything you need for the best gaming experience</p>
          </div>
          
          <div className="grid grid-2">
            <div className="feature-item text-center p-3">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Multiple Games</h3>
              <p style={{ color: '#666' }}>
                Choose from a variety of classic games including Tic-Tac-Toe, Memory Match, and Rock-Paper-Scissors.
              </p>
            </div>
            
            <div className="feature-item text-center p-3">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Leaderboards</h3>
              <p style={{ color: '#666' }}>
                Compete with players worldwide and climb the leaderboards to prove your skills.
              </p>
            </div>
            
            <div className="feature-item text-center p-3">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Real-time Play</h3>
              <p style={{ color: '#666' }}>
                Experience smooth, real-time multiplayer gameplay with instant updates.
              </p>
            </div>
            
            <div className="feature-item text-center p-3">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Track Progress</h3>
              <p style={{ color: '#666' }}>
                Monitor your performance with detailed statistics and game history.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
