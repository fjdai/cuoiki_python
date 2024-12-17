import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableSortLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    FormHelperText,
} from '@mui/material';
import {
    Search,
    Edit,
    Delete,
    Add as AddIcon,
    Refresh,
    Download,
    Upload,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { callCreateUser, callDeleteUser, callGetAllUsers, callUpdateUser } from '../../services/apiAdmin';
import * as XLSX from 'xlsx';
import { callAllClinics, callAllSpecialities } from '../../services/apiPatient/apiHome';

interface Clinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    description: string;
    image: string | null;
    createAt: Date;
    updateAt: Date;
    isDeleted: boolean;
}

interface Specialization {
    id: string;
    description: string | null;
    image: string | null;
    name: string;
    createAt: Date;
    updateAt: Date;
}

interface DoctorUser {
    doctorId: string;
    clinicId: string;
    specializationId: string;
    clinic: Clinic;
    specialization: Specialization;
}

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    avatar: string | null;
    gender: "Male" | "Female";
    description: string | null;
    refresh_token: string | null;
    roleId: number;
    createAt: Date;
    updateAt: Date;
    isDeleted: boolean;
    doctor_user: DoctorUser | null;
}

type Order = 'asc' | 'desc';

// Thêm các type mới để hỗ trợ sort
type SortableField = keyof User | 'specialization' | 'clinic';

interface HeadCell {
    id: SortableField;  // Thay đổi type ở đây
    label: string;
    sortable: boolean;
}

// Thêm interface mới cho việc sắp xếp
interface SortConfig {
    property: SortableField;  // Thay đổi type ở đây
    order: Order;
}

// Thêm state và interface cho form
interface UserFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    gender: "Male" | "Female";
    roleId: number;
    password?: string;
    specializationId?: string;
    clinicId?: string;
    description?: string;
}

interface UserFormError {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: string;
    roleId?: string;
    password?: string;
    specializationId?: string;
    clinicId?: string;
    description?: string;
}

// Thêm hàm format role label
const getRoleLabel = (roleId: number) => {
    switch (roleId) {
        case 1:
            return 'Admin';
        case 2:
            return 'Bác sĩ';
        case 3:
            return 'Hỗ trợ viên';
        default:
            return 'Không xác định';
    }
};

const ManageUser = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        gender: "Male",
        roleId: 1,
        password: '',
        specializationId: '',
        clinicId: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState<UserFormError>({});
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);

    const headCells: HeadCell[] = [
        { id: 'name', label: 'Tên', sortable: true },
        { id: 'email', label: 'Email', sortable: true },
        { id: 'phone', label: 'Số điện thoại', sortable: true },
        { id: 'roleId', label: 'Vai trò', sortable: true },
        { id: 'specialization', label: 'Chuyên khoa', sortable: true },
        { id: 'clinic', label: 'Phòng khám', sortable: true },
    ];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await callGetAllUsers();
            if (res && res.data) {
                setUsers(res.data);
            } else {
                toast.error('Không thể tải danh sách người dùng');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchSpecializationsAndClinics = async () => {
            try {
                const [specRes, clinicRes] = await Promise.all([
                    callAllSpecialities(),
                    callAllClinics()
                ]);

                if (specRes?.data) {
                    setSpecializations(specRes.data);
                }
                if (clinicRes?.data) {
                    setClinics(clinicRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu chuyên khoa và phòng khám');
            }
        };

        fetchSpecializationsAndClinics();
    }, []);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            roleId: user.roleId,
            password: '',
            specializationId: user.doctor_user?.specializationId || '',
            clinicId: user.doctor_user?.clinicId || '',
            description: user.description || ''
        });
        setOpenDialog(true);
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }
        const res = await callDeleteUser(userId);
        if (res && res.data) {
            toast.success('Xóa người dùng thành công');
            fetchUsers();
        }
        else {
            toast.error(res.message || 'Có lỗi xảy ra');
        }
    };

    const filteredUsers = users.filter(user =>
        Object.entries(user)
            .filter(([key]) => ['name', 'email', 'phone', 'address'].includes(key))
            .some(([_, value]) =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
    );


    // Thay đổi hàm sortData
    const sortData = (data: User[]) => {
        return [...data].sort((a, b) => {
            for (const config of sortConfig) {
                if (config.property === 'specialization') {
                    const aValue = a.doctor_user?.specialization?.name || '';
                    const bValue = b.doctor_user?.specialization?.name || '';

                    const comparison = config.order === 'asc'
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));

                    if (comparison !== 0) return comparison;
                } else if (config.property === 'clinic') {
                    const aValue = a.doctor_user?.clinic?.name || '';
                    const bValue = b.doctor_user?.clinic?.name || '';

                    const comparison = config.order === 'asc'
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));

                    if (comparison !== 0) return comparison;
                } else {
                    const aValue = a[config.property as keyof User];
                    const bValue = b[config.property as keyof User];

                    if (!aValue || !bValue) continue;

                    const comparison = config.order === 'asc'
                        ? String(aValue).localeCompare(String(bValue))
                        : String(bValue).localeCompare(String(aValue));

                    if (comparison !== 0) return comparison;
                }
            }
            return 0;
        });
    };

    const sortedUsers = sortData([...filteredUsers]);

    // Thay đổi hàm handleRequestSort
    const handleRequestSort = (property: keyof User) => {
        setSortConfig((prevConfig) => {
            const propertyConfig = prevConfig.find(config => config.property === property);

            if (!propertyConfig) {
                // Thêm mới nếu chưa có
                return [...prevConfig, { property, order: 'asc' }];
            }

            if (propertyConfig.order === 'asc') {
                // Chuyển từ asc sang desc
                return prevConfig.map(config =>
                    config.property === property ? { ...config, order: 'desc' } : config
                );
            }

            // Xóa khỏi danh sách sort nếu đang là desc
            return prevConfig.filter(config => config.property !== property);
        });
    };

    // Cập nhật availableRoles
    const availableRoles = [
        { value: 1, label: 'Admin' },
        { value: 2, label: 'Bác sĩ' },
        { value: 3, label: 'Hỗ trợ viên' }
    ];

    // Thêm hàm validate form
    const validateForm = () => {
        const errors: UserFormError = {};

        if (!formData.name.trim()) {
            errors.name = 'Vui lòng nhập họ tên';
        } else if (formData.name.length < 2) {
            errors.name = 'Tên phải có ít nhất 2 ký tự';
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!formData.email) {
            errors.email = 'Vui lòng nhập email';
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Email không hợp lệ';
        }

        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!formData.phone) {
            errors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!phoneRegex.test(formData.phone)) {
            errors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.address?.trim()) {
            errors.address = 'Vui lòng nhập địa chỉ';
        }

        if (!selectedUser && !formData.password) {
            errors.password = 'Vui lòng nhập mật khẩu';
        } else if (!selectedUser && formData.password && formData.password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.roleId === 2) {
            if (!formData.specializationId) {
                errors.specializationId = 'Vui lòng chọn chuyên khoa';
            }
            if (!formData.clinicId) {
                errors.clinicId = 'Vui lòng chọn phòng khám';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Thêm hàm handleSubmit
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        setLoading(true);
        try {
            if (selectedUser) {
                // Update existing user
                const res = await callUpdateUser(
                    selectedUser.id,
                    formData.name,
                    formData.email,
                    formData.phone,
                    formData.address,
                    formData.gender,
                    formData.roleId,
                    formData.roleId === 2 ? formData.specializationId : undefined,
                    formData.roleId === 2 ? formData.clinicId : undefined,
                    formData.description || ""
                );



                if (res && res.data) {
                    toast.success('Cập nhật người dùng thành công');
                    fetchUsers();
                    handleCloseDialog();
                } else {
                    toast.error(res.message || 'Có lỗi xảy ra');
                }
            } else {
                // Create new user
                const res = await callCreateUser(
                    formData.name,
                    formData.email,
                    formData.phone,
                    formData.address,
                    formData.gender,
                    formData.roleId,
                    formData.password || "123456",
                    formData.roleId === 2 ? formData.specializationId : undefined,
                    formData.roleId === 2 ? formData.clinicId : undefined,
                    formData.description || ''
                );

                if (res && res.data) {
                    toast.success('Thêm mới người dùng thành công');
                    fetchUsers();
                    handleCloseDialog();
                } else {
                    toast.error(res.message || 'Có lỗi xảy ra');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm resetForm
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            gender: "Male",
            roleId: 1,
            password: '',
            specializationId: '',
            clinicId: '',
            description: ''
        });
        setFormErrors({});
        setSelectedUser(null);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        resetForm();
    };

    // Thêm hàm download template
    const handleDownloadTemplate = () => {
        const template = [
            ['Họ tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Giới tính', 'Vai trò', 'Mật khẩu'],
            ['Nguyễn Văn A', 'nguyenvana@example.com', '0912345678', 'Hà Nội', 'Male', '2', '123456'],
            ['Trần Thị B', 'tranthib@example.com', '0987654321', 'TP.HCM', 'Female', '3', '123456'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'user_template.xlsx');
    };

    // Thêm hàm xử lý import file
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Bỏ qua hàng header
            const newUsers = (jsonData as any[]).slice(1).map(row => ({
                name: row[0],
                email: row[1],
                phone: row[2],
                address: row[3],
                gender: row[4] as "Male" | "Female",
                roleId: Number(row[5]),
                password: row[6]
            }));

            // Validate dữ liệu
            const errors: string[] = [];
            newUsers.forEach((user, index) => {
                if (!user.name || !user.email || !user.phone || !user.gender || !user.roleId || !user.password) {
                    errors.push(`Dòng ${index + 2}: Thiếu thông tin bắt buộc`);
                }
                if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(user.email)) {
                    errors.push(`Dòng ${index + 2}: Email không hợp lệ`);
                }
                if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(user.phone)) {
                    errors.push(`Dòng ${index + 2}: Số điện thoại không hợp lệ`);
                }
                if (!["Male", "Female"].includes(user.gender)) {
                    errors.push(`Dòng ${index + 2}: Giới tính phải là "Male" hoặc "Female"`);
                }
                if (![1, 2, 3].includes(user.roleId)) {
                    errors.push(`Dòng ${index + 2}: Vai trò không hợp lệ`);
                }
            });

            if (errors.length > 0) {
                toast.error(
                    <div>
                        <div>Lỗi import:</div>
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </div>
                );
                return;
            }

            // TODO: Gọi API để import users
            // const response = await importUsers(newUsers);

            toast.success('Import người dùng thành công');
            fetchUsers(); // Refresh danh sách
        } catch (error) {
            console.error('Error importing users:', error);
            toast.error('Có lỗi xảy ra khi import file');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Typography variant="h4" sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                    Quản lý người dùng
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedUser(null);
                            setOpenDialog(true);
                        }}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 2
                        }}
                    >
                        Thêm mới
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={fetchUsers}
                        sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.lighter',
                                borderColor: 'primary.main'
                            },
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleDownloadTemplate}
                        startIcon={<Download />}
                    >
                        Tải template
                    </Button>

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<Upload />}
                    >
                        Import
                        <input
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            onClick={(e) => {
                                // Reset input để có thể chọn lại cùng một file
                                (e.target as HTMLInputElement).value = '';
                            }}
                        />
                    </Button>
                </Box>
            </Box>

            <Paper elevation={3} sx={{
                borderRadius: 2,
                overflow: 'hidden'
            }}>
                <Box sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <TextField
                        placeholder="Tìm kiếm người dùng..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                bgcolor: theme => theme.palette.mode === 'light'
                                    ? 'grey.100'
                                    : 'grey.900'
                            }}>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={sortConfig.find(config => config.property === headCell.id)?.order || false}
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            color: 'text.primary'
                                        }}
                                    >
                                        {headCell.sortable ? (
                                            <TableSortLabel
                                                active={sortConfig.some(config => config.property === headCell.id)}
                                                direction={sortConfig.find(config => config.property === headCell.id)?.order || 'asc'}
                                                onClick={() => handleRequestSort(headCell.id as keyof User)}
                                                sx={{
                                                    '&.MuiTableSortLabel-root': {
                                                        color: 'text.primary',
                                                    },
                                                    '&.MuiTableSortLabel-root:hover': {
                                                        color: 'primary.main',
                                                    },
                                                    '&.Mui-active': {
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            >
                                                {headCell.label}
                                            </TableSortLabel>
                                        ) : (
                                            headCell.label
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : sortedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <TableRow
                                            key={user.id}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.phone}</TableCell>
                                            <TableCell>{getRoleLabel(user.roleId)}</TableCell>
                                            <TableCell>
                                                {user.doctor_user?.specialization?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.doctor_user?.clinic?.name || '-'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEdit(user)}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(user.id)}
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={sortedUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        '.MuiTablePagination-select': {
                            borderRadius: 1,
                        }
                    }}
                />
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: theme => theme.shadows[5]
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'primary.lighter'
                }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Họ tên"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            required
                        />
                        <TextField
                            label="Số điện thoại"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            required
                        />
                        <TextField
                            label="Địa chỉ"
                            fullWidth
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            error={!!formErrors.address}
                            helperText={formErrors.address}
                        />
                        <TextField
                            label="Mô tả"
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            error={!!formErrors.description}
                            helperText={formErrors.description}
                        />
                        {!selectedUser && (
                            <TextField
                                label="Mật khẩu"
                                type="password"
                                fullWidth
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={!!formErrors.password}
                                helperText={formErrors.password}
                                required
                            />
                        )}
                        <FormControl fullWidth required error={!!formErrors.gender}>
                            <InputLabel>Giới tính</InputLabel>
                            <Select
                                value={formData.gender}
                                label="Giới tính"
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "Male" | "Female" })}
                            >
                                <MenuItem value="Male">Nam</MenuItem>
                                <MenuItem value="Female">Nữ</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required error={!!formErrors.roleId}>
                            <InputLabel>Vai trò</InputLabel>
                            <Select
                                value={formData.roleId}
                                label="Vai trò"
                                onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                            >
                                {availableRoles.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {formData.roleId === 2 && (
                            <>
                                <FormControl fullWidth required error={!!formErrors.specializationId}>
                                    <InputLabel>Chuyên khoa</InputLabel>
                                    <Select
                                        value={formData.specializationId}
                                        label="Chuyên khoa"
                                        onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
                                    >
                                        {specializations.map((spec) => (
                                            <MenuItem key={spec.id} value={spec.id}>
                                                {spec.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.specializationId && (
                                        <FormHelperText>{formErrors.specializationId}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl fullWidth required error={!!formErrors.clinicId}>
                                    <InputLabel>Phòng khám</InputLabel>
                                    <Select
                                        value={formData.clinicId}
                                        label="Phòng khám"
                                        onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                                    >
                                        {clinics.map((clinic) => (
                                            <MenuItem key={clinic.id} value={clinic.id}>
                                                {clinic.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {formErrors.clinicId && (
                                        <FormHelperText>{formErrors.clinicId}</FormHelperText>
                                    )}
                                </FormControl>
                            </>
                        )}
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
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {selectedUser ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageUser; 