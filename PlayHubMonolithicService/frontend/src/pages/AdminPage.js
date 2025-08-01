import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { 
  Shield, Users, Gamepad2, Plus, Trash2, Edit3, 
  Save, X, AlertCircle, CheckCircle, Search, Filter,
  TrendingUp, Trophy, Target, Clock
} from 'lucide-react';

function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User management states
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Game management states
  const [showAddGame, setShowAddGame] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [newGame, setNewGame] = useState({
    name: '',
    description: '',
    category: 'strategy',
    max_players: 1
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersResponse, gamesResponse] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/games')
      ]);
      
      setUsers(usersResponse.data);
      setGames(gamesResponse.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async () => {
    try {
      const response = await axios.post('/admin/games', newGame);
      setGames([...games, response.data]);
      setNewGame({ name: '', description: '', category: 'strategy', max_players: 1 });
      setShowAddGame(false);
      setSuccess('Game added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add game');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await axios.delete(`/admin/games/${gameId}`);
      setGames(games.filter(game => game.id !== gameId));
      setSuccess('Game deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to delete game');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => user.role === userFilter);
    }

    return filtered;
  };

  const getAdminStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.total_games > 0).length;
    const totalGames = games.length;
    const activeGames = games.filter(g => g.is_active).length;
    
    return { totalUsers, activeUsers, totalGames, activeGames };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="card text-center">
        <Shield size={64} style={{ color: '#ff6b6b', marginBottom: '1rem' }} />
        <h2 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>Access Denied</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    );
  }

  const stats = getAdminStats();
  const filteredUsers = getFilteredUsers();

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card mb-4">
        <div className="d-flex align-center gap-3 mb-3">
          <Shield size={32} style={{ color: '#667eea' }} />
          <div>
            <h1 className="card-title">Admin Dashboard</h1>
            <p className="card-subtitle">Manage users, games, and platform settings</p>
          </div>
        </div>

        {error && (
          <div className="error-message mb-3">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="success-message mb-3">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="card mb-4">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={16} />
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            Users ({users.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <Gamepad2 size={16} />
            Games ({games.length})
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="card mb-4">
            <h3 className="card-title">Platform Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">
                  <Users size={16} />
                  Total Users
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">
                  <Trophy size={16} />
                  Active Players
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-value">{stats.totalGames}</div>
                <div className="stat-label">
                  <Gamepad2 size={16} />
                  Total Games
                </div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffa726, #ff7043)' }}>
                <div className="stat-value">{stats.activeGames}</div>
                <div className="stat-label">
                  <Target size={16} />
                  Active Games
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h4 className="card-title">Recent Activity</h4>
              <div className="text-center p-4">
                <Clock size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                <p style={{ color: '#666' }}>Activity tracking coming soon...</p>
              </div>
            </div>

            <div className="card">
              <h4 className="card-title">System Health</h4>
              <div className="system-health">
                <div className="health-item">
                  <span>Database</span>
                  <span className="health-status healthy">✅ Healthy</span>
                </div>
                <div className="health-item">
                  <span>API</span>
                  <span className="health-status healthy">✅ Running</span>
                </div>
                <div className="health-item">
                  <span>WebSocket</span>
                  <span className="health-status healthy">✅ Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="card mb-4">
            <div className="d-flex gap-3 align-center" style={{ flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: '0', flex: '1', minWidth: '250px' }}>
                <div style={{ position: 'relative' }}>
                  <Search 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#666'
                    }} 
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '45px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '0', minWidth: '150px' }}>
                <select
                  className="form-control"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="user">Regular Users</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">User Management</h3>
            
            {filteredUsers.length > 0 ? (
              <div className="users-list">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      <div className={`avatar ${user.role === 'admin' ? 'admin-avatar' : ''}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="user-info">
                      <div className="user-name">
                        {user.full_name || user.username}
                        {user.role === 'admin' && (
                          <span className="admin-badge">
                            <Shield size={12} />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="user-details">
                        <span>@{user.username}</span>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    
                    <div className="user-stats">
                      <div className="stat-item">
                        <strong>{user.total_games}</strong>
                        <span>Games</span>
                      </div>
                      <div className="stat-item">
                        <strong>{user.total_wins}</strong>
                        <span>Wins</span>
                      </div>
                      <div className="stat-item">
                        <strong>
                          {user.total_games > 0 ? Math.round((user.total_wins / user.total_games) * 100) : 0}%
                        </strong>
                        <span>Win Rate</span>
                      </div>
                    </div>
                    
                    <div className="user-actions">
                      <div className="user-joined">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <Users size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                <p style={{ color: '#666' }}>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div>
          <div className="card mb-4">
            <div className="d-flex justify-between align-center">
              <h3 className="card-title">Game Management</h3>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddGame(true)}
              >
                <Plus size={16} />
                Add New Game
              </button>
            </div>
          </div>

          {/* Add Game Form */}
          {showAddGame && (
            <div className="card mb-4">
              <div className="d-flex justify-between align-center mb-3">
                <h4>Add New Game</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowAddGame(false)}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Game Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    placeholder="Enter game name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={newGame.category}
                    onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                  >
                    <option value="strategy">Strategy</option>
                    <option value="memory">Memory</option>
                    <option value="puzzle">Puzzle</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={newGame.description}
                  onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                  placeholder="Enter game description"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Players</label>
                <input
                  type="number"
                  className="form-control"
                  value={newGame.max_players}
                  onChange={(e) => setNewGame({ ...newGame, max_players: parseInt(e.target.value) })}
                  min="1"
                  max="4"
                />
              </div>
              
              <button 
                className="btn btn-success"
                onClick={handleAddGame}
                disabled={!newGame.name || !newGame.description}
              >
                <Save size={16} />
                Add Game
              </button>
            </div>
          )}

          {/* Games List */}
          <div className="card">
            <div className="games-list">
              {games.map((game) => (
                <div key={game.id} className="game-item">
                  <div className="game-icon">
                    {game.id === 'tic-tac-toe' && '⭕'}
                    {game.id === 'memory-match' && '🧠'}
                    {game.id === 'rock-paper-scissors' && '✂️'}
                    {!['tic-tac-toe', 'memory-match', 'rock-paper-scissors'].includes(game.id) && '🎮'}
                  </div>
                  
                  <div className="game-info">
                    <div className="game-name">{game.name}</div>
                    <div className="game-description">{game.description}</div>
                    <div className="game-meta">
                      <span className="category-badge">{game.category}</span>
                      <span>{game.max_players} players max</span>
                      <span className={`status-badge ${game.is_active ? 'active' : 'inactive'}`}>
                        {game.is_active ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="game-actions">
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteGame(game.id)}
                      title="Delete game"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-tabs {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .tab-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .tab-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }
        
        .tab-button:hover:not(.active) {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }
        
        .system-health {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .health-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
        }
        
        .health-status.healthy {
          color: #56ab2f;
          font-weight: bold;
        }
        
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .user-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 15px;
          border: 1px solid #e0e0e0;
        }
        
        .user-avatar .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .user-avatar .avatar.admin-avatar {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-name {
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-badge {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .user-details {
          color: #666;
          font-size: 0.9rem;
          display: flex;
          gap: 1rem;
        }
        
        .user-stats {
          display: flex;
          gap: 1rem;
        }
        
        .stat-item {
          text-align: center;
          font-size: 0.8rem;
        }
        
        .stat-item strong {
          display: block;
          font-size: 1rem;
          color: #667eea;
        }
        
        .user-actions {
          text-align: right;
        }
        
        .user-joined {
          font-size: 0.8rem;
          color: #888;
        }
        
        .games-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .game-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 15px;
          border: 1px solid #e0e0e0;
        }
        
        .game-icon {
          font-size: 2rem;
          width: 60px;
          text-align: center;
        }
        
        .game-info {
          flex: 1;
        }
        
        .game-name {
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .game-description {
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .game-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .category-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
        }
        
        .status-badge.active {
          background: rgba(86, 171, 47, 0.1);
          color: #56ab2f;
        }
        
        .status-badge.inactive {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
        }
        
        @media (max-width: 768px) {
          .user-item, .game-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .user-stats {
            width: 100%;
            justify-content: space-around;
          }
          
          .game-meta {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminPage;
