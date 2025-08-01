import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { LogOut, User, Trophy, Gamepad2, Home, Shield } from 'lucide-react';

function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎮 PlayHub
      </Link>
      
      <ul className="navbar-nav">
        <li>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={18} />
            Home
          </Link>
        </li>
        
        <li>
          <Link 
            to="/games" 
            className={`nav-link ${isActive('/games') ? 'active' : ''}`}
          >
            <Gamepad2 size={18} />
            Games
          </Link>
        </li>
        
        <li>
          <Link 
            to="/leaderboard" 
            className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            <Trophy size={18} />
            Leaderboard
          </Link>
        </li>
        
        {isAuthenticated ? (
          <>
            <li>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <User size={18} />
                Profile
              </Link>
            </li>
            
            {isAdmin && (
              <li>
                <Link 
                  to="/admin" 
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                >
                  <Shield size={18} />
                  Admin
                </Link>
              </li>
            )}
            
            <li>
              <span className="nav-link" style={{ color: '#667eea', fontWeight: 'bold' }}>
                Welcome, {user.username}!
              </span>
            </li>
            
            <li>
              <button className="btn btn-outline" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
