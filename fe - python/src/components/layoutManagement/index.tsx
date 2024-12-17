import { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItemButton, ListItemIcon, ListItemText, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BusinessIcon from '@mui/icons-material/Business';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doLogoutAction, doUpdateInfoAction } from '../../redux/account/accountSlice';
import { callUploadAvt, changePassword } from '../../services/apiUser/apiInfo';
import { toast } from 'react-toastify';
import { callLogout } from '../../services/apiUser/apiAuth';

const drawerWidth = 280;

const LayoutManagement = () => {
    const [open, setOpen] = useState(true);
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.account.user);
    const [openProfileDialog, setOpenProfileDialog] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');
    const [editedPhone, setEditedPhone] = useState(user?.phone || '');
    const [editedEmail, setEditedEmail] = useState(user?.email || '');
    const [editedGender, setEditedGender] = useState(user?.gender || '');
    const [editedAddress, setEditedAddress] = useState(user?.address || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string>('');
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Menu items
    const menuItemsforAdmin = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
        { text: 'Quản lý người dùng', icon: <PeopleIcon />, path: '/admin/manage' },
        { text: 'Quản lý cơ sở khám bệnh', icon: <BusinessIcon />, path: '/admin/clinic' },
        { text: 'Quản lý chuyên ngành khám bệnh', icon: <MedicalServicesIcon />, path: '/admin/spec' },
    ];

    const menuItemsforDoctor = [
        { text: 'Quản lý lịch hẹn', icon: <EventNoteIcon />, path: '/doctor-management' },

        { text: 'Quản lý bệnh nhân', icon: <PeopleIcon />, path: '/doctor-management/patient' },
    ];

    const menuItemsforSupport = [
        { text: 'Quản lý bệnh nhân', icon: <EventNoteIcon />, path: '/supporter' },
    ];

    const menuItems = user?.roleId === 1 ? menuItemsforAdmin : user?.roleId === 2 ? menuItemsforDoctor : menuItemsforSupport;


    // Handle drawer
    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    // Handle logout
    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.statusCode === 200) {
            dispatch(doLogoutAction());
            navigate("/");
            toast.success('Đăng xuất thành công');
        } else {
            toast.error('Đăng xuất thất bại');
        }
    }

    // Handle click avatar
    const handleAvatarClick = () => {
        setEditedName(user?.name || '');
        setEditedPhone(user?.phone || '');
        setEditedEmail(user?.email || '');
        setEditedGender(user?.gender || '');
        setEditedAddress(user?.address || '');
        setAvatar(user?.avatar || '');
        setOpenProfileDialog(true);
    };

    // Handle file upload avatar
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setPreviewAvatar(previewUrl);
        setAvatarFile(file);
    };

    // Handle update profile
    const handleUpdateProfile = async () => {
        if (!editedName.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }

        if (!editedEmail.trim()) {
            toast.error('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editedEmail)) {
            toast.error('Email không hợp lệ');
            return;
        }
        setIsSubmitting(true);
        try {
            let newAvatarUrl = avatar;
            if (avatarFile) {
                const uploadRes = await callUploadAvt(avatarFile);
                if (uploadRes && uploadRes.data) {
                    newAvatarUrl = uploadRes.data;
                    setAvatar(newAvatarUrl);
                }
            }

            dispatch(doUpdateInfoAction({
                name: editedName,
                phone: editedPhone,
                email: editedEmail,
                gender: editedGender,
                address: editedAddress,
                avatar: newAvatarUrl,
            }));

            toast.success('Cập nhật thông tin thành công');
            setOpenProfileDialog(false);
        } catch (error) {
            toast.error('Cập nhật thông tin thất bại');
        }
        setIsSubmitting(false);
    };

    // Handle back home
    const handleBackHome = () => {
        navigate('/');
    };

    // Handle close dialog
    const handleCloseDialog = () => {
        setOpenProfileDialog(false);
        setPreviewAvatar('');
        setAvatarFile(null);
        setEditedName(user?.name || '');
        setEditedPhone(user?.phone || '');
        setEditedEmail(user?.email || '');
        setEditedGender(user?.gender || '');
        setEditedAddress(user?.address || '');
    };

    const handleChangePassword = async () => {
        // Validate
        if (!oldPassword) {
            toast.error('Vui lòng nhập mật khẩu cũ');
            return;
        }
        if (!newPassword) {
            toast.error('Vui lòng nhập mật khẩu mới');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await changePassword(oldPassword, newPassword);
            if (res && res.statusCode === 200) {
                toast.success('Đổi mật khẩu thành công');
                setOpenPasswordDialog(false);
                // Reset form
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error('Mật khẩu cũ không chính xác');
            }
        } catch (error) {
            toast.error('Đổi mật khẩu thất bại');
        }
        setIsChangingPassword(false);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: 'background.paper',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                    zIndex: theme.zIndex.drawer + 1,
                    borderRadius: 0,
                    height: 70,
                    justifyContent: 'center',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="primary"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(69, 195, 210, 0.08)',
                                transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <LocalHospitalIcon
                            sx={{
                                color: 'primary.main',
                                mr: 1,
                                fontSize: 35,
                                filter: 'drop-shadow(0 2px 4px rgba(69, 195, 210, 0.2))'
                            }}
                        />
                        <Typography
                            variant="h5"
                            color="primary.main"
                            fontWeight="bold"
                            sx={{
                                textShadow: '0 2px 4px rgba(69, 195, 210, 0.1)',
                                letterSpacing: '0.5px'
                            }}
                        >
                            DoctorCare {user?.roleId === 1 ? 'Admin' : user?.roleId === 2 ? 'Bác sĩ' : 'Hỗ trợ viên'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<HomeIcon />}
                            onClick={handleBackHome}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderWidth: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'rgba(69, 195, 210, 0.08)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(69, 195, 210, 0.15)'
                                }
                            }}
                        >
                            Trang chủ
                        </Button>
                        <Box
                            onClick={handleAvatarClick}
                            sx={{
                                width: 45,
                                height: 45,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: '0 2px 8px rgba(69, 195, 210, 0.2)',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(69, 195, 210, 0.25)'
                                }
                            }}
                        >
                            {avatar ? (
                                <Avatar
                                    src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${avatar}`}
                                    alt={user?.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        border: '2px solid white'
                                    }}
                                />
                            ) : (
                                user?.name?.charAt(0)?.toUpperCase() || 'A'
                            )}
                        </Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                borderWidth: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'rgba(69, 195, 210, 0.08)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 8px rgba(69, 195, 210, 0.15)'
                                }
                            }}
                        >
                            Đăng xuất
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
                        transition: theme.transitions.create('transform', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    },
                }}
            >
                <Toolbar sx={{ height: 70 }} />
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, px: 2 }}>
                        MENU CHÍNH
                    </Typography>
                    <List>
                        {menuItems.map((item) => (
                            <ListItemButton
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: location.pathname === item.path
                                            ? 'primary.dark'
                                            : 'rgba(69, 195, 210, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: location.pathname === item.path ? 'white' : 'text.secondary',
                                    minWidth: 40
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    sx={{
                                        '& .MuiListItemText-primary': {
                                            color: location.pathname === item.path ? 'white' : 'text.primary',
                                            fontWeight: 500,
                                        }
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
                    ml: open ? 0 : `-${drawerWidth}px`,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar sx={{ height: 70 }} />
                <Outlet />
            </Box>

            {/* Dialog update profile */}
            <Dialog
                open={openProfileDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Chỉnh sửa thông tin cá nhân
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                                component="label"
                            >
                                {((previewAvatar !== '') || avatar !== '') ? (
                                    <Avatar
                                        src={previewAvatar || `${import.meta.env.VITE_BACKEND_URL}/images/users/${avatar}`}
                                        alt={editedName}
                                        sx={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <Typography sx={{ color: 'white', fontSize: '2rem' }}>
                                        {editedName.charAt(0).toUpperCase()}
                                    </Typography>
                                )}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        py: 0.5,
                                        textAlign: 'center',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Thay đổi
                                </Box>
                            </Box>
                        </Box>
                        <TextField
                            label="Họ và tên"
                            fullWidth
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            required
                            error={!editedName.trim()}
                            helperText={!editedName.trim() ? 'Vui lòng nhập họ tên' : ''}
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={editedEmail}
                            onChange={(e) => setEditedEmail(e.target.value)}
                            required
                            error={!editedEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail)}
                            helperText={!editedEmail.trim() ? 'Vui lòng nhập email' :
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail) ? 'Email không hợp lệ' : ''}
                        />
                        <TextField
                            label="Số điện thoại"
                            fullWidth
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            inputProps={{ maxLength: 10 }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                                value={editedGender}
                                label="Giới tính"
                                onChange={(e) => setEditedGender(e.target.value)}
                            >
                                <MenuItem value="Male">Nam</MenuItem>
                                <MenuItem value="Female">Nữ</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Địa chỉ"
                            fullWidth
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            multiline
                            rows={2}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<LockIcon />}
                            onClick={() => setOpenPasswordDialog(true)}
                            sx={{
                                mt: 2,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: 'primary.lighter'
                                }
                            }}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{ color: 'text.secondary' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateProfile}
                        disabled={isSubmitting}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Change Dialog */}
            <Dialog
                open={openPasswordDialog}
                onClose={() => setOpenPasswordDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 400,
                        p: 2
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    color: 'primary.main',
                    fontWeight: 600,
                    pb: 2
                }}>
                    Đổi mật khẩu
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Mật khẩu cũ"
                            type={showOldPassword ? 'text' : 'password'}
                            fullWidth
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        edge="end"
                                    >
                                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                        <TextField
                            label="Mật khẩu mới"
                            type={showNewPassword ? 'text' : 'password'}
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        edge="end"
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                        <TextField
                            label="Xác nhận mật khẩu mới"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setOpenPasswordDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                Đang xử lý...
                            </Box>
                        ) : (
                            'Xác nhận'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LayoutManagement;
