import { Box, Button, Container, Typography, Paper, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowBack } from '@mui/icons-material';

const NotPermitted = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(255, 87, 87, 0.05) 0%, rgba(255, 87, 87, 0.1) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative circles */}
            <Box sx={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 87, 87, 0.1) 0%, rgba(255, 87, 87, 0.05) 100%)',
                top: '-100px',
                right: '-100px',
                zIndex: 0
            }} />
            <Box sx={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 196, 25, 0.1) 0%, rgba(255, 196, 25, 0.05) 100%)',
                bottom: '-50px',
                left: '-50px',
                zIndex: 0
            }} />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in timeout={1000}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: '120px',
                                fontWeight: 800,
                                background: 'linear-gradient(45deg, #ff5757, #ff8c8c)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                textShadow: '4px 4px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            403
                        </Typography>

                        <Box
                            component="img"
                            src="../../../src/assets/403.gif"
                            alt="403"
                            sx={{
                                maxWidth: "100%",
                                height: "auto",
                                maxHeight: "300px",
                                borderRadius: 4,
                                mb: 4,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}
                        />

                        <Typography
                            variant="h5"
                            sx={{
                                color: 'text.primary',
                                fontWeight: 600,
                                mb: 4,
                                lineHeight: 1.5
                            }}
                        >
                            Bạn không có quyền truy cập trang này
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(-1)}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    borderWidth: 2,
                                    borderColor: '#ff5757',
                                    color: '#ff5757',
                                    '&:hover': {
                                        borderWidth: 2,
                                        borderColor: '#ff5757',
                                        transform: 'translateX(-4px)',
                                        boxShadow: '0 4px 12px rgba(255, 87, 87, 0.2)'
                                    }
                                }}
                            >
                                Quay lại
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<Home />}
                                onClick={() => navigate("/")}
                                sx={{
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #ff5757 30%, #ff8c8c 90%)',
                                    boxShadow: '0 4px 12px rgba(255, 87, 87, 0.25)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #ff4242 30%, #ff7777 90%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 16px rgba(255, 87, 87, 0.35)'
                                    }
                                }}
                            >
                                Về trang chủ
                            </Button>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
}

export default NotPermitted;