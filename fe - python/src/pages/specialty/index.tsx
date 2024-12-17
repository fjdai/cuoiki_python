import { useEffect, useState } from "react";
import { Grid, Container, Typography, Box, Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../../components/card/ServiceCard";
import { callAllSpecialities } from "../../services/apiPatient/apiHome";


const Specialty = () => {
    const [specialities, setSpecialities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        const res = await callAllSpecialities();
        setSpecialities(res.data);
        setLoading(false);
    }


    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(69,195,210,0.05) 0%, rgba(255,255,255,1) 100%)',
            pt: { xs: 10, md: 12 },
            pb: 8
        }}>
            <Container maxWidth="lg">
                {/* Header Section */}
                <Fade in={true} timeout={1000}>
                    <Box sx={{
                        textAlign: 'center',
                        mb: 6,
                        position: 'relative'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            mb: 2
                        }}>
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
                                Chuyên Khoa
                            </Typography>
                        </Box>
                        <Typography
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '1rem', md: '1.1rem' },
                                maxWidth: 600,
                                mx: 'auto',
                                lineHeight: 1.8,
                                mb: 4
                            }}
                        >
                            Khám chữa bệnh với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm,
                            được đào tạo bài bản tại các bệnh viện hàng đầu
                        </Typography>
                    </Box>
                </Fade>

                {/* Grid Section */}
                <Grid container spacing={3}>
                    {loading ? (
                        // Loading skeletons
                        [...Array(8)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}
                                sx={{
                                    animation: 'fadeIn 0.5s',
                                    animationDelay: `${index * 0.1}s`,
                                    '@keyframes fadeIn': {
                                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                                        '100%': { opacity: 1, transform: 'translateY(0)' }
                                    }
                                }}
                            >
                                <ServiceCard
                                    image=""
                                    title=""
                                />
                            </Grid>
                        ))
                    ) : (
                        // Actual content
                        specialities?.map((speciality: any, index: any) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={`spec-${index}`}>
                                <ServiceCard
                                    image={`${import.meta.env.VITE_BACKEND_URL}/images/specializations/${speciality.image}`}
                                    title={speciality.name}
                                    onClick={() => navigate(`/specialty/${speciality.id}`)}
                                />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </Box>
    );
}

export default Specialty;