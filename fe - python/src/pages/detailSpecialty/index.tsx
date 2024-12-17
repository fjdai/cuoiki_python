import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Container, Box, Grid, Card, Avatar, Fade, Divider, Button, Skeleton } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { callDoctorBySpecialty } from "../../services/apiPatient/apiHome";

const DetailSpecialty = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [specialty, setSpecialty] = useState<any>(null);
    const { id } = useParams();


    const fetchData = async () => {
        setLoading(true);
        const res = await callDoctorBySpecialty(id);

        setDoctors(res.data);
        setSpecialty(res.data[0].specialization.name);
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(69,195,210,0.05) 0%, rgba(255,255,255,1) 100%)',
            pt: { xs: 6, md: 8 },
            pb: 8
        }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
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

                {/* Header Section */}
                <Fade in={true} timeout={1000}>
                    <Box sx={{ mb: 6 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 3
                        }}>
                            <MedicalServicesIcon sx={{
                                fontSize: 40,
                                color: 'primary.main'
                            }} />
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #45c3d2 30%, #2b9aa8 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                }}
                            >
                                Bác sĩ chuyên khoa {specialty}
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '1rem', md: '1.1rem' },
                                maxWidth: 800,
                                lineHeight: 1.8,
                            }}
                        >
                            Đội ngũ bác sĩ chuyên khoa {specialty} giàu kinh nghiệm,
                            tận tâm trong việc chăm sóc và điều trị cho bệnh nhân
                        </Typography>
                    </Box>
                </Fade>

                {/* Doctors Grid */}
                <Grid container spacing={3}>
                    {loading ? (
                        // Loading skeletons
                        [...Array(3)].map((_, index) => (
                            <Grid item xs={12} key={`skeleton-${index}`}
                                sx={{
                                    animation: 'fadeIn 0.5s',
                                    animationDelay: `${index * 0.1}s`,
                                    '@keyframes fadeIn': {
                                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                                        '100%': { opacity: 1, transform: 'translateY(0)' }
                                    }
                                }}
                            >
                                <Card sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                                        <Skeleton
                                            variant="circular"
                                            sx={{
                                                width: { xs: 100, md: 160 },
                                                height: { xs: 100, md: 160 }
                                            }}
                                        />
                                        <Box sx={{ flex: 1, width: '100%' }}>
                                            <Skeleton variant="text" sx={{ fontSize: '2rem', width: '60%', mb: 2 }} />
                                            <Skeleton variant="rectangular" sx={{ width: '100%', height: 2, mb: 2 }} />
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                <Skeleton variant="circular" width={24} height={24} />
                                                <Skeleton variant="text" sx={{ fontSize: '1rem', flex: 1 }} />
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Skeleton variant="circular" width={24} height={24} />
                                                <Skeleton variant="text" sx={{ fontSize: '1rem', width: '30%' }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        // Actual content
                        doctors && doctors?.map((item, index) => (
                            <Grid item xs={12} key={`doctor-${index}`}
                                sx={{
                                    animation: 'fadeIn 0.5s',
                                    animationDelay: `${index * 0.1}s`,
                                    '@keyframes fadeIn': {
                                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                                        '100%': { opacity: 1, transform: 'translateY(0)' }
                                    }
                                }}
                            >
                                <Card sx={{
                                    p: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(69, 195, 210, 0.15)',
                                        cursor: 'pointer'
                                    }
                                }}
                                    onClick={() => navigate(`/doctor/${item.doctor.id}`)}
                                >
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                                        <Avatar
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${item.doctor.avatar}`}
                                            sx={{
                                                width: { xs: 100, md: 160 },
                                                height: { xs: 100, md: 160 },
                                                border: '3px solid',
                                                borderColor: 'primary.main'
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                                {item.doctor.name}
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1, color: 'text.secondary' }}>
                                                <LocationOnIcon />
                                                <Typography>{item.clinic.name}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, color: 'text.secondary' }}>
                                                <PhoneIcon />
                                                <Typography>{item.doctor.phone}</Typography>
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

export default DetailSpecialty;