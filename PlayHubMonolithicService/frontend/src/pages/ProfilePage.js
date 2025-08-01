import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { User, Edit3, Save, X, Trophy, Gamepad2, Target, Clock, Star, TrendingUp } from 'lucide-react';

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    full_name: user?.full_name || '',
    email: user?.email || ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        full_name: user.full_name || '',
        email: user.email
      });
      fetchUserScores();
    }
  }, [user]);

  const fetchUserScores = async () => {
    try {
      const response = await axios.get('/scores/user?limit=10');
      setUserScores(response.data);
    } catch (error) {
      console.error('Failed to fetch user scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(editData);
      if (result.success) {
        setUpdateSuccess('Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setUpdateSuccess(''), 3000);
      } else {
        setUpdateError(result.error);
      }
    } catch (error) {
      setUpdateError('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      username: user.username,
      full_name: user.full_name || '',
      email: user.email
    });
    setEditMode(false);
    setUpdateError('');
    setUpdateSuccess('');
  };

  const getGameIcon = (gameId) => {
    const icons = {
      'tic-tac-toe': '⭕',
      'memory-match': '🧠',
      'rock-paper-scissors': '✂️'
    };
    return icons[gameId] || '🎮';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameStats = () => {
    const gameStats = {};
    userScores.forEach(score => {
      if (!gameStats[score.game_id]) {
        gameStats[score.game_id] = {
          name: score.game_name,
          plays: 0,
          wins: 0,
          totalScore: 0,
          bestScore: 0
        };
      }
      gameStats[score.game_id].plays++;
      gameStats[score.game_id].totalScore += score.score;
      gameStats[score.game_id].bestScore = Math.max(gameStats[score.game_id].bestScore, score.score);
      if (score.won) gameStats[score.game_id].wins++;
    });
    return gameStats;
  };

  const gameStats = getGameStats();
  const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = userScores.length > 0 ? Math.round(totalScore / userScores.length) : 0;
  const winRate = user?.total_games > 0 ? Math.round((user.total_wins / user.total_games) * 100) : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <div className="card mb-4">
        <div className="d-flex align-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="profile-avatar">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            {!editMode ? (
              <div>
                <h2 className="card-title" style={{ marginBottom: '0.5rem' }}>
                  {user?.full_name || user?.username}
                </h2>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>@{user?.username}</p>
                <p style={{ color: '#888', fontSize: '0.9rem' }}>{user?.email}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Member since {new Date(user?.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Username"
                    value={editData.username}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="full_name"
                    className="form-control"
                    placeholder="Full Name (optional)"
                    value={editData.full_name}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                    value={editData.email}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div>
            {!editMode ? (
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-success" onClick={handleSaveProfile}>
                  <Save size={16} />
                  Save
                </button>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        
        {updateError && (
          <div className="error-message mt-3">
            {updateError}
          </div>
        )}
        
        {updateSuccess && (
          <div className="success-message mt-3">
            {updateSuccess}
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="card mb-4">
        <h3 className="card-title">
          <Trophy size={24} />
          Gaming Statistics
        </h3>
        
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-value">{user?.total_games || 0}</div>
            <div className="stat-label">
              <Gamepad2 size={16} />
              Games Played
            </div>
          </div>
          
          <div className="stat-card green">
            <div className="stat-value">{user?.total_wins || 0}</div>
            <div className="stat-label">
              <Trophy size={16} />
              Games Won
            </div>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">
              <Target size={16} />
              Win Rate
            </div>
          </div>
          
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffa726, #ff7043)' }}>
            <div className="stat-value">{totalScore}</div>
            <div className="stat-label">
              <Star size={16} />
              Total Score
            </div>
          </div>
          
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
            <div className="stat-value">{averageScore}</div>
            <div className="stat-label">
              <TrendingUp size={16} />
              Avg Score
            </div>
          </div>
        </div>
      </div>

      {/* Game-specific Stats */}
      {Object.keys(gameStats).length > 0 && (
        <div className="card mb-4">
          <h3 className="card-title">Game Performance</h3>
          
          <div className="grid grid-3">
            {Object.entries(gameStats).map(([gameId, stats]) => (
              <div key={gameId} className="game-stat-card">
                <div className="text-center p-3" style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                  borderRadius: '15px',
                  border: '2px solid rgba(102, 126, 234, 0.2)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {getGameIcon(gameId)}
                  </div>
                  <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>{stats.name}</h4>
                  
                  <div className="game-stat-details">
                    <div className="stat-row">
                      <span>Games Played:</span>
                      <strong>{stats.plays}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Games Won:</span>
                      <strong style={{ color: '#56ab2f' }}>{stats.wins}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Win Rate:</span>
                      <strong>{Math.round((stats.wins / stats.plays) * 100)}%</strong>
                    </div>
                    <div className="stat-row">
                      <span>Best Score:</span>
                      <strong style={{ color: '#ff6b6b' }}>{stats.bestScore}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Total Score:</span>
                      <strong>{stats.totalScore}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Games */}
      <div className="card">
        <h3 className="card-title">
          <Clock size={24} />
          Recent Games
        </h3>
        
        {userScores.length > 0 ? (
          <div className="recent-games-list">
            {userScores.map((score, index) => (
              <div key={score.id} className="recent-game-item">
                <div className="game-info">
                  <div className="game-icon-small">
                    {getGameIcon(score.game_id)}
                  </div>
                  <div>
                    <div className="game-name">{score.game_name}</div>
                    <div className="game-date">{formatDate(score.created_at)}</div>
                  </div>
                </div>
                
                <div className="game-result">
                  <div className={`result-badge ${score.won ? 'won' : 'lost'}`}>
                    {score.won ? '🏆 Won' : '💔 Lost'}
                  </div>
                  <div className="score-value">{score.score} pts</div>
                  {score.duration && (
                    <div className="duration">{score.duration}s</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <Gamepad2 size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h4 style={{ color: '#666', marginBottom: '1rem' }}>No games played yet</h4>
            <p style={{ color: '#888' }}>Start playing to see your game history here!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .game-stat-details {
          text-align: left;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .recent-game-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          margin-bottom: 0.5rem;
          border-left: 4px solid #667eea;
        }
        
        .game-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .game-icon-small {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
        }
        
        .game-name {
          font-weight: bold;
          color: #333;
        }
        
        .game-date {
          font-size: 0.8rem;
          color: #666;
        }
        
        .game-result {
          text-align: right;
        }
        
        .result-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }
        
        .result-badge.won {
          background: linear-gradient(135deg, #56ab2f, #a8e6cf);
          color: white;
        }
        
        .result-badge.lost {
          background: linear-gradient(135deg, #ff6b6b, #ffa726);
          color: white;
        }
        
        .score-value {
          font-weight: bold;
          color: #667eea;
          font-size: 1.1rem;
        }
        
        .duration {
          font-size: 0.8rem;
          color: #888;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
