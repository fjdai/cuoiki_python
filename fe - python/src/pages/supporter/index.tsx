import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    InputAdornment,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { callDeleteAppointment, callGetPatientForSupporter, callUpdateAppointmentStatus, } from '../../services/apiSupporter/apiManage';


// Interface data
interface Data {
    Accept:
    {
        patients: AppointmentData[]
    }
    Pending:
    {
        patients: AppointmentData[]
    }
    Reject:
    {
        patients: AppointmentData[]
    }
}

interface Patient {
    id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    address: string;
    description: string;
}

interface AppointmentData {
    patient: Patient;
    startTime: string;
    endTime: string;
    price: number;
    scheduleId: string;
    maxBooking: number;
    doctor: {
        name: string;
        phone: string;
    };
    status?: 'pending' | 'confirmed' | 'cancelled';
}



const Supporter = () => {
    const [data, setData] = useState<Data>();
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);

    // Head cells
    const headCells = [
        { id: 'patient', label: 'Tên bệnh nhân', sortable: true },
        { id: 'patient', label: 'Số điện thoại', sortable: true },
        { id: 'doctor', label: 'Bác sĩ', sortable: true },
        { id: 'startTime', label: 'Thời gian bắt đầu', sortable: true },
        { id: 'endTime', label: 'Thời gian kết thúc', sortable: true },
        { id: 'price', label: 'Giá (VNĐ)', sortable: true },
        { id: 'status', label: 'Trạng thái', sortable: true },
    ];

    // Transform data to display
    const transformAppointments = useCallback(() => {
        if (!data) return [];
        try {
            const pendingAppointments = data.Pending?.patients?.map(item => ({
                ...item,
                status: 'pending' as const
            })) || [];

            const acceptedAppointments = data.Accept?.patients?.map(item => ({
                ...item,
                status: 'confirmed' as const
            })) || [];

            const rejectedAppointments = data.Reject?.patients?.map(item => ({
                ...item,
                status: 'cancelled' as const
            })) || [];

            const allAppointments = [
                ...pendingAppointments,
                ...acceptedAppointments,
                ...rejectedAppointments
            ];

            return allAppointments;
        } catch (error) {
            return [];
        }
    }, [data]);

    // Render table rows
    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                        <CircularProgress />
                    </TableCell>
                </TableRow>
            );
        }

        // Get appointments list by status
        let appointments = [];
        if (selectedStatus === 'pending') {
            appointments = data?.Pending?.patients || [];
        } else if (selectedStatus === 'confirmed') {
            appointments = data?.Accept?.patients || [];
        } else if (selectedStatus === 'cancelled') {
            appointments = data?.Reject?.patients || [];
        } else {
            // If no status is selected, display all
            appointments = transformAppointments();
        }

        // Filter by search term
        const filteredAppointments = appointments.filter(appointment => {
            const searchFields = [
                appointment.patient.name,
                appointment.patient.phone,
                appointment.doctor.name,
                appointment.doctor.phone
            ];

            return searchFields.some(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        if (!filteredAppointments.length) {
            return (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                        Không có dữ liệu
                    </TableCell>
                </TableRow>
            );
        }

        return filteredAppointments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((appointment, index) => (
                <TableRow
                    key={index}
                    sx={{
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        cursor: 'pointer'
                    }}
                >
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>{appointment.patient.phone}</TableCell>
                    <TableCell>{appointment.doctor.name}</TableCell>
                    <TableCell>
                        {new Date(appointment.startTime).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </TableCell>
                    <TableCell>
                        {new Date(appointment.endTime).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </TableCell>
                    <TableCell>
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(appointment.price)}
                    </TableCell>
                    <TableCell>
                        {getStatusChip(appointment.status || (
                            selectedStatus === 'pending' ? 'pending' :
                                selectedStatus === 'confirmed' ? 'confirmed' :
                                    selectedStatus === 'cancelled' ? 'cancelled' : 'pending'
                        ))}
                    </TableCell>
                    <TableCell align="right">
                        {renderActionButtons(appointment)}
                    </TableCell>
                </TableRow>
            ));
    };

    // Detail Dialog Content
    const renderDetailDialog = () => (
        <Dialog
            open={openDetailDialog}
            onClose={() => setOpenDetailDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1.2rem'
            }}>
                Chi tiết lịch hẹn
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                {selectedAppointment && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Thông tin bệnh nhân
                            </Typography>
                            <Typography><strong>Họ tên:</strong> {selectedAppointment.patient.name}</Typography>
                            <Typography><strong>Email:</strong> {selectedAppointment.patient.email}</Typography>
                            <Typography><strong>Số điện thoại:</strong> {selectedAppointment.patient.phone}</Typography>
                            <Typography><strong>Giới tính:</strong> {selectedAppointment.patient.gender}</Typography>
                            <Typography><strong>Địa chỉ:</strong> {selectedAppointment.patient.address}</Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ my: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Thông tin bác sĩ
                            </Typography>
                            <Typography><strong>Họ tên:</strong> {selectedAppointment.doctor.name}</Typography>
                            <Typography><strong>Số điện thoại:</strong> {selectedAppointment.doctor.phone}</Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Thông tin lịch hẹn
                            </Typography>
                            <Typography><strong>Thời gian bắt đầu:</strong> {' '}
                                {new Date(selectedAppointment.startTime).toLocaleString('vi-VN')}
                            </Typography>
                            <Typography><strong>Thời gian kết thúc:</strong> {' '}
                                {new Date(selectedAppointment.endTime).toLocaleString('vi-VN')}
                            </Typography>
                            <Typography><strong>Giá khám:</strong> {' '}
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(selectedAppointment.price)}
                            </Typography>
                            <Typography><strong>Trạng thái:</strong> {' '}
                                {getStatusChip(selectedAppointment.status)}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                <Button
                    onClick={() => setOpenDetailDialog(false)}
                    variant="contained"
                    color="primary"
                >
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Get status chip
    const getStatusChip = (status?: string) => {
        switch (status) {
            case 'pending':
                return <Chip label="Chờ xác nhận" color="warning" size="small" />;
            case 'confirmed':
                return <Chip label="Đã xác nhận" color="success" size="small" />;
            case 'cancelled':
                return <Chip label="Đã hủy" color="error" size="small" />;
            default:
                return <Chip label="Không xác định" size="small" />;
        }
    };

    // Search handler
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // Status filter handler
    const handleStatusFilter = (status: string | null) => {
        setSelectedStatus(status);
        setPage(0);
    };

    // Page change handler
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Rows per page change handler
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Fetch data
    const fetchData = async () => {
        try {
            const response = await callGetPatientForSupporter();

            if (response?.data) {
                const formattedData = {
                    Pending: {
                        patients: response.data.Pending?.patients || []
                    },
                    Accept: {
                        patients: response.data.Accept?.patients || []
                    },
                    Reject: {
                        patients: response.data.Reject?.patients || []
                    }
                };
                setData(formattedData);
            } else {
                toast.error('Dữ liệu không hợp lệ');
            }
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);

    // Delete handler
    const handleDelete = async () => {
        if (!selectedAppointment) return;

        setLoading(true);
        const response = await callDeleteAppointment(selectedAppointment.patient.id, selectedAppointment.scheduleId);

        if (response && response.data) {
            toast.success('Xóa lịch hẹn thành công');
            fetchData();
            setOpenConfirmDelete(false);
        }
        else {
            toast.error('Không thể xóa lịch hẹn');
        }
        setLoading(false);
    };

    // Update status handler
    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedAppointment) return;
        const status = newStatus === 'pending' ? 'Pending' : newStatus === 'confirmed' ? 'Accept' : 'Reject';

        setLoading(true);
        const response = await callUpdateAppointmentStatus(selectedAppointment.scheduleId, selectedAppointment.patient.id, status);
        if (response && response.data) {
            toast.success('Cập nhật trạng thái thành công');
            fetchData();
            setOpenEditDialog(false);
        }
        else {
            toast.error('Không thể cập nhật trạng thái');
        }
        setLoading(false);
    };

    // Render action buttons
    const renderActionButtons = (appointment: AppointmentData) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton
                onClick={() => {
                    setSelectedAppointment(appointment);
                    setOpenDetailDialog(true);
                }}
                color="info"
                size="small"
                title="Xem chi tiết"
            >
                <VisibilityIcon />
            </IconButton>
            <IconButton
                onClick={() => {
                    setSelectedAppointment(appointment);
                    setOpenEditDialog(true);
                }}
                color="primary"
                size="small"
                title="Chỉnh sửa"
            >
                <EditIcon />
            </IconButton>
            <IconButton
                onClick={() => {
                    setSelectedAppointment(appointment);
                    setOpenConfirmDelete(true);
                }}
                color="error"
                size="small"
                title="Xóa"
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    );

    // Delete dialog
    const renderDeleteDialog = () => (
        <Dialog
            open={openConfirmDelete}
            onClose={() => setOpenConfirmDelete(false)}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ color: 'error.main' }}>
                Xác nhận xóa
            </DialogTitle>
            <DialogContent>
                <Typography>
                    Bạn có chắc chắn muốn xóa lịch hẹn này không?
                    Hành động này không thể hoàn tác.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => setOpenConfirmDelete(false)}
                    color="inherit"
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleDelete}
                    color="error"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Xóa'}
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Edit dialog
    const renderEditDialog = () => (
        <Dialog
            open={openEditDialog}
            onClose={() => setOpenEditDialog(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '1.2rem'
            }}>
                Cập nhật trạng thái
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant={selectedAppointment?.status === 'pending' ? 'contained' : 'outlined'}
                        color="warning"
                        onClick={() => handleUpdateStatus('pending')}
                        disabled={loading}
                    >
                        Chờ xác nhận
                    </Button>
                    <Button
                        variant={selectedAppointment?.status === 'confirmed' ? 'contained' : 'outlined'}
                        color="success"
                        onClick={() => handleUpdateStatus('confirmed')}
                        disabled={loading}
                    >
                        Xác nhận
                    </Button>
                    <Button
                        variant={selectedAppointment?.status === 'cancelled' ? 'contained' : 'outlined'}
                        color="error"
                        onClick={() => handleUpdateStatus('cancelled')}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(224, 224, 224, 1)' }}>
                <Button
                    onClick={() => setOpenEditDialog(false)}
                    color="inherit"
                >
                    Đóng
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Rows per page options
    const rowsPerPageOptions = [5, 10, 25, 50];

    return (
        <Box sx={{ p: 3, mt: { xs: 8, sm: 8, md: 9 } }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Quản lý lịch hẹn
            </Typography>

            <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    borderBottom: '1px solid rgba(224, 224, 224, 1)'
                }}>
                    <TextField
                        placeholder="Tìm kiếm theo tên, số điện thoại..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1, minWidth: '200px' }}
                    />
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                    }}>
                        <Chip
                            label={`Tất cả (${transformAppointments().length})`}
                            color={selectedStatus === null ? 'primary' : 'default'}
                            onClick={() => handleStatusFilter(null)}
                            variant={selectedStatus === null ? 'filled' : 'outlined'}
                            sx={{ '&:hover': { opacity: 0.8 } }}
                        />
                        <Chip
                            label={`Chờ xác nhận (${data?.Pending?.patients?.length || 0})`}
                            color={selectedStatus === 'pending' ? 'warning' : 'default'}
                            onClick={() => handleStatusFilter('pending')}
                            variant={selectedStatus === 'pending' ? 'filled' : 'outlined'}
                            sx={{ '&:hover': { opacity: 0.8 } }}
                        />
                        <Chip
                            label={`Đã xác nhận (${data?.Accept?.patients?.length || 0})`}
                            color={selectedStatus === 'confirmed' ? 'success' : 'default'}
                            onClick={() => handleStatusFilter('confirmed')}
                            variant={selectedStatus === 'confirmed' ? 'filled' : 'outlined'}
                            sx={{ '&:hover': { opacity: 0.8 } }}
                        />
                        <Chip
                            label={`Đã hủy (${data?.Reject?.patients?.length || 0})`}
                            color={selectedStatus === 'cancelled' ? 'error' : 'default'}
                            onClick={() => handleStatusFilter('cancelled')}
                            variant={selectedStatus === 'cancelled' ? 'filled' : 'outlined'}
                            sx={{ '&:hover': { opacity: 0.8 } }}
                        />
                    </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.label}
                                        sx={{
                                            fontWeight: 600,
                                            backgroundColor: 'background.paper',
                                            borderBottom: '2px solid rgba(224, 224, 224, 1)',
                                        }}
                                    >
                                        {headCell.label}
                                    </TableCell>
                                ))}
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: 'background.paper',
                                        borderBottom: '2px solid rgba(224, 224, 224, 1)',
                                    }}
                                >
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {renderTableRows()}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={selectedStatus === null
                        ? transformAppointments().length
                        : selectedStatus === 'pending'
                            ? data?.Pending?.patients?.length || 0
                            : selectedStatus === 'confirmed'
                                ? data?.Accept?.patients?.length || 0
                                : data?.Reject?.patients?.length || 0
                    }
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={rowsPerPageOptions}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                    showFirstButton
                    showLastButton
                    sx={{
                        borderTop: '1px solid rgba(224, 224, 224, 1)',
                        '.MuiTablePagination-selectLabel': {
                            marginBottom: '0px',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '.MuiTablePagination-displayedRows': {
                            marginBottom: '0px',
                        },
                        '.MuiTablePagination-select': {
                            marginRight: '32px',
                        },
                        '.MuiTablePagination-actions': {
                            marginLeft: '20px',
                            '& .MuiIconButton-root': {
                                padding: '8px',
                                '&.Mui-disabled': {
                                    opacity: 0.5,
                                },
                            },
                        },
                    }}
                />
            </Paper>

            {renderDetailDialog()}
            {renderDeleteDialog()}
            {renderEditDialog()}
        </Box>
    );
};

export default Supporter;
