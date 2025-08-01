import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Gamepad2, Users, Play, Search, Filter } from 'lucide-react';

function GamesPage() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, selectedCategory]);

  const fetchGames = async () => {
    try {
      const response = await axios.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGames = () => {
    let filtered = games;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    setFilteredGames(filtered);
  };

  const getGameIcon = (gameId) => {
    const icons = {
      'tic-tac-toe': '⭕',
      'memory-match': '🧠',
      'rock-paper-scissors': '✂️'
    };
    return icons[gameId] || '🎮';
  };

  const getGameGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)',
      'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const categories = ['all', 'strategy', 'memory', 'puzzle'];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading games...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header Section */}
      <div className="card mb-4">
        <div className="text-center">
          <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            <Gamepad2 size={48} style={{ marginRight: '1rem' }} />
            Game Collection
          </h1>
          <p className="card-subtitle" style={{ fontSize: '1.1rem' }}>
            Choose from our amazing collection of mini-games and start playing instantly!
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card mb-4">
        <div className="d-flex gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div className="form-group" style={{ flex: '1', minWidth: '250px', marginBottom: '0' }}>
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
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '45px' }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: '0' }}>
            <div style={{ position: 'relative' }}>
              <Filter 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666',
                  zIndex: 1
                }} 
              />
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ paddingLeft: '45px', minWidth: '150px' }}
              >
                <option value="all">All Categories</option>
                <option value="strategy">Strategy</option>
                <option value="memory">Memory</option>
                <option value="puzzle">Puzzle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-3" style={{ color: '#666', fontSize: '0.9rem' }}>
          Showing {filteredGames.length} of {games.length} games
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-3">
          {filteredGames.map((game, index) => (
            <div key={game.id} className="game-card" style={{ background: getGameGradient(index) }}>
              <div className="game-icon">
                {getGameIcon(game.id)}
              </div>
              
              <h3 className="game-title">{game.name}</h3>
              <p className="game-description">{game.description}</p>
              
              <div className="game-stats mb-3">
                <span>
                  <Users size={16} />
                  {game.max_players === 1 ? 'Single Player' : `Up to ${game.max_players} players`}
                </span>
                <span style={{ textTransform: 'capitalize' }}>
                  🎯 {game.category}
                </span>
              </div>
              
              <Link
                to={`/games/${game.id}`}
                className="btn btn-outline w-full"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  textDecoration: 'none'
                }}
              >
                <Play size={16} />
                Play Now
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center p-4">
          <Gamepad2 size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h3 style={{ color: '#666', marginBottom: '1rem' }}>No games found</h3>
          <p style={{ color: '#888' }}>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No games are currently available.'
            }
          </p>
          
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              className="btn btn-primary mt-2"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Game Categories Info */}
      <div className="card mt-4">
        <h3 className="card-title">Game Categories</h3>
        <div className="grid grid-3">
          <div className="text-center p-3">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Strategy</h4>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Test your tactical thinking and planning skills with strategy-based games.
            </p>
          </div>
          
          <div className="text-center p-3">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧠</div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Memory</h4>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Challenge your memory and concentration with pattern-matching games.
            </p>
          </div>
          
          <div className="text-center p-3">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧩</div>
            <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Puzzle</h4>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Solve complex puzzles and brain teasers to sharpen your mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamesPage;
