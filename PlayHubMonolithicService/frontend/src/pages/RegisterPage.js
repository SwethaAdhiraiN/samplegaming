import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || null
      });
      
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '#ccc' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ff416c', '#ff6b6b', '#ffa726', '#66bb6a', '#4caf50'];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || 'Very Weak',
      color: colors[strength - 1] || '#ff416c'
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="fade-in">
      <div className="d-flex justify-center">
        <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="text-center mb-4">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎮</div>
            <h2 className="card-title">Join PlayHub!</h2>
            <p className="card-subtitle">Create your account and start playing amazing games</p>
          </div>

          {errors.general && (
            <div className="error-message mb-3">
              <AlertCircle size={16} />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Username *
              </label>
              <input
                type="text"
                name="username"
                className={`form-control ${errors.username ? 'error' : ''}`}
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Full Name (Optional)
              </label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Password *
              </label>
              <input
                type="password"
                name="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {formData.password && (
                <div className="mt-1">
                  <div 
                    style={{ 
                      height: '4px', 
                      background: '#f0f0f0', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${passwordStrength.strength}%`,
                        background: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <small style={{ color: passwordStrength.color, fontSize: '0.8rem' }}>
                    {passwordStrength.label}
                  </small>
                </div>
              )}
              {errors.password && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="success-message">
                  <CheckCircle size={14} />
                  Passwords match
                </div>
              )}
              {errors.confirmPassword && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="d-flex align-center justify-center gap-2">
                  <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                  Creating Account...
                </div>
              ) : (
                <div className="d-flex align-center justify-center gap-2">
                  <UserPlus size={16} />
                  Create Account
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: 'bold' 
                }}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
