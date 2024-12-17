import { useEffect, useState } from "react";
import { callCreateSchedule, callDeleteSchedule, callDoctorSchedule, callUpdateSchedule } from "../../services/apiDoctor/apiManage";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    CircularProgress,
    IconButton,
    Tooltip,
    TextField,
    DialogActions,
    InputAdornment,
} from "@mui/material";
import {
    AccessTime,
    Person,
    Phone,
    Email,
    LocationOn,
    Description,
    ChevronLeft,
    ChevronRight,
    Visibility as VisibilityIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import moment from 'moment';


interface DoctorSchedule {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    maxBooking: number;
    Patient_Schedule: PatientSchedule[];
}

interface PatientSchedule {
    patient: Patient;
    status: string;
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

interface GroupedSchedules {
    [date: string]: DoctorSchedule[];
}

const DoctorPatient = () => {
    const [groupedSchedules, setGroupedSchedules] = useState<GroupedSchedules>({});
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentDateIndex, setCurrentDateIndex] = useState(0);
    const [openTimeSlotDialog, setOpenTimeSlotDialog] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<DoctorSchedule | null>(null);
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);
    const [scheduleForm, setScheduleForm] = useState({
        startTime: new Date(),
        endTime: new Date(),
        price: 0,
        maxBooking: 1,
    });


    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await callDoctorSchedule();

            if (res.statusCode === 200) {
                const grouped = groupSchedulesByDate(res.data);
                setGroupedSchedules(grouped);
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const weekday = weekdays[date.getDay()];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${weekday}, ngày ${day} tháng ${month} năm ${year}`;
    };


    // Group schedules by date
    const groupSchedulesByDate = (schedules: DoctorSchedule[]) => {
        return schedules.reduce((groups: GroupedSchedules, schedule) => {
            const date = new Date(schedule.startTime);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(schedule);

            groups[dateKey].sort((a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            return groups;
        }, {});
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Sort dates
    const sortedDates = Object.keys(groupedSchedules).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    // Handle prev date
    const handlePrevDate = () => {
        setCurrentDateIndex(prev => Math.max(0, prev - 1));
    };

    // Handle next date
    const handleNextDate = () => {
        setCurrentDateIndex(prev => Math.min(sortedDates.length - 1, prev + 1));
    };

    // Handle today click
    const handleTodayClick = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayIndex = sortedDates.findIndex(date => date === today);
        if (todayIndex !== -1) {
            setCurrentDateIndex(todayIndex);
        }
    };

    // Handle view patients
    const handleViewPatients = (schedule: DoctorSchedule) => {
        const acceptedPatients = getAcceptedPatients(schedule);
        if (acceptedPatients.length === 0) {
            toast.info('Không có bệnh nhân nào trong khung giờ này');
            return;
        }
        setSelectedTimeSlot(schedule);
        setOpenTimeSlotDialog(true);
    };

    // Get accepted patients
    const getAcceptedPatients = (schedule: DoctorSchedule) => {
        return schedule.Patient_Schedule.filter(
            p => (p.status.toLowerCase() === 'accept' || p.status.toLowerCase() === 'done')
        );
    };

    // Handle open schedule dialog
    const handleOpenScheduleDialog = (mode: 'add' | 'edit', schedule?: DoctorSchedule) => {
        setDialogMode(mode);
        if (mode === 'edit' && schedule) {
            setSelectedSchedule(schedule);
            setScheduleForm({
                startTime: new Date(schedule.startTime),
                endTime: new Date(schedule.endTime),
                price: schedule.price,
                maxBooking: schedule.maxBooking,
            });
        } else {
            setSelectedSchedule(null);
            const now = new Date();
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1);

            setScheduleForm({
                startTime: now,
                endTime: nextHour,
                price: 0,
                maxBooking: 1,
            });
        }
        setOpenScheduleDialog(true);
    };


    // Handle submit schedule
    const handleSubmitSchedule = async () => {
        try {
            const { startTime, endTime, price, maxBooking } = scheduleForm;
            const now = new Date();
            // Tạo bản sao và reset minutes, seconds, milliseconds cho startTime và endTime
            const compareStartTime = new Date(startTime);
            compareStartTime.setMinutes(0, 0, 0);
            const compareEndTime = new Date(endTime);
            compareEndTime.setMinutes(0, 0, 0);

            // Validate thời gian
            if (moment(compareStartTime).isBefore(now) && dialogMode === 'add') {
                toast.error('Không thể tạo lịch cho thời gian trong quá khứ');
                return;
            }

            if (moment(compareStartTime).isAfter(compareEndTime)) {
                toast.error('Thời gian bắt đầu phải trước thời gian kết thúc');
                return;
            }

            // Validate giá khám
            if (price <= 0) {
                toast.error('Giá khám phải lớn hơn 0');
                return;
            }

            // Validate số lượng bệnh nhân
            if (maxBooking < 1) {
                toast.error('Số lượng bệnh nhân tối đa phải lớn hơn 0');
                return;
            }

            // Tạo payload với thời gian chỉ đến giờ
            const startTimeFormatted = new Date(startTime);
            startTimeFormatted.setMinutes(0, 0, 0);
            const endTimeFormatted = new Date(endTime);
            endTimeFormatted.setMinutes(0, 0, 0);

            if (dialogMode === 'add') {
                const res = await callCreateSchedule(
                    startTimeFormatted.toISOString(),
                    endTimeFormatted.toISOString(),
                    price,
                    maxBooking
                );

                if (res && res.data) {
                    toast.success('Thêm lịch khám thành công');
                    setOpenScheduleDialog(false);
                    fetchData();
                } else {
                    toast.error(res.message || 'Có lỗi xảy ra');
                }
            } else if (selectedSchedule?.id && dialogMode === 'edit') {

                const res = await callUpdateSchedule(
                    selectedSchedule.id,
                    startTimeFormatted.toISOString(),
                    endTimeFormatted.toISOString(),
                    price,
                    maxBooking
                );

                if (res && res.data) {
                    toast.success('Cập nhật lịch khám thành công');
                    setOpenScheduleDialog(false);
                    fetchData();
                } else {
                    toast.error(res.message || 'Có lỗi xảy ra');
                }
            }
        } catch (error) {
            toast.error('Đã có lỗi xảy ra');
        }
    };

    const handleDeleteSchedule = async (schedule: DoctorSchedule) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa lịch khám này?')) {
            try {
                const res = await callDeleteSchedule(schedule.id);
                if (res && res.data) {
                    toast.success(res.data);
                    fetchData(); // Refresh data
                } else {
                    toast.error(res.message || 'Có lỗi xảy ra');
                }
            } catch (error) {
                console.error('Error deleting schedule:', error);
                toast.error('Đã có lỗi xảy ra');
            }
        }
    };

    // Kiểm tra xem lịch có thể chỉnh sửa không
    const canEditSchedule = (schedule: DoctorSchedule) => {
        return schedule.Patient_Schedule.length === 0;
    };


    const handleDownloadTemplate = () => {
        const template = [
            ['Ngày', 'Giờ bắt đầu', 'Giờ kết thúc', 'Giá khám (VNĐ)', 'Số lượng bệnh nhân tối đa'],
            ['2024-03-25', '09:00', '10:00', '300000', '3'],
            ['2024-03-25', '10:00', '11:00', '300000', '3'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'schedule_template.xlsx');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Bỏ qua hàng header
            const schedules = jsonData.slice(1).map((row: any) => ({
                date: row[0],
                startTime: row[1],
                endTime: row[2],
                price: Number(row[3]),
                maxBooking: Number(row[4]),
            }));

            // Validate và xử lý dữ liệu
            // Gọi API để thêm lịch hàng loạt
            // const response = await addBulkSchedules(schedules);
            toast.success('Thêm lịch khám thành công');
            fetchData();
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Có lỗi xảy ra khi xử lý file');
        }
    };

    // Thêm hàm helper để format date cho input
    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: '0 auto' }}>
            {/* Header Section */}
            <Box sx={{
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(69,195,210,0.15) 0%, rgba(255,255,255,0) 100%)',
                borderRadius: 4,
                py: 4,
                px: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #45C3D2, #2196F3)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        textAlign: 'center',
                        mb: 2,
                        letterSpacing: 1
                    }}
                >
                    Lịch Khám Bệnh
                </Typography>
                <Typography
                    sx={{
                        mb: 3,
                        fontSize: '1.1rem',
                        color: 'text.primary',
                        fontWeight: 500,
                        textAlign: 'center',
                        padding: '10px 20px',
                        borderRadius: 2,
                        bgcolor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    {sortedDates[currentDateIndex] ? formatDate(sortedDates[currentDateIndex]) : ''}
                </Typography>

                {/* Navigation Controls */}
                <Box sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 2 },
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: 800
                }}>
                    <Button
                        variant="contained"
                        onClick={handlePrevDate}
                        disabled={currentDateIndex === 0}
                        startIcon={<ChevronLeft />}
                        sx={{
                            flex: { xs: '1 1 auto', sm: '0 1 180px' },
                            minWidth: 120,
                            borderRadius: 2,
                            py: 1.2,
                            bgcolor: 'primary.main',
                            '&:hover:not(:disabled)': {
                                transform: 'translateX(-2px)',
                                bgcolor: 'primary.dark',
                            }
                        }}
                    >
                        Ngày trước
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={handleTodayClick}
                        sx={{
                            flex: { xs: '1 1 auto', sm: '0 1 180px' },
                            minWidth: 120,
                            borderRadius: 2,
                            py: 1.2,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            borderWidth: 1.5,
                            '&:hover': {
                                borderWidth: 1.5,
                                bgcolor: 'primary.main',
                                color: 'white'
                            }
                        }}
                    >
                        Hôm nay
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleNextDate}
                        disabled={currentDateIndex === sortedDates.length - 1}
                        endIcon={<ChevronRight />}
                        sx={{
                            flex: { xs: '1 1 auto', sm: '0 1 180px' },
                            minWidth: 120,
                            borderRadius: 2,
                            py: 1.2,
                            bgcolor: 'primary.main',
                            '&:hover:not(:disabled)': {
                                transform: 'translateX(2px)',
                                bgcolor: 'primary.dark',
                            }
                        }}
                    >
                        Ngày sau
                    </Button>
                </Box>
            </Box>

            {/* Add Excel Import/Export Buttons */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDownloadTemplate}
                    sx={{ borderRadius: 2 }}
                >
                    Tải template
                </Button>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderRadius: 2 }}
                >
                    Nhập từ Excel
                    <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                    />
                </Button>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenScheduleDialog('add')}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        bgcolor: 'success.main',
                        '&:hover': {
                            bgcolor: 'success.dark',
                            transform: 'translateY(-2px)',
                        }
                    }}
                >
                    Thêm lịch khám
                </Button>
            </Box>

            {/* Update Schedule Table */}
            <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccessTime sx={{ fontSize: 20 }} />
                                    Thời gian
                                </Box>
                            </TableCell>
                            <TableCell>Số bệnh nhân</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Giá khám
                                </Box>
                            </TableCell>
                            <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDates[currentDateIndex] &&
                            groupedSchedules[sortedDates[currentDateIndex]]?.map((schedule, index) => {
                                const acceptedCount = getAcceptedPatients(schedule).length;
                                const hasAcceptedPatients = acceptedCount > 0;

                                return (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            bgcolor: hasAcceptedPatients
                                                ? 'rgba(25, 118, 210, 0.08)'
                                                : index % 2 === 0
                                                    ? 'action.hover'
                                                    : 'inherit',
                                            '&:hover': {
                                                bgcolor: hasAcceptedPatients
                                                    ? 'rgba(25, 118, 210, 0.12)'
                                                    : 'action.hover'
                                            },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: hasAcceptedPatients ? 'primary.main' : 'text.secondary'
                                                }}
                                            >
                                                <AccessTime
                                                    color={hasAcceptedPatients ? "primary" : "disabled"}
                                                    fontSize="small"
                                                />
                                                {`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${acceptedCount}/${schedule.maxBooking}`}
                                                color={hasAcceptedPatients ? "primary" : "default"}
                                                size="small"
                                                sx={{
                                                    minWidth: 60,
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 500,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(schedule.price)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Xem chi tiết">
                                                    <span>
                                                        <IconButton
                                                            onClick={() => handleViewPatients(schedule)}
                                                            color="primary"
                                                            disabled={!hasAcceptedPatients}
                                                        >
                                                            <VisibilityIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>

                                                {canEditSchedule(schedule) && (
                                                    <>
                                                        <Tooltip title="Chỉnh sửa">
                                                            <IconButton
                                                                onClick={() => handleOpenScheduleDialog('edit', schedule)}
                                                                color="info"
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Xóa">
                                                            <IconButton
                                                                onClick={() => handleDeleteSchedule(schedule)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Update Schedule Dialog */}
            <Dialog
                open={openScheduleDialog}
                onClose={() => setOpenScheduleDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle >
                    {dialogMode === 'add' ? 'Thêm lịch khám mới' : 'Chỉnh sửa lịch khám'}
                </DialogTitle>
                <DialogContent sx={{ p: 3, mt: 1 }} >
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        pt: 1
                    }}>
                        <TextField
                            label="Ngày khám"
                            type="date"
                            value={formatDateForInput(scheduleForm.startTime)}
                            onChange={(e) => {
                                const newDate = new Date(e.target.value + 'T00:00:00');
                                const currentStartHours = scheduleForm.startTime.getHours();
                                const currentEndHours = scheduleForm.endTime.getHours();

                                const newStartTime = new Date(newDate);
                                const newEndTime = new Date(newDate);

                                newStartTime.setHours(currentStartHours, 0, 0);
                                newEndTime.setHours(currentEndHours, 0, 0);

                                setScheduleForm(prev => ({
                                    ...prev,
                                    startTime: newStartTime,
                                    endTime: newEndTime
                                }));
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                min: formatDateForInput(new Date())
                            }}
                            fullWidth
                            sx={{ mt: 1 }}
                        />

                        <TextField
                            label="Thời gian bắt đầu"
                            select
                            value={scheduleForm.startTime.getHours()}
                            onChange={(e) => {
                                const newHour = Number(e.target.value);
                                const newStartTime = new Date(scheduleForm.startTime);
                                newStartTime.setHours(newHour, 0, 0);

                                // Tự động điều chỉnh giờ kết thúc nếu cần
                                const newEndTime = new Date(scheduleForm.endTime);
                                if (newEndTime.getHours() <= newHour) {
                                    newEndTime.setHours(newHour + 1, 0, 0);
                                }

                                setScheduleForm(prev => ({
                                    ...prev,
                                    startTime: newStartTime,
                                    endTime: newEndTime
                                }));
                            }}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                        >
                            {Array.from({ length: 24 }, (_, i) => {
                                const now = new Date();
                                const isToday = scheduleForm.startTime.toDateString() === now.toDateString();
                                const isDisabled = isToday && i < now.getHours();

                                return (
                                    <option key={i} value={i} disabled={isDisabled}>
                                        {`${String(i).padStart(2, '0')}:00`}
                                    </option>
                                );
                            })}
                        </TextField>

                        <TextField
                            label="Thời gian kết thúc"
                            select
                            value={scheduleForm.endTime.getHours()}
                            onChange={(e) => {
                                const newHour = Number(e.target.value);
                                const newEndTime = new Date(scheduleForm.endTime);
                                newEndTime.setHours(newHour, 0, 0);

                                setScheduleForm(prev => ({
                                    ...prev,
                                    endTime: newEndTime
                                }));
                            }}
                            SelectProps={{
                                native: true,
                            }}
                            fullWidth
                        >
                            {Array.from({ length: 24 }, (_, i) => {
                                const startHour = scheduleForm.startTime.getHours();
                                const isDisabled = i <= startHour;

                                return (
                                    <option key={i} value={i} disabled={isDisabled}>
                                        {`${String(i).padStart(2, '0')}:00`}
                                    </option>
                                );
                            })}
                        </TextField>

                        <TextField
                            label="Giá khám"
                            type="text"
                            value={scheduleForm.price === 0 ? '' : scheduleForm.price}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setScheduleForm(prev => ({
                                    ...prev,
                                    price: value === '' ? 0 : Number(value)
                                }));
                            }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">VNĐ</InputAdornment>,
                            }}
                            inputProps={{
                                style: {
                                    textAlign: 'right',
                                    MozAppearance: 'textfield'
                                }
                            }}
                            sx={{
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    WebkitAppearance: 'none',
                                    margin: 0
                                }
                            }}
                            fullWidth
                        />

                        <TextField
                            label="Số lượng bệnh nhân tối đa"
                            type="number"
                            value={scheduleForm.maxBooking}
                            onChange={(e) => setScheduleForm(prev => ({
                                ...prev,
                                maxBooking: Math.max(1, Number(e.target.value))
                            }))}
                            inputProps={{ min: 1 }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setOpenScheduleDialog(false)}
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitSchedule}
                        sx={{
                            bgcolor: dialogMode === 'add' ? 'success.main' : 'primary.main',
                            '&:hover': {
                                bgcolor: dialogMode === 'add' ? 'success.dark' : 'primary.dark',
                            }
                        }}
                    >
                        {dialogMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Patient Detail Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2.5
                    }}
                >
                    <Person /> Thông tin chi tiết bệnh nhân
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedPatient && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Person color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                                    <Typography variant="body1">{selectedPatient.name}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Phone color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                                    <Typography variant="body1">{selectedPatient.phone}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Email color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{selectedPatient.email}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LocationOn color="primary" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                                    <Typography variant="body1">{selectedPatient.address}</Typography>
                                </Box>
                            </Box>

                            {selectedPatient.description && (
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <Description color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Mô tả</Typography>
                                        <Typography variant="body1">{selectedPatient.description}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', bgcolor: 'grey.50' }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        Đóng
                    </Button>
                </Box>
            </Dialog>

            {/* Time Slot Dialog */}
            <Dialog
                open={openTimeSlotDialog}
                onClose={() => setOpenTimeSlotDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2.5
                    }}
                >
                    <AccessTime />
                    <Box>
                        <Typography variant="h6">
                            Chi tiết khung giờ khm
                        </Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                            {selectedTimeSlot && `${formatTime(selectedTimeSlot.startTime)} - ${formatTime(selectedTimeSlot.endTime)}`}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedTimeSlot && (
                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                Danh sách bệnh nhân đã chấp nhận ({getAcceptedPatients(selectedTimeSlot).length} bệnh nhân)
                            </Typography>
                            <Box sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }
                            }}>
                                {getAcceptedPatients(selectedTimeSlot).map((patientSchedule, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.2s'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {/* Tên bệnh nhân */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Person color="primary" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Họ và tên
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {patientSchedule.patient.name}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Giới tính */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={patientSchedule.patient.gender === 'Male' ? 'Nam' : 'Nữ'}
                                                    size="small"
                                                    color={patientSchedule.patient.gender === 'Male' ? 'info' : 'secondary'}
                                                    sx={{
                                                        minWidth: 60,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </Box>

                                            {/* Số điện thoại */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Phone color="primary" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Số điện thoại
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {patientSchedule.patient.phone}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Email */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Email color="primary" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {patientSchedule.patient.email}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Địa chỉ */}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <LocationOn color="primary" fontSize="small" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Địa chỉ
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {patientSchedule.patient.address}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Mô tả (nếu có) */}
                                            {patientSchedule.patient.description && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <Description color="primary" fontSize="small" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Mô tả
                                                        </Typography>
                                                        <Typography variant="body2" sx={{
                                                            wordBreak: 'break-word',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {patientSchedule.patient.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', bgcolor: 'grey.50' }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenTimeSlotDialog(false)}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        Đóng
                    </Button>
                </Box>
            </Dialog>
        </Box >
    );
};

export default DoctorPatient;
