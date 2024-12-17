import { useEffect, useState } from "react";
import { Container, Card, Typography, Grid, Skeleton, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { callAllDoctors } from "../../services/apiPatient/apiHome";


const Doctor = () => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDoctor = async () => {
        const res = await callAllDoctors();
        if (res && res.data)
            setDoctors(res.data);
        setLoading(false);
    }

    useEffect(() => {
        fetchDoctor();
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
            pt: { xs: 10, md: 12 },
            pb: 8
        }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{
                    mb: 6,
                    textAlign: 'center',
                    maxWidth: 800,
                    mx: 'auto'
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(45deg, #45c3d2 30%, #2b9aa8 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Đội ngũ Bác sĩ chuyên môn cao
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}
                    >
                        Đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo bài bản tại các trường đại học Y khoa hàng đầu
                    </Typography>
                </Box>

                {/* Doctors Grid */}
                <Grid container spacing={4}>
                    {/* skeleton */}
                    {loading ? (
                        [...Array(8)].map((_, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card sx={{ p: 3, height: '100%' }}>
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                        <Skeleton variant="circular" width={120} height={120} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width="60%" height={32} />
                                            <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
                                            <Skeleton variant="text" width="80%" height={60} />
                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                                                <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 2 }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        // actual data
                        doctors?.map((doctor, index) => (
                            <Grid item xs={12} md={6} key={`doctor-${index}`}>
                                <Card
                                    onClick={() => navigate(`/doctor/${doctor.id}`)}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(69, 195, 210, 0.05) 100%)',
                                        borderRadius: 3,
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: '0 12px 28px rgba(69, 195, 210, 0.2)'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 3 }}>
                                        <Box
                                            component="img"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${doctor.avatar}`}
                                            sx={{
                                                width: 120,
                                                height: 120,
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid',
                                                borderColor: 'primary.main',
                                                boxShadow: '0 4px 12px rgba(69, 195, 210, 0.2)',
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'primary.main',
                                                    mb: 1
                                                }}
                                            >
                                                {doctor.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Chip
                                                    size="small"
                                                    label={doctor.doctor_user.specialization.name}
                                                    sx={{
                                                        bgcolor: 'rgba(69, 195, 210, 0.1)',
                                                        color: 'primary.main',
                                                        fontWeight: 500,
                                                        borderRadius: '16px'
                                                    }}
                                                />
                                                <Chip
                                                    size="small"
                                                    label={doctor.doctor_user.clinic.name}
                                                    sx={{
                                                        bgcolor: 'rgba(69, 195, 210, 0.05)',
                                                        color: 'text.secondary',
                                                        fontWeight: 500,
                                                        borderRadius: '16px'
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Doctor; 