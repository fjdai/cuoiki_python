import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
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
    CircularProgress,
    InputAdornment,
    TextField as MuiTextField,
    TableSortLabel,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { callGetPatientForDoctor, callSendBill } from '../../services/apiDoctor/apiManage';


// Interface Data
interface DoctorSchedule {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    Patient_Schedule: PatientSchedule[];
}

interface PatientSchedule {
    id: string;
    patient: Patient;
    status: string;
    isShown?: boolean;
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



interface HeadCell {
    id: string;
    label: string;
    sortable: boolean;
}


interface SortConfig {
    property: string;
    order: 'asc' | 'desc';
}

const ManagePatient = () => {
    const [tab, setTab] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
    const [patients, setPatients] = useState<DoctorSchedule[]>([]);
    const [sendingBill, setSendingBill] = useState<string | null>(null);

    // Handle filter patients
    const filteredPatients = patients
        .map(schedule => {
            // Map Patient_Schedule để thêm trường isShown
            const updatedPatientSchedules = schedule.Patient_Schedule.map(patientSchedule => {
                if (!patientSchedule?.patient) return { ...patientSchedule, isShown: false };

                const matchesSearch =
                    patientSchedule.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    patientSchedule.patient.phone.includes(searchTerm) ||
                    patientSchedule.patient.email.toLowerCase().includes(searchTerm.toLowerCase());

                // Lọc theo tab và status
                let isShown = false;
                if (tab === 0) {
                    // Tab "Tất cả" - hiển thị tất cả bệnh nhân có trạng thái Done
                    isShown = matchesSearch && patientSchedule.status.toLowerCase() === 'done';
                } else {
                    // Tab "Chưa gửi hóa đơn" - chỉ hiển thị trạng thái Accept
                    isShown = matchesSearch && patientSchedule.status.toLowerCase() === 'accept';
                }

                return { ...patientSchedule, isShown };
            });

            return {
                ...schedule,
                Patient_Schedule: updatedPatientSchedules
            };
        })
        .filter(schedule => schedule.Patient_Schedule.some(ps => ps.isShown)); // Chỉ giữ lại schedule có ít nhất 1 patient schedule được hiển thị

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await callGetPatientForDoctor();
            if (res.statusCode === 200) {
                setPatients(res.data);
            } else {
                toast.error('Không thể tải danh sách bệnh nhân');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchPatients();
    }, []);


    // Handle change tab
    const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        setPage(0);
    };

    // Handle change page
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle change rows per page
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    // Handle send bill
    const handleSendBill = async (patientId: string, scheduleId: string) => {
        try {
            setSendingBill(`${patientId}-${scheduleId}`);
            const res = await callSendBill(patientId, scheduleId);
            if (res && res.statusCode === 200) {
                toast.success('Gửi hóa đơn thành công');
                fetchPatients();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra khi gửi hóa đơn');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi hóa đơn');
        } finally {
            setSendingBill(null);
        }
    };


    // Handle search
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // Handle open detail dialog
    const handleOpenDetailDialog = (patient: Patient) => {
        setSelectedPatient(patient);
        setOpenDetailDialog(true);
    };

    // Get status label
    const getStatusLabel = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'done') {
            return 'Đã gửi hóa đơn';
        }
        if (statusLower === 'accept') {
            return 'Chờ gửi hóa đơn';
        }

        return 'Không xác định';
    };

    // Get status color
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'done') {
            return 'success';
        }
        if (statusLower === 'accept') {
            return 'warning';
        }
        return 'default';
    };

    // Head cells
    const headCells: HeadCell[] = [
        { id: 'startTime', label: 'Thời gian bắt đầu', sortable: true },
        { id: 'endTime', label: 'Thời gian kết thúc', sortable: true },
        { id: 'price', label: 'Giá khám', sortable: true },
        { id: 'patient', label: 'Thông tin bệnh nhân', sortable: false },
        { id: 'status', label: 'Trạng thái', sortable: true },
    ];

    // Handle sort
    const handleSort = (property: string) => {
        setSortConfig((prevSort) => {
            const isPropertyExist = prevSort.find(sort => sort.property === property);

            if (isPropertyExist) {
                if (isPropertyExist.order === 'asc') {
                    return prevSort.map(sort =>
                        sort.property === property ? { ...sort, order: 'desc' } : sort
                    );
                } else {
                    return prevSort.filter(sort => sort.property !== property);
                }
            } else {
                return [...prevSort, { property, order: 'asc' as const }];
            }
        });
    };

    // Format date time
    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    return (
        <Box sx={{ p: 3, mt: { xs: 8, sm: 8, md: 9 } }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Quản lý bệnh nhân
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={tab}
                    onChange={handleChangeTab}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 2,
                        bgcolor: 'background.paper'
                    }}
                >
                    <Tab label="Tất cả bệnh nhân" />
                    <Tab label="Chưa gửi hóa đơn" />
                </Tabs>

                {/* Search and Sort Bar */}
                <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <MuiTextField
                        size="small"
                        placeholder="Tìm kiếm bệnh nhân..."
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            backgroundColor: 'background.neutral',
                                            ...(headCell.sortable && {
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                }
                                            })
                                        }}
                                        onClick={headCell.sortable ? () => handleSort(headCell.id) : undefined}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {headCell.label}
                                            {headCell.sortable && (
                                                <TableSortLabel
                                                    active={sortConfig.some(sort => sort.property === headCell.id)}
                                                    direction={
                                                        sortConfig.find(sort => sort.property === headCell.id)?.order || 'asc'
                                                    }
                                                    sx={{
                                                        '& .MuiTableSortLabel-icon': {
                                                            color: 'primary.main !important',
                                                        },
                                                        '&.Mui-active': {
                                                            color: 'primary.main',
                                                        },
                                                    }}
                                                >
                                                    {sortConfig.findIndex(sort => sort.property === headCell.id) > -1 && (
                                                        <Box component="span" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
                                                            {sortConfig.findIndex(sort => sort.property === headCell.id) + 1}
                                                        </Box>
                                                    )}
                                                </TableSortLabel>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: 'background.neutral',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
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
                            ) : filteredPatients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 3 }}>
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPatients
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((schedule) =>
                                        schedule.Patient_Schedule
                                            .filter(patientSchedule => patientSchedule.isShown)
                                            .map((patientSchedule) => (
                                                <TableRow
                                                    key={`${schedule.id}-${patientSchedule.id}`}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDateTime(schedule.startTime)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDateTime(schedule.endTime)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500} color="primary">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND'
                                                            }).format(schedule.price)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {patientSchedule.patient.name}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                            >
                                                                <Box component="span" sx={{
                                                                    width: 6,
                                                                    height: 6,
                                                                    borderRadius: '50%',
                                                                    bgcolor: 'success.main',
                                                                    display: 'inline-block'
                                                                }} />
                                                                {patientSchedule.patient.phone}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusLabel(patientSchedule.status)}
                                                            color={getStatusColor(patientSchedule.status)}
                                                            sx={{
                                                                fontWeight: 600,
                                                                minWidth: 120,
                                                                justifyContent: 'center',
                                                                borderRadius: 1,
                                                                height: 24,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => handleOpenDetailDialog(patientSchedule.patient)}
                                                                sx={{
                                                                    borderRadius: 1,
                                                                    textTransform: 'none',
                                                                    fontWeight: 500,
                                                                    minWidth: 100,
                                                                    height: 32,
                                                                    fontSize: '0.875rem',
                                                                    '&:hover': {
                                                                        backgroundColor: 'primary.lighter'
                                                                    }
                                                                }}
                                                            >
                                                                Chi tiết
                                                            </Button>
                                                            {tab === 1 && (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => handleSendBill(patientSchedule.patient.id, schedule.id)}
                                                                    disabled={sendingBill === `${patientSchedule.patient.id}-${schedule.id}`}
                                                                    sx={{
                                                                        borderRadius: 1,
                                                                        textTransform: 'none',
                                                                        fontWeight: 500,
                                                                        minWidth: 100,
                                                                        height: 32,
                                                                        fontSize: '0.875rem',
                                                                        '&:hover': {
                                                                            backgroundColor: 'primary.dark'
                                                                        }
                                                                    }}
                                                                >
                                                                    {sendingBill === `${patientSchedule.patient.id}-${schedule.id}` ? (
                                                                        <CircularProgress size={20} color="inherit" />
                                                                    ) : (
                                                                        'Gửi hóa đơn'
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredPatients.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                />
            </Paper>

            {/* Patient Detail Dialog */}
            <Dialog
                open={openDetailDialog}
                onClose={() => setOpenDetailDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Chi tiết lịch khám</DialogTitle>
                <DialogContent>
                    {selectedPatient && (
                        <Box sx={{
                            pt: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            '& .info-row': {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2
                            },
                            '& .label': {
                                width: 120,
                                flexShrink: 0,
                                color: 'text.secondary',
                                fontSize: '0.875rem'
                            },
                            '& .value': {
                                flex: 1,
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }
                        }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Thông tin bệnh nhân
                            </Typography>

                            <Box className="info-row">
                                <Typography className="label">Họ và tên:</Typography>
                                <Typography className="value">
                                    {selectedPatient.name}
                                </Typography>
                            </Box>

                            <Box className="info-row">
                                <Typography className="label">Giới tính:</Typography>
                                <Chip
                                    label={selectedPatient.gender.toLowerCase() === 'male' ? 'Nam' : 'Nữ'}
                                    size="small"
                                    color={selectedPatient.gender.toLowerCase() === 'male' ? 'info' : 'secondary'}
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>

                            <Box className="info-row">
                                <Typography className="label">Số điện thoại:</Typography>
                                <Typography className="value">
                                    {selectedPatient.phone}
                                </Typography>
                            </Box>

                            <Box className="info-row">
                                <Typography className="label">Email:</Typography>
                                <Typography className="value">
                                    {selectedPatient.email}
                                </Typography>
                            </Box>

                            <Box className="info-row">
                                <Typography className="label">Địa chỉ:</Typography>
                                <Typography className="value">
                                    {selectedPatient.address}
                                </Typography>
                            </Box>

                            {selectedPatient.description && (
                                <Box className="info-row">
                                    <Typography className="label">Mô tả:</Typography>
                                    <Typography className="value">
                                        {selectedPatient.description}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={() => setOpenDetailDialog(false)}
                        variant="contained"
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagePatient;