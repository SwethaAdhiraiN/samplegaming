import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-center">
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="text-center mb-4">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
            <h2 className="card-title">Welcome Back!</h2>
            <p className="card-subtitle">Sign in to continue your gaming journey</p>
          </div>

          {error && (
            <div className="error-message mb-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${error ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password
              </label>
              <input
                type="password"
                name="password"
                className={`form-control ${error ? 'error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="d-flex align-center justify-center gap-2">
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Signing In...
                </div>
              ) : (
                <div className="d-flex align-center justify-center gap-2">
                  <LogIn size={16} />
                  Sign In
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p style={{ color: '#666' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: 'bold' 
                }}
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Demo credentials info */}
          <div className="mt-4 p-3" style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9rem'
          }}>
            <strong>Demo Account:</strong><br />
            Email: demo@playhub.com<br />
            Password: demo123
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
