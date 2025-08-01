import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award, Star, Users, Gamepad2, Target, TrendingUp, Filter } from 'lucide-react';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('total_score');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame]);

  const fetchData = async () => {
    try {
      const [gamesResponse] = await Promise.all([
        axios.get('/games')
      ]);
      
      setGames(gamesResponse.data);
      await fetchLeaderboard();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const params = selectedGame !== 'all' ? `?game_id=${selectedGame}&limit=50` : '?limit=50';
      const response = await axios.get(`/leaderboard${params}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const sortLeaderboard = (data, criteria) => {
    return [...data].sort((a, b) => {
      switch (criteria) {
        case 'total_score':
          return b.total_score - a.total_score;
        case 'total_games':
          return b.total_games - a.total_games;
        case 'total_wins':
          return b.total_wins - a.total_wins;
        case 'win_percentage':
          return b.win_percentage - a.win_percentage;
        default:
          return b.total_score - a.total_score;
      }
    });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} style={{ color: '#ffd700' }} />;
      case 2:
        return <Medal size={24} style={{ color: '#c0c0c0' }} />;
      case 3:
        return <Award size={24} style={{ color: '#cd7f32' }} />;
      default:
        return <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>#{rank}</span>;
    }
  };

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case 1:
        return 'rank-gold';
      case 2:
        return 'rank-silver';
      case 3:
        return 'rank-bronze';
      default:
        return 'rank-default';
    }
  };

  const getGameName = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.name : 'All Games';
  };

  const sortedLeaderboard = sortLeaderboard(leaderboard, sortBy);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card mb-4">
        <div className="text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Global Leaderboard
          </h1>
          <p className="card-subtitle" style={{ fontSize: '1.1rem' }}>
            See who's dominating the games and compete for the top spot!
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="d-flex gap-3 align-center" style={{ flexWrap: 'wrap' }}>
          {/* Game Filter */}
          <div className="form-group" style={{ marginBottom: '0', minWidth: '200px' }}>
            <label className="form-label">
              <Gamepad2 size={16} />
              Filter by Game
            </label>
            <select
              className="form-control"
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
            >
              <option value="all">All Games</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="form-group" style={{ marginBottom: '0', minWidth: '200px' }}>
            <label className="form-label">
              <Filter size={16} />
              Sort by
            </label>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="total_score">Total Score</option>
              <option value="total_games">Games Played</option>
              <option value="total_wins">Games Won</option>
              <option value="win_percentage">Win Percentage</option>
            </select>
          </div>

          <div className="leaderboard-info" style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#667eea', fontWeight: 'bold' }}>
              {getGameName(selectedGame)}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {sortedLeaderboard.length} players
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {sortedLeaderboard.length >= 3 && (
        <div className="card mb-4">
          <h3 className="card-title text-center mb-4">🥇 Top Performers</h3>
          
          <div className="podium-container">
            {/* Second Place */}
            <div className="podium-place second">
              <div className="podium-player">
                <div className="podium-avatar silver">
                  {sortedLeaderboard[1].username.charAt(0).toUpperCase()}
                </div>
                <div className="podium-name">{sortedLeaderboard[1].username}</div>
                <div className="podium-score">{sortedLeaderboard[1].total_score} pts</div>
                <div className="podium-stats">
                  {sortedLeaderboard[1].total_games} games • {sortedLeaderboard[1].win_percentage}% win rate
                </div>
              </div>
              <div className="podium-base silver-base">
                <Medal size={32} style={{ color: '#c0c0c0' }} />
                <div className="podium-rank">2nd</div>
              </div>
            </div>

            {/* First Place */}
            <div className="podium-place first">
              <div className="podium-player">
                <div className="podium-avatar gold">
                  {sortedLeaderboard[0].username.charAt(0).toUpperCase()}
                </div>
                <div className="podium-name">{sortedLeaderboard[0].username}</div>
                <div className="podium-score">{sortedLeaderboard[0].total_score} pts</div>
                <div className="podium-stats">
                  {sortedLeaderboard[0].total_games} games • {sortedLeaderboard[0].win_percentage}% win rate
                </div>
              </div>
              <div className="podium-base gold-base">
                <Trophy size={40} style={{ color: '#ffd700' }} />
                <div className="podium-rank">1st</div>
              </div>
            </div>

            {/* Third Place */}
            <div className="podium-place third">
              <div className="podium-player">
                <div className="podium-avatar bronze">
                  {sortedLeaderboard[2].username.charAt(0).toUpperCase()}
                </div>
                <div className="podium-name">{sortedLeaderboard[2].username}</div>
                <div className="podium-score">{sortedLeaderboard[2].total_score} pts</div>
                <div className="podium-stats">
                  {sortedLeaderboard[2].total_games} games • {sortedLeaderboard[2].win_percentage}% win rate
                </div>
              </div>
              <div className="podium-base bronze-base">
                <Award size={28} style={{ color: '#cd7f32' }} />
                <div className="podium-rank">3rd</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="card">
        <h3 className="card-title">
          <Users size={24} />
          Full Rankings
        </h3>
        
        {sortedLeaderboard.length > 0 ? (
          <div className="leaderboard-list">
            {sortedLeaderboard.map((player, index) => (
              <div key={player.username} className={`leaderboard-item ${getRankBadgeClass(index + 1)}`}>
                <div className="leaderboard-rank">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="leaderboard-avatar">
                  <div className={`avatar ${getRankBadgeClass(index + 1)}`}>
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="leaderboard-user">
                  <div className="leaderboard-username">{player.username}</div>
                  <div className="leaderboard-stats">
                    <span>
                      <Gamepad2 size={14} />
                      {player.total_games} games
                    </span>
                    <span>
                      <Trophy size={14} />
                      {player.total_wins} wins
                    </span>
                    <span>
                      <Target size={14} />
                      {player.win_percentage}% win rate
                    </span>
                  </div>
                </div>
                
                <div className="leaderboard-score">
                  <div className="score-value">
                    <Star size={16} />
                    {player.total_score}
                  </div>
                  <div className="score-label">points</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <Trophy size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h4 style={{ color: '#666', marginBottom: '1rem' }}>No rankings yet</h4>
            <p style={{ color: '#888' }}>
              {selectedGame !== 'all' 
                ? `No scores recorded for ${getGameName(selectedGame)} yet.`
                : 'Be the first to play and claim the top spot!'
              }
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .podium-container {
          display: flex;
          justify-content: center;
          align-items: end;
          gap: 2rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }
        
        .podium-place {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .podium-player {
          margin-bottom: 1rem;
        }
        
        .podium-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .podium-avatar.gold {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
        }
        
        .podium-avatar.silver {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
        }
        
        .podium-avatar.bronze {
          background: linear-gradient(135deg, #cd7f32, #daa520);
        }
        
        .podium-name {
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .podium-score {
          font-size: 1.2rem;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 0.25rem;
        }
        
        .podium-stats {
          font-size: 0.8rem;
          color: #666;
        }
        
        .podium-base {
          padding: 1.5rem;
          border-radius: 15px 15px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: bold;
          min-width: 120px;
        }
        
        .gold-base {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          height: 100px;
        }
        
        .silver-base {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          height: 80px;
        }
        
        .bronze-base {
          background: linear-gradient(135deg, #cd7f32, #daa520);
          height: 60px;
        }
        
        .podium-rank {
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .first { order: 2; }
        .second { order: 1; }
        .third { order: 3; }
        
        .leaderboard-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 15px;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .leaderboard-item.rank-gold {
          border-left-color: #ffd700;
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 255, 255, 0.9));
        }
        
        .leaderboard-item.rank-silver {
          border-left-color: #c0c0c0;
          background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), rgba(255, 255, 255, 0.9));
        }
        
        .leaderboard-item.rank-bronze {
          border-left-color: #cd7f32;
          background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), rgba(255, 255, 255, 0.9));
        }
        
        .leaderboard-item.rank-default {
          border-left-color: #667eea;
        }
        
        .leaderboard-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }
        
        .leaderboard-rank {
          width: 60px;
          text-align: center;
        }
        
        .leaderboard-avatar {
          margin-right: 1rem;
        }
        
        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .avatar.rank-gold {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
        }
        
        .avatar.rank-silver {
          background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
          color: #333;
        }
        
        .avatar.rank-bronze {
          background: linear-gradient(135deg, #cd7f32, #daa520);
        }
        
        .leaderboard-user {
          flex: 1;
        }
        
        .leaderboard-username {
          font-weight: bold;
          font-size: 1.1rem;
          color: #333;
          margin-bottom: 0.25rem;
        }
        
        .leaderboard-stats {
          display: flex;
          gap: 1rem;
          color: #666;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }
        
        .leaderboard-stats span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .leaderboard-score {
          text-align: right;
        }
        
        .score-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: #667eea;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          justify-content: flex-end;
        }
        
        .score-label {
          font-size: 0.8rem;
          color: #888;
        }
        
        @media (max-width: 768px) {
          .podium-container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .first, .second, .third {
            order: initial;
          }
          
          .leaderboard-stats {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default LeaderboardPage;
