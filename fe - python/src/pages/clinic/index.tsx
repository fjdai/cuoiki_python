import { useEffect, useState } from "react";
import { Container, Grid, Typography, Box, Paper } from "@mui/material";
import ServiceCard from "../../components/card/ServiceCard";
import { useNavigate } from "react-router-dom";
import Skeleton from '@mui/material/Skeleton';
import { callAllClinics } from "../../services/apiPatient/apiHome";
const Clinic = () => {
    const [clinics, setClinics] = useState<any[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const fetchClinics = async () => {
        setLoading(true);
        const res = await callAllClinics();
        if (res && res.data) {
            setClinics(res.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchClinics();
    }, []);

    const handleClinicClick = (clinicId: number) => {
        navigate(`/clinic/${clinicId}`);
    };

    // Thêm animation cho skeleton
    const SkeletonCard = () => (
        <Paper
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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Cơ sở y tế nổi bật
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Danh sách các cơ sở y tế uy tín hàng đầu
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Skeleton*/}
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${item}`}>
                            <SkeletonCard />
                        </Grid>
                    ))
                ) : (
                    // actual data
                    clinics?.map((clinic) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={`clinic-${clinic.id}`}>
                            <ServiceCard
                                image={`${import.meta.env.VITE_BACKEND_URL}/images/clinics/${clinic.image}`}
                                title={clinic.name}
                                onClick={() => handleClinicClick(clinic.id)}
                            />
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default Clinic; 