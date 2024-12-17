import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Grid, Paper, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Skeleton from '@mui/material/Skeleton';
import { callDoctorByClinicId } from "../../services/apiPatient/apiHome";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { alpha } from '@mui/material/styles';

const DetailClinic = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [clinic, setClinic] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<any[]>([]);

    const fetchDetailClinic = async () => {
        setLoading(true);
        const res = await callDoctorByClinicId(id);
        if (res && res.data) {
            setClinic(res.data[0].clinic);
            setDoctors(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchDetailClinic();
    }, [id]);

    const handleDoctorClick = (doctorId: number) => {
        navigate(`/doctor/${doctorId}`);
    };

    // Skeleton
    const HeaderSkeleton = () => (
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Skeleton
                        variant="rectangular"
                        height={300}
                        sx={{
                            borderRadius: 2,
                            animation: 'wave',
                            backgroundColor: 'rgba(0, 0, 0, 0.06)',
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Skeleton
                        variant="text"
                        height={45}
                        width="70%"
                        sx={{
                            mb: 3,
                            animation: 'wave',
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        }}
                    />
                    <Skeleton
                        variant="text"
                        height={25}
                        width="50%"
                        sx={{
                            animation: 'wave',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );

    const DescriptionSkeleton = () => (
        <Box mb={4}>
            <Skeleton
                variant="text"
                height={35}
                width="20%"
                sx={{
                    mb: 2,
                    animation: 'wave',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }}
            />
            {[1, 2, 3].map((item) => (
                <Skeleton
                    key={item}
                    variant="text"
                    height={20}
                    width={`${90 - item * 10}%`}
                    sx={{
                        mb: 1,
                        animation: 'wave',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }}
                />
            ))}
        </Box>
    );

    const DoctorCardSkeleton = () => (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                }
            }}
        >
            <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                    mb: 2,
                    borderRadius: 1,
                    animation: 'wave',
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                }}
            />
            <Skeleton
                variant="text"
                height={30}
                width="80%"
                sx={{
                    mb: 1,
                    animation: 'wave',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }}
            />
            <Skeleton
                variant="text"
                height={20}
                width="60%"
                sx={{
                    animation: 'wave',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }}
            />
        </Paper>
    );

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(69,195,210,0.05) 0%, rgba(255,255,255,1) 100%)',
            pt: { xs: 6, md: 8 },
            pb: 8
        }}>
            <Container maxWidth="xl">
                {/* Back button */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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

                {loading ? (
                    <>
                        <HeaderSkeleton />
                        <DescriptionSkeleton />
                        <Box>
                            <Skeleton
                                variant="text"
                                height={35}
                                width="20%"
                                sx={{
                                    mb: 2,
                                    animation: 'wave',
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                }}
                            />
                            <Grid container spacing={3}>
                                {[1, 2, 3].map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item}>
                                        <DoctorCardSkeleton />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </>
                ) : clinic ? (
                    <>
                        {/* Header */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 4,
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}
                        >
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: '100%',
                                            height: 300,
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/clinics/${clinic.image}`}
                                            alt={clinic.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            variant="h4"
                                            component="h1"
                                            gutterBottom
                                            sx={{
                                                color: 'primary.main',
                                                fontWeight: 700,
                                                mb: 3
                                            }}
                                        >
                                            {clinic.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                            <Typography variant="body1" color="text.secondary">
                                                {clinic.address}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Description */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                mb: 4,
                                borderRadius: 4,
                                background: 'white',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}
                        >
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    position: 'relative',
                                    '&:after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -2,
                                        left: 0,
                                        width: 60,
                                        height: 4,
                                        borderRadius: 2,
                                        bgcolor: 'primary.main'
                                    }
                                }}
                            >
                                Giới thiệu
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    mt: 3,
                                    color: 'text.secondary',
                                    lineHeight: 1.8
                                }}
                            >
                                {clinic.description}
                            </Typography>
                        </Paper>

                        {/* Doctors */}
                        {doctors && doctors.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    background: 'white',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocalHospitalIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary',
                                            position: 'relative',
                                            '&:after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: -2,
                                                left: 0,
                                                width: 60,
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main'
                                            }
                                        }}
                                    >
                                        Đội ngũ bác sĩ
                                    </Typography>
                                </Box>
                                <Grid container spacing={3}>
                                    {doctors.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.doctor.id}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    cursor: 'pointer',
                                                    borderRadius: 4,
                                                    transition: 'all 0.3s ease',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                                        borderColor: 'primary.main',
                                                        bgcolor: alpha('#45C3D2', 0.02)
                                                    }
                                                }}
                                                onClick={() => handleDoctorClick(item.doctor.id)}
                                            >
                                                <Box
                                                    sx={{
                                                        mb: 2,
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                    }}
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${item.doctor.avatar}`}
                                                        alt={item.doctor.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '240px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'primary.main'
                                                    }}
                                                >
                                                    {item.doctor.name}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: 'text.secondary',
                                                        fontSize: '0.95rem'
                                                    }}
                                                >
                                                    {item.specialization.name}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}
                    </>
                ) : (
                    <></>
                )}
            </Container>
        </Box>
    );
};

export default DetailClinic; 