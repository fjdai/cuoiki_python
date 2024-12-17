import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store.tsx';
import { PersistGate } from 'redux-persist/lib/integration/react';
import 'nprogress/nprogress.css';
import "./styles/main.scss"

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#45c3d2',
      light: '#6ad4e1',
      dark: '#2b9aa8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#FFC419',
      light: '#ffd24d',
      dark: '#cc9c00',
      contrastText: '#2a2a2a'
    },
    text: {
      primary: '#2a2a2a',
      secondary: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: "#f8f9fa"
    },
  },
  typography: {
    fontFamily: '"Nunito", "Open Sans", sans-serif',
    h1: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.5px'
    },
    h2: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.25px'
    },
    h3: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Open Sans", sans-serif',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: '"Open Sans", sans-serif',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #45c3d2 0%, #6ad4e1 100%)',
          boxShadow: '0 4px 16px rgba(69, 195, 210, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2b9aa8 0%, #45c3d2 100%)',
            boxShadow: '0 6px 20px rgba(69, 195, 210, 0.35)',
          }
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(69, 195, 210, 0.15)'
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(69, 195, 210, 0.15)'
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          '&.MuiAppBar-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)'
        }
      }
    }
  },
  shape: {
    borderRadius: 12
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <ToastContainer autoClose={2500} />
        </ThemeProvider>
      </PersistGate >
    </Provider>
  </StrictMode>
)
