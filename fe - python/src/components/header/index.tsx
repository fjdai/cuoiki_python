import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { callLogout } from '../../services/apiUser/apiAuth';
import { toast } from 'react-toastify';
import { doLogoutAction } from '../../redux/account/accountSlice';
import { Fade } from '@mui/material';
import Divider from '@mui/material/Divider';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Button from '@mui/material/Button';

const Header = () => {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);
    const roleId = useSelector((state: any) => state.account.user.roleId);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.statusCode === 200) {
            dispatch(doLogoutAction());
            navigate("/");
            toast.success("Đăng xuất thành công");
        } else {
            toast.error("Đăng xuất thất bại");
        }
    }

    const handleLoginClick = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleProceedToLogin = () => {
        setOpenDialog(false);
        navigate("/login");
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 0
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar
                        sx={{
                            padding: { xs: '8px 16px', md: '8px 40px' },
                            gap: { xs: 1, md: "5%" },
                            height: { xs: '64px', md: '72px' },
                            justifyContent: 'space-between'
                        }}
                        disableGutters
                    >
                        {/* Logo Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                size="large"
                                onClick={handleOpenNavMenu}
                                sx={{
                                    display: { xs: 'flex', md: 'none' },
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'rgba(69, 195, 210, 0.08)'
                                    }
                                }}
                            >
                                <MenuIcon />
                            </IconButton>

                            <Box
                                component="div"
                                onClick={() => navigate("/")}
                                sx={{
                                    cursor: "pointer",
                                    display: 'flex',
                                    alignItems: "center",
                                    gap: 1,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                            >
                                <LocalHospitalIcon
                                    sx={{
                                        color: "primary.main",
                                        fontSize: { xs: 28, md: 32 },
                                        filter: 'drop-shadow(0 2px 4px rgba(69, 195, 210, 0.2))'
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 800,
                                        background: 'linear-gradient(45deg, #45c3d2, #2196f3)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '0.5px',
                                        fontSize: { xs: '1.2rem', md: '1.5rem' }
                                    }}
                                >
                                    DoctorCare
                                </Typography>
                            </Box>
                        </Box>

                        {/* Navigation Links - Desktop */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 4,
                                alignItems: 'center',
                                flex: 1,
                                justifyContent: 'center'
                            }}
                        >
                            {[
                                { title: 'Chuyên Khoa', path: '/specialty' },
                                { title: 'Cơ sở y tế', path: '/clinic' },
                                { title: 'Bác sĩ', path: '/doctor' }
                            ].map((item) => (
                                <Box
                                    key={item.title}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        py: 1,
                                        '&:after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '0%',
                                            height: '2px',
                                            backgroundColor: 'primary.main',
                                            transition: 'width 0.3s ease'
                                        },
                                        '&:hover': {
                                            '&:after': {
                                                width: '100%'
                                            },
                                            color: 'primary.main'
                                        }
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '0.95rem',
                                            color: 'text.primary',
                                            transition: 'color 0.3s ease'
                                        }}
                                    >
                                        {item.title}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Right Section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Typography
                                sx={{
                                    display: { xs: "none", md: "block" },
                                    color: "primary.main",
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Hỗ trợ
                            </Typography>

                            {isAuthenticated && (
                                <Box
                                    onClick={() => navigate(roleId === 1 ? "/admin" : roleId === 2 ? "/doctor-management" : "/supporter")}
                                    sx={{
                                        cursor: 'pointer',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        backgroundColor: 'rgba(69, 195, 210, 0.08)',
                                        transition: 'all 0.2s',
                                        display: { xs: 'none', md: 'block' },
                                        '&:hover': {
                                            backgroundColor: 'rgba(69, 195, 210, 0.15)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ color: 'primary.main', fontWeight: 500, fontSize: '0.9rem' }}>
                                        Trang quản lí
                                    </Typography>
                                </Box>
                            )}

                            {isAuthenticated ? (
                                <Box
                                    onClick={handleLogout}
                                    sx={{
                                        cursor: 'pointer',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(69, 195, 210, 0.08)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.9rem' }}>
                                        Đăng xuất
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    onClick={handleLoginClick}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                        Đăng nhập
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Mobile Menu */}
                        <Menu
                            anchorEl={anchorElNav}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            TransitionComponent={Fade}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                '& .MuiPaper-root': {
                                    borderRadius: 2,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    mt: 1.5,
                                    minWidth: 200
                                }
                            }}
                        >
                            {[
                                { title: 'Chuyên Khoa', path: '/specialty' },
                                { title: 'Cơ sở y tế', path: '/clinic' },
                                { title: 'Bác sĩ', path: '/doctor' }
                            ].map((item) => (
                                <MenuItem
                                    key={item.title}
                                    onClick={() => {
                                        navigate(item.path);
                                        handleCloseNavMenu();
                                    }}
                                    sx={{
                                        py: 1.5,
                                        px: 3
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 500 }}>{item.title}</Typography>
                                </MenuItem>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            {isAuthenticated && (
                                <MenuItem
                                    onClick={() => {
                                        handleCloseNavMenu();
                                        navigate(roleId === 1 ? "/admin" : roleId === 2 ? "/doctor" : "/supporter");
                                    }}
                                    sx={{ py: 1.5, px: 3 }}
                                >
                                    <Typography sx={{ fontWeight: 500 }}>Trang quản lí</Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </Toolbar>
                </Container>
            </AppBar>
            <Box sx={{ height: { xs: '64px', md: '72px' } }} />
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxWidth: 400,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    color: 'primary.main'
                }}>
                    Thông báo
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ textAlign: 'center', mb: 2 }}>
                        Chức năng đăng nhập chỉ dành cho Admin, Bác sĩ và Nhân viên hỗ trợ.
                    </Typography>
                    <Typography sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Bạn có muốn tiếp tục?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 2 }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            borderColor: 'grey.400',
                            color: 'text.primary',
                            '&:hover': {
                                borderColor: 'grey.500',
                                backgroundColor: 'grey.50'
                            }
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleProceedToLogin}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        Tiếp tục
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Header;
