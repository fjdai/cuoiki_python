import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography, Container, Paper, Link } from "@mui/material";
import { useEffect, useState } from "react";
import background from "../../assets/bg-login.jpg";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../services/apiUser/apiInfo";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff, LocalHospital } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { doLoginAction } from "../../redux/account/accountSlice";
import { callLogin } from "../../services/apiUser/apiAuth";

const LoginPage = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [openForgotDialog, setOpenForgotDialog] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);

    const user = useSelector((state: any) => state.account.user);


    useEffect(() => {
        if (user?.roleId) {
            switch (user.roleId) {
                case 1:
                    navigate("/admin");
                    break;
                case 2:
                    navigate("/doctor-management");
                    break;
                case 3:
                    navigate("/supporter");
                    break;
            }
        }
    }, [user, navigate])


    const handleOnSubmit = async (event: any) => {
        event.preventDefault();

        if (openForgotDialog) {
            await handleForgotPassword();
            return;
        }

        if (!email.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Email không hợp lệ');
            return;
        }

        if (!password) {
            toast.error('Vui lòng nhập mật khẩu');
            return;
        }

        setIsLoading(true);
        try {
            const res = await callLogin(email, password);
            if (res?.data) {
                localStorage.setItem("access_token", res.data.access_token);
                dispatch(doLoginAction(res.data.user));
                toast.success("Đăng nhập thành công");
            } else {
                toast.error("Thông tin đăng nhập không chính xác");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại sau");
        } finally {
            setIsLoading(false);
        }
    }

    const handleForgotPassword = async () => {
        if (!forgotEmail.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(forgotEmail)) {
            toast.error('Email không hợp lệ');
            return;
        }

        setIsSendingReset(true);
        try {
            const res = await forgotPassword(forgotEmail);
            if (res && res.statusCode === 200) {
                toast.success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu');
                setOpenForgotDialog(false);
                setForgotEmail("");
            } else {
                toast.error('Email không tồn tại trong hệ thống');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại sau');
        }
        setIsSendingReset(false);
    };

    return (
        !user?.roleId ?
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    background: `linear-gradient(rgba(69, 195, 210, 0.1), rgba(69, 195, 210, 0.1)), url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    py: 12,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={24}
                        sx={{
                            p: 4,
                            borderRadius: 4,
                            backdropFilter: "blur(10px)",
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }}
                    >
                        {!openForgotDialog ? (
                            <Box
                                component="form"
                                onSubmit={handleOnSubmit}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <LocalHospital sx={{ color: 'primary.main', fontSize: 40, mr: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                                        DoctorCare
                                    </Typography>
                                </Box>

                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="abc@gmail.com"
                                    autoComplete="email"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        }
                                    }}
                                />

                                <TextField
                                    required
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        }
                                    }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Button
                                        onClick={() => navigate("/")}
                                        sx={{
                                            color: 'text.secondary',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            }
                                        }}
                                        startIcon={<ArrowBackIcon />}
                                    >
                                        Về trang chủ
                                    </Button>

                                    <Link
                                        component="button"
                                        variant="body2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setOpenForgotDialog(true);
                                        }}
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </Box>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    disabled={isLoading}
                                    sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        height: 48,
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    {isLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" />
                                            Đang đăng nhập...
                                        </Box>
                                    ) : (
                                        'Đăng nhập'
                                    )}
                                </Button>
                            </Box>
                        ) : (
                            <Box
                                component="form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleForgotPassword();
                                }}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ textAlign: 'center', color: 'primary.main' }}>
                                    Quên mật khẩu
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                                    Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                                </Typography>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    disabled={isSendingReset}
                                />
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        onClick={() => {
                                            setOpenForgotDialog(false);
                                            setForgotEmail('');
                                        }}
                                        disabled={isSendingReset}
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        disabled={isSendingReset}
                                    >
                                        {isSendingReset ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} color="inherit" />
                                                Đang xử lý...
                                            </Box>
                                        ) : (
                                            'Gửi'
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Container>
            </Box>
            : null
    );
};

export default LoginPage;