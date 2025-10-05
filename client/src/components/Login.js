import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Alert,
  Fade,
  Zoom,
  IconButton,
  InputAdornment
} from '@mui/material';
import { 
  LockOutlined, 
  PersonOutline, 
  Visibility, 
  VisibilityOff,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Custom animation for floating effect
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Custom animation for pulse effect
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Redirect to dashboard after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      // All users go to dashboard after login
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (!username || !password) {
      setError('Please enter both username and password');
      setIsSubmitting(false);
      return;
    }
    
    const result = await login({ username, password });
    
    if (!result.success) {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: darkMode 
            ? 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' 
            : 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
          animation: `${float} 6s ease-in-out infinite`,
          zIndex: 0
        }
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <Paper 
            elevation={12} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              background: darkMode 
                ? 'rgba(30, 30, 46, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: darkMode 
                ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                : '0 20px 40px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #967bb6, #98fb98)',
                animation: `${pulse} 2s ease-in-out infinite`
              }
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    m: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: `${float} 3s ease-in-out infinite`,
                    boxShadow: darkMode 
                      ? '0 0 30px rgba(150, 123, 182, 0.5)' 
                      : '0 0 30px rgba(150, 123, 182, 0.3)',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  <LockOutlined sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                
                <Typography 
                  component="h1" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: darkMode 
                      ? 'linear-gradient(45deg, #967bb6, #98fb98)' 
                      : 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                  }}
                >
                  {t('login.title')}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? 'text.secondary' : 'rgba(0, 0, 0, 0.6)',
                    mb: 3,
                    textAlign: 'center'
                  }}
                >
                  Sign in to access your dashboard
                </Typography>
                
                {error && (
                  <Fade in={true}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        width: '100%', 
                        mb: 2,
                        borderRadius: 2
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label={t('login.username')}
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label={t('login.password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          color="primary" 
                          sx={{
                            color: 'primary.main',
                            '&.Mui-checked': {
                              color: 'primary.main'
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: darkMode ? 'text.secondary' : 'rgba(0, 0, 0, 0.7)' }}>
                          {t('login.rememberMe')}
                        </Typography>
                      }
                    />
                    <IconButton 
                      onClick={toggleDarkMode}
                      sx={{ 
                        color: darkMode ? 'warning.main' : 'info.main',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(33, 150, 243, 0.1)'
                        }
                      }}
                    >
                      {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ 
                      mt: 1, 
                      mb: 2,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #967bb6, #764ba2)',
                      boxShadow: '0 4px 15px rgba(150, 123, 182, 0.3)',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #967bb6)',
                        boxShadow: '0 6px 20px rgba(150, 123, 182, 0.4)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      },
                      '&:disabled': {
                        background: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    {isSubmitting ? 'Signing In...' : t('login.signIn')}
                  </Button>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Link 
                        href="#" 
                        variant="body2"
                        sx={{ 
                          color: darkMode ? 'primary.light' : 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {t('login.forgotPassword')}
                      </Link>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Link 
                        href="#" 
                        variant="body2"
                        sx={{ 
                          color: darkMode ? 'primary.light' : 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {t('login.noAccount')}
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Fade>
          </Paper>
        </Zoom>
      </Container>
    </Box>
  );
};

export default Login;