import { useEffect, useState } from "react";
import { Box, Typography, Card, Button, Container, Skeleton, Chip, TextField, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog, CircularProgress, FormHelperText } from "@mui/material";
import { LocationOn, Phone, Star, VerifiedUser, LocalHospital, MedicalServices, CheckCircle } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from "react-router-dom";
import { callCreateSchedule, callDoctorById, callSchedulesByDoctorId } from "../../services/apiPatient/apiHome";
import { toast } from "react-toastify";

// Schedule type
interface Schedule {
    id: number;
    startTime: string;
    endTime: string;
    maxBooking: number;
    sumBooking: number;
}
// Grouped schedule type
interface GroupedSchedule {
    date: string;
    schedules: Schedule[];
}

// Cập nhật interface cho errors
interface FormErrors {
    patientName: string;
    phone: string;
    email: string;
    gender: string;
    address: string; // Thêm validate cho address
    reason: string;
}

const DetailDoctor = () => {
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookingStep, setBookingStep] = useState(1);
    const [patientName, setPatientName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [doctor, setDoctor] = useState<any | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const navigate = useNavigate();
    const { id } = useParams();

    // Cập nhật state errors
    const [errors, setErrors] = useState<FormErrors>({
        patientName: '',
        phone: '',
        email: '',
        gender: '',
        address: '',
        reason: ''
    });

    // Cập nhật hàm validate
    const validateForm = () => {
        let tempErrors = {
            patientName: '',
            phone: '',
            email: '',
            gender: '',
            address: '',
            reason: ''
        };
        let isValid = true;

        // Validate name
        if (!patientName.trim()) {
            tempErrors.patientName = 'Vui lòng nhập họ và tên';
            isValid = false;
        } else if (patientName.trim().length < 2) {
            tempErrors.patientName = 'Tên phải có ít nhất 2 ký tự';
            isValid = false;
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(patientName.trim())) {
            tempErrors.patientName = 'Tên chỉ được chứa chữ cái và khoảng trắng';
            isValid = false;
        }

        // Validate phone - số điện thoại Việt Nam
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phone) {
            tempErrors.phone = 'Vui lòng nhập số điện thoại';
            isValid = false;
        } else if (!phoneRegex.test(phone)) {
            tempErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
            isValid = false;
        }

        // Validate email nếu có
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(email)) {
                tempErrors.email = 'Email không hợp lệ';
                isValid = false;
            }
        }

        // Validate gender
        if (!gender) {
            tempErrors.gender = 'Vui lòng chọn giới tính';
            isValid = false;
        }

        // Validate address
        if (!address.trim()) {
            tempErrors.address = 'Vui lòng nhập địa chỉ';
            isValid = false;
        } else if (address.trim().length < 5) {
            tempErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
            isValid = false;
        }

        // Validate reason
        if (!reason.trim()) {
            tempErrors.reason = 'Vui lòng nhập lý do khám';
            isValid = false;
        } else if (reason.trim().length < 10) {
            tempErrors.reason = 'Lý do khám phải có ít nhất 10 ký tự';
            isValid = false;
        } else if (reason.trim().length > 500) {
            tempErrors.reason = 'Lý do khám không được vượt quá 500 ký tự';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    // Thêm các hàm validate riêng cho từng trường
    const validateField = (fieldName: keyof FormErrors, value: string) => {
        let error = '';

        switch (fieldName) {
            case 'patientName':
                if (!value.trim()) {
                    error = 'Vui lòng nhập họ và tên';
                } else if (value.trim().length < 2) {
                    error = 'Tên phải có ít nhất 2 ký tự';
                } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value.trim())) {
                    error = 'Tên chỉ được chứa chữ cái và khoảng trắng';
                }
                break;

            case 'phone':
                const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
                if (!value) {
                    error = 'Vui lòng nhập số điện thoại';
                } else if (!phoneRegex.test(value)) {
                    error = 'Số điện thoại không hợp lệ (VD: 0912345678)';
                }
                break;

            case 'email':
                if (value) {
                    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
                    if (!emailRegex.test(value)) {
                        error = 'Email không hợp lệ';
                    }
                }
                break;

            case 'address':
                if (!value.trim()) {
                    error = 'Vui lòng nhập địa chỉ';
                } else if (value.trim().length < 5) {
                    error = 'Địa chỉ phải có ít nhất 5 ký tự';
                }
                break;

            case 'reason':
                if (!value.trim()) {
                    error = 'Vui lòng nhập lý do khám';
                } else if (value.trim().length < 10) {
                    error = 'Lý do khám phải có ít nhất 10 ký tự';
                } else if (value.trim().length > 500) {
                    error = 'Lý do khám không được vượt quá 500 ký tự';
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    // Cập nhật các handlers cho input
    const handleInputChange = (field: keyof FormErrors) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        switch (field) {
            case 'patientName':
                setPatientName(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'address':
                setAddress(value);
                break;
            case 'reason':
                setReason(value);
                break;
        }
        validateField(field, value);
    };

    // Fetch detail doctor and schedules
    const fetchData = async () => {
        setLoading(true);
        const res = await callDoctorById(id);
        if (res && res.data) {

            setDoctor(res.data);
        }
        const resSchedules = await callSchedulesByDoctorId(id);
        if (resSchedules && resSchedules.data) {
            setSchedules(resSchedules.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();

    }, [id]);

    // Handle gender change
    const handleGenderChange = (event: SelectChangeEvent) => {
        setGender(event.target.value);
    };

    // Get date from datetime string
    const getDateFromDateTime = (dateTime: string) => {
        return dateTime.split('T')[0];
    };

    // Format time
    const formatTime = (dateTime: string) => {
        const time = new Date(dateTime);
        return time.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Get next 10 days
    const getNext10Days = () => {
        // Lấy ngày hiện tại theo UTC
        const today = new Date();
        const utcToday = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));

        const next10Days = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(utcToday);
            date.setUTCDate(utcToday.getUTCDate() + i);
            return date.toISOString().split('T')[0];
        });
        return next10Days;
    };

    // Get unique dates
    const getUniqueDates = (): GroupedSchedule[] => {
        if (!schedules?.length) return [];

        const next10Days = getNext10Days();
        const today = new Date();
        // Lấy ngày hiện tại theo UTC
        const utcToday = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate()
        ));

        // Lọc schedules chỉ lấy từ ngày hiện tại
        const filteredSchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.startTime);
            const utcScheduleDate = new Date(Date.UTC(
                scheduleDate.getUTCFullYear(),
                scheduleDate.getUTCMonth(),
                scheduleDate.getUTCDate()
            ));
            return utcScheduleDate >= utcToday;
        });

        // Tạo map để nhóm lịch theo ngày
        const schedulesMap = filteredSchedules.reduce((acc, schedule) => {
            const date = getDateFromDateTime(schedule.startTime);
            if (!acc.has(date)) {
                acc.set(date, []);
            }
            acc.get(date)?.push(schedule);
            return acc;
        }, new Map<string, Schedule[]>());

        // Tạo danh sách tất cả các ngày (bao gồm cả ngày không có lịch)
        return next10Days.map(date => ({
            date,
            schedules: schedulesMap.get(date) || [],
            hasSchedules: schedulesMap.has(date)
        }));
    };

    // Thêm hàm kiểm tra thời gian đã qua
    const isTimeSlotPassed = (startTime: string) => {
        const now = new Date();
        const scheduleTime = new Date(startTime);
        return scheduleTime <= now;
    };

    // Cập nhật hàm getAvailableTimesByDate để lọc các khung giờ đã qua
    const getAvailableTimesByDate = (date: string): Schedule[] => {
        if (!schedules || !date) return [];

        const now = new Date();

        return schedules
            .filter(schedule => {
                const isToday = getDateFromDateTime(schedule.startTime) === getDateFromDateTime(now.toISOString());

                // Nếu là ngày hôm nay, kiểm tra thêm giờ
                if (isToday) {
                    return !isTimeSlotPassed(schedule.startTime);
                }

                // Nếu là những ngày khác, chỉ cần kiểm tra ngày
                return getDateFromDateTime(schedule.startTime) === date;
            })
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    };

    // Format time range
    const formatTimeRange = (schedule: Schedule) => {
        return `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`;
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            weekday: date.toLocaleDateString('vi-VN', { weekday: 'long' }),
            date: date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        };
    };

    // Handle submit
    const handleSubmit = async () => {
        if (validateForm()) {
            setIsSubmitting(true);
            const res = await callCreateSchedule(selectedId, patientName, phone, email, gender, address, reason);
            if (res && res.data) {
                setShowSuccess(true);
            }
            else {
                toast.error('Đặt lịch khám thất bại');
            }
            setIsSubmitting(false);
        }
    };

    // Handle close success
    const handleCloseSuccess = () => {
        setShowSuccess(false);
        setBookingStep(1);
        setSelectedDate('');
        setSelectedTime('');
        setPatientName('');
        setPhone('');
        setEmail('');
        setGender('');
        setAddress('');
        setReason('');
    };

    // Skeleton
    const SkeletonLoading = () => (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
            <Card sx={{ mb: 6, p: 4, borderRadius: 4 }}>
                <Box sx={{ display: "flex", gap: 3 }}>
                    <Skeleton variant="rectangular" width={140} height={140} sx={{ borderRadius: 4 }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={32} />
                        <Skeleton variant="text" width="40%" />
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                        </Box>
                    </Box>
                </Box>
            </Card>
        </Container>
    );

    // Cập nhật phần render time slots
    const renderTimeSlots = (schedules: Schedule[]) => {
        return schedules.map(schedule => {
            const isBooked = schedule.sumBooking >= schedule.maxBooking;
            const isPassed = isTimeSlotPassed(schedule.startTime);
            const isDisabled = isBooked || isPassed;

            return (
                <Box
                    key={schedule.id}
                    onClick={() => {
                        if (!isDisabled) {
                            setSelectedTime(schedule.startTime);
                            setSelectedId(schedule.id.toString());
                        }
                    }}
                    sx={{
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        border: '1px solid',
                        borderColor: selectedTime === schedule.startTime
                            ? 'primary.main'
                            : isDisabled
                                ? 'grey.300'
                                : 'grey.200',
                        borderRadius: 2,
                        p: 2,
                        backgroundColor: isDisabled
                            ? 'grey.100'
                            : selectedTime === schedule.startTime
                                ? 'primary.lighter'
                                : 'background.paper',
                        opacity: isDisabled ? 0.6 : 1,
                        textAlign: 'center',
                        position: 'relative',
                        '&:hover': isDisabled
                            ? undefined
                            : {
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }
                    }}
                >
                    <Typography
                        variant="body1"
                        color={isDisabled ? 'text.disabled' : 'text.primary'}
                    >
                        {formatTimeRange(schedule)}
                    </Typography>
                    <Typography
                        variant="caption"
                        color={isDisabled ? "error" : "success.main"}
                        sx={{ display: 'block', mt: 1 }}
                    >
                        {isPassed
                            ? "Đã qua giờ khám"
                            : isBooked
                                ? "Đã kín lịch"
                                : `Còn ${schedule.maxBooking - schedule.sumBooking} chỗ`}
                    </Typography>
                </Box>
            );
        });
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(69,195,210,0.05) 0%, rgba(255,255,255,1) 100%)',
            pt: { xs: 6, md: 8 },
            pb: 8
        }}>
            {/* Skeleton */}
            {loading ? (
                <SkeletonLoading />
            ) : (
                // actual data
                <Container maxWidth="xl">
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        {/* Back button */}
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{
                                color: 'primary.main',
                                backgroundColor: 'rgba(69, 195, 210, 0.08)',
                                borderRadius: '24px',
                                px: 2,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(69, 195, 210, 0.15)',
                                    transform: 'translateX(-4px)',
                                    transition: 'all 0.2s'
                                }
                            }}
                        >
                            Trở lại
                        </Button>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Left Column - Doctor Info */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                p: 4,
                                borderRadius: 4,
                                height: '100%',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                background: 'linear-gradient(135deg, rgba(69, 195, 210, 0.05) 0%, rgba(255, 255, 255, 1) 100%)'
                            }}>
                                {/* Basic Info Section */}
                                <Box sx={{
                                    display: 'flex',
                                    gap: 3,
                                    mb: 4,
                                    p: 3,
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                                }}>
                                    <Box
                                        component="img"
                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${doctor.avatar}`}
                                        alt={doctor.name}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid',
                                            borderColor: 'primary.main',
                                            boxShadow: '0 4px 20px rgba(69, 195, 210, 0.2)',
                                        }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                                            {doctor.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                                                label="Đã xác thực"
                                                size="small"
                                                color="success"
                                                sx={{ borderRadius: 2 }}
                                            />
                                            <Chip
                                                icon={<MedicalServices sx={{ fontSize: 16 }} />}
                                                label={doctor.doctor_user.specialization.name}
                                                size="small"
                                                sx={{
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(69, 195, 210, 0.1)',
                                                    color: 'primary.main'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} sx={{ color: '#FFB400', fontSize: 20 }} />
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Contact Info */}
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: 2,
                                    mb: 4,
                                    p: 3,
                                    bgcolor: 'rgba(69, 195, 210, 0.05)',
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'primary.light'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}>
                                        <LocalHospital sx={{ color: 'primary.main', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Nơi công tác
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {doctor.doctor_user.clinic.name}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}>
                                        <LocationOn sx={{ color: 'primary.main', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Địa chỉ
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {doctor.doctor_user.clinic.address}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        p: 1.5,
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                    }}>
                                        <Phone sx={{ color: 'primary.main', fontSize: 24 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Số điện thoại
                                            </Typography>
                                            <Typography variant="body2" fontWeight={500}>
                                                {doctor.phone}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Description Information */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <Box sx={{
                                        mb: 4,
                                        p: 3,
                                        bgcolor: 'white',
                                        borderRadius: 3,
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.primary',
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                position: 'relative',
                                                '&:after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -8,
                                                    left: 0,
                                                    width: 40,
                                                    height: 3,
                                                    borderRadius: 1.5,
                                                    bgcolor: 'primary.main'
                                                }
                                            }}
                                        >
                                            <MedicalServices sx={{ fontSize: 20, color: 'primary.main' }} />
                                            Giới thiệu
                                        </Typography>

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                mt: 4,
                                                color: 'text.secondary',
                                                lineHeight: 1.8,
                                                textAlign: 'justify',
                                                '& strong': {
                                                    color: 'text.primary',
                                                    fontWeight: 500
                                                }
                                            }}
                                        >
                                            {doctor.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Right Column - Booking Form */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                p: 4,
                                borderRadius: 4,
                                height: '100%',
                                position: { md: 'sticky' },
                                top: { md: '100px' },
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                background: 'white'
                            }}>
                                <Typography
                                    variant="h5"
                                    fontWeight={600}
                                    gutterBottom
                                    sx={{
                                        color: 'primary.main',
                                        textAlign: 'center',
                                        mb: 3
                                    }}
                                >
                                    Đặt lịch khám
                                </Typography>

                                {bookingStep === 1 ? (
                                    <Box>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            Chọn ngày khám
                                        </Typography>
                                        {getUniqueDates().some(date => date.schedules.length > 0) ? (
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                                gap: 2,
                                                mb: 4
                                            }}>
                                                {getUniqueDates().map(({ date, schedules: daySchedules }) => {
                                                    const { weekday, date: formattedDate } = formatDate(date);
                                                    const isAllBooked = daySchedules.length > 0 &&
                                                        daySchedules.every(schedule => schedule.sumBooking >= schedule.maxBooking);
                                                    const isDisabled = daySchedules.length === 0;

                                                    return (
                                                        <Box
                                                            key={date}
                                                            onClick={() => !isDisabled && !isAllBooked && setSelectedDate(date)}
                                                            sx={{
                                                                p: 2,
                                                                border: '2px solid',
                                                                borderColor: selectedDate === date
                                                                    ? 'primary.main'
                                                                    : isDisabled
                                                                        ? 'grey.100'
                                                                        : isAllBooked
                                                                            ? 'grey.200'
                                                                            : 'grey.300',
                                                                borderRadius: 2,
                                                                cursor: isDisabled || isAllBooked ? 'not-allowed' : 'pointer',
                                                                transition: 'all 0.2s',
                                                                bgcolor: selectedDate === date
                                                                    ? 'primary.lighter'
                                                                    : isDisabled
                                                                        ? 'grey.50'
                                                                        : 'background.paper',
                                                                opacity: isDisabled || isAllBooked ? 0.6 : 1,
                                                                '&:hover': (!isDisabled && !isAllBooked) ? {
                                                                    borderColor: 'primary.main',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                                } : {}
                                                            }}
                                                        >
                                                            <Typography variant="caption" color="text.secondary">
                                                                {weekday}
                                                            </Typography>
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                {formattedDate}
                                                            </Typography>
                                                            {isDisabled ? (
                                                                <Typography variant="caption" color="text.disabled">
                                                                    Không có lịch khám
                                                                </Typography>
                                                            ) : isAllBooked ? (
                                                                <Typography variant="caption" color="error">
                                                                    Đã kín lịch
                                                                </Typography>
                                                            ) : (
                                                                <Typography variant="caption" color="success.main">
                                                                    Còn lịch trống
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        ) : (
                                            <Box sx={{
                                                textAlign: 'center',
                                                py: 6,
                                                px: 2,
                                                bgcolor: 'rgba(69, 195, 210, 0.05)',
                                                borderRadius: 2,
                                                border: '1px dashed',
                                                borderColor: 'primary.light',
                                                mb: 4
                                            }}>
                                                <Typography
                                                    variant="h6"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <MedicalServices sx={{ fontSize: 24, color: 'primary.main' }} />
                                                    Bác sĩ chưa có lịch rảnh trong tuần này
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: 1 }}
                                                >
                                                    Vui lòng quay lại sau hoặc chọn bác sĩ khác
                                                </Typography>
                                            </Box>
                                        )}

                                        <Typography
                                            variant="subtitle1"
                                            color="text.secondary"
                                            gutterBottom
                                            sx={{ mt: 4 }}
                                        >
                                            Chọn giờ khám
                                        </Typography>
                                        {selectedDate && (
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 2 }}>
                                                {renderTimeSlots(getAvailableTimesByDate(selectedDate))}
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                disabled={!selectedDate || !selectedTime}
                                                onClick={() => setBookingStep(2)}
                                                sx={{
                                                    minWidth: 200,
                                                    height: 48,
                                                    borderRadius: 3,
                                                    boxShadow: '0 8px 16px rgba(69, 195, 210, 0.2)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 12px 20px rgba(69, 195, 210, 0.3)'
                                                    }
                                                }}
                                            >
                                                Tiếp tục
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            Thông tin bệnh nhân
                                        </Typography>
                                        <Grid container spacing={3} sx={{ mt: 2 }}>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Họ và tên"
                                                    value={patientName}
                                                    onChange={handleInputChange('patientName')}
                                                    onBlur={() => validateField('patientName', patientName)}
                                                    error={!!errors.patientName}
                                                    helperText={errors.patientName}
                                                    required
                                                    inputProps={{ maxLength: 50 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Số điện thoại"
                                                    value={phone}
                                                    onChange={handleInputChange('phone')}
                                                    onBlur={() => validateField('phone', phone)}
                                                    error={!!errors.phone}
                                                    helperText={errors.phone}
                                                    required
                                                    inputProps={{ maxLength: 10 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    type="email"
                                                    value={email}
                                                    required
                                                    onChange={handleInputChange('email')}
                                                    onBlur={() => validateField('email', email)}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth error={!!errors.gender} required>
                                                    <InputLabel>Giới tính</InputLabel>
                                                    <Select
                                                        value={gender}
                                                        label="Giới tính"
                                                        onChange={handleGenderChange}
                                                    >
                                                        <MenuItem value="Male">Nam</MenuItem>
                                                        <MenuItem value="Female">Nữ</MenuItem>
                                                    </Select>
                                                    {errors.gender && (
                                                        <FormHelperText>{errors.gender}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Địa chỉ"
                                                    value={address}
                                                    onChange={handleInputChange('address')}
                                                    onBlur={() => validateField('address', address)}
                                                    error={!!errors.address}
                                                    helperText={errors.address}
                                                    required
                                                    inputProps={{ maxLength: 200 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Lý do khám"
                                                    multiline
                                                    rows={4}
                                                    value={reason}
                                                    onChange={handleInputChange('reason')}
                                                    onBlur={() => validateField('reason', reason)}
                                                    error={!!errors.reason}
                                                    helperText={errors.reason}
                                                    required
                                                    inputProps={{ maxLength: 500 }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                onClick={() => setBookingStep(1)}
                                                sx={{
                                                    minWidth: 200,
                                                    height: 48,
                                                    borderRadius: 3
                                                }}
                                            >
                                                Quay lại
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting}
                                                sx={{
                                                    minWidth: 200,
                                                    height: 48,
                                                    borderRadius: 3,
                                                    opacity: isSubmitting ? 0.7 : 1,
                                                    '&.Mui-disabled': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'white'
                                                    }
                                                }}
                                            >
                                                {isSubmitting ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CircularProgress size={20} color="inherit" />
                                                        Đang xử lý...
                                                    </Box>
                                                ) : (
                                                    'Đặt lịch khám'
                                                )}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            )}

            {/* Success dialog */}
            <Dialog
                open={showSuccess}
                onClose={handleCloseSuccess}
                maxWidth="sm"
                fullWidth
            >
                <Box
                    sx={{
                        textAlign: "center",
                        p: 4,
                    }}
                >
                    <CheckCircle
                        sx={{
                            fontSize: 80,
                            color: "success.main",
                            mb: 3,
                        }}
                    />
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                        Đặt lịch thành công!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Bạn đã đặt lịch thành công, vui lòng chờ hỗ trợ viên gọi xác nhận.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleCloseSuccess}
                        sx={{
                            minWidth: 200,
                            height: 48,
                            borderRadius: 3,
                            boxShadow: "0 8px 16px rgba(69, 195, 210, 0.2)",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 20px rgba(69, 195, 210, 0.3)",
                            },
                        }}
                    >
                        Đóng
                    </Button>
                </Box>
            </Dialog>

            {/* Loading dialog */}
            <Dialog
                open={isSubmitting}
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                }}
            >
                <CircularProgress />
            </Dialog>
        </Box>
    );
}

export default DetailDoctor;
