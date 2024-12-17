import { Box, Button, Typography, Skeleton } from "@mui/material";
import background from "../../assets/header-cover.jpg";
import backgroundClinic from "../../assets/clinic-home.png";
import SearchTool from "../../components/search";
import DoneIcon from '@mui/icons-material/Done';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ResponsiveSlider from "../../components/slider";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { callAllClinics, callAllDoctors, callAllSpecialities } from "../../services/apiPatient/apiHome";


const Home = () => {

    const [specialities, setSpecialities] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        const res_specialities = await callAllSpecialities();
        const res_clinics = await callAllClinics();
        const res_doctors = await callAllDoctors();
        if (res_specialities?.data || res_clinics?.data || res_doctors?.data) {
            setSpecialities(res_specialities.data);
            setClinics(res_clinics.data);
            setDoctors(res_doctors.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Add skeleton card for specialty
    const SpecialtyCardSkeleton = () => (
        <Box sx={{ width: '100%' }}>
            <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                    borderRadius: 4,
                    mb: 2
                }}
            />
            <Skeleton
                variant="text"
                sx={{
                    width: '80%',
                    mx: 'auto'
                }}
            />
        </Box>
    );
    // Add skeleton card for doctor
    const DoctorCardSkeleton = () => (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton
                variant="circular"
                width={200}
                height={200}
                sx={{ mb: 2 }}
            />
            <Skeleton
                variant="text"
                sx={{ width: '60%' }}
            />
        </Box>
    );
    // Add skeleton card for clinic
    const ClinicCardSkeleton = () => (
        <Box sx={{ width: '100%' }}>
            <Skeleton
                variant="rectangular"
                height={200}
                sx={{
                    borderRadius: 4,
                    mb: 2,
                    animation: 'wave'
                }}
            />
            <Skeleton
                variant="text"
                sx={{
                    width: '80%',
                    mx: 'auto',
                    animation: 'wave'
                }}
            />
        </Box>
    );

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
                {/* Body 1 */}
                <Box
                    sx={{
                        backgroundImage: `url(${background})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        minHeight: { xs: "calc(100vh - 64px)", md: "calc(100vh - 80px)" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pt: { xs: 8, md: 10 },
                        pb: { xs: 8, md: 10 },
                        position: 'relative'
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            fontSize: { xs: 20, md: 32 },
                            color: "primary.main",
                            mb: 4,
                            textAlign: "center",
                            fontWeight: "bold",
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            maxWidth: '800px',
                            px: 2
                        }}
                    >
                        NỀN TẢNG ĐẶT KHÁM CHUYÊN KHOA
                    </Typography>
                    <SearchTool />
                </Box>
                {/* Body 2 */}
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    p: "30px",
                    backgroundColor: "background.paper",
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                    borderRadius: '40px 40px 0 0',
                    mt: -5,
                    position: 'relative',
                    zIndex: 1,
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    gap: { xs: 3, md: 0 }
                }}>
                    {[
                        { icon: DoneIcon, text: "Bệnh viện lớn" },
                        { icon: ThumbUpIcon, text: "Phòng khám tốt" },
                        { icon: PersonIcon, text: "Bác sĩ giỏi" },
                        { icon: AccessTimeIcon, text: "Khám ưu tiên" }
                    ].map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <item.icon sx={{
                                color: "primary.main",
                                fontSize: 40,
                                mb: 1
                            }} />
                            <Typography
                                sx={{
                                    color: "text.primary",
                                    fontWeight: 500
                                }}
                            >
                                {item.text}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Specialty Component */}
                <Box sx={{ display: "flex", flexDirection: "column", py: 8, bgcolor: 'background.default' }}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: { xs: 2, md: 8 },
                        mb: 4
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "text.primary",
                                fontSize: { xs: 24, md: 36 },
                                fontWeight: "bold",
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
                            Chuyên khoa phổ biến
                        </Typography>
                        <Button
                            onClick={() => navigate("/specialty")}
                            variant="contained"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 3,
                                py: 1,
                                borderRadius: 3,
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(69, 195, 210, 0.3)'
                                }
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </Box>
                    <Box sx={{ px: { xs: 2, md: 8 } }}>
                        <ResponsiveSlider>
                            {loading ? (
                                // Show 4 skeleton cards while loading
                                [...Array(4)].map((_, index) => (
                                    <SpecialtyCardSkeleton key={`skeleton-spec-${index}`} />
                                ))
                            ) : (
                                specialities?.map((speciality, index) => (
                                    <Box
                                        key={`spec-${index}`}
                                        sx={{
                                            cursor: "pointer",
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)'
                                            }
                                        }}
                                        onClick={() => navigate(`/specialty/${speciality.id}`)}
                                    >
                                        <Box
                                            component="img"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/specializations/${speciality.image}`}
                                            sx={{
                                                height: { xs: 150, md: 200 },
                                                width: '100%',
                                                objectFit: 'cover',
                                                borderRadius: 4,
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                mb: 2,
                                                aspectRatio: '16/9',
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "text.primary",
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                textAlign: 'center',
                                                px: 1
                                            }}
                                        >
                                            {speciality.name}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </ResponsiveSlider>
                    </Box>
                </Box>

                {/* Clinic Component */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        py: 8,
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${backgroundClinic})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundAttachment: "fixed"
                    }}
                >
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: { xs: 2, md: 8 },
                        mb: 4
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "text.primary",
                                fontSize: { xs: 24, md: 36 },
                                fontWeight: "bold",
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
                            Cơ sở y tế nổi bật
                        </Typography>
                        <Button
                            onClick={() => navigate("/clinic")}
                            variant="contained"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 3,
                                py: 1,
                                borderRadius: 3,
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(69, 195, 210, 0.3)'
                                }
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </Box>
                    <ResponsiveSlider>
                        {loading ? (
                            // Show 4 skeleton cards while loading
                            [...Array(4)].map((_, index) => (
                                <ClinicCardSkeleton key={`skeleton-clinic-${index}`} />
                            ))
                        ) : (
                            clinics?.map((clinic, index) => (
                                <Box
                                    key={`clinic-${index}`}
                                    sx={{
                                        cursor: "pointer",
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-8px)'
                                        }
                                    }}
                                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                                >
                                    <Box
                                        component="img"
                                        src={`${import.meta.env.VITE_BACKEND_URL}/images/clinics/${clinic.image}`}
                                        sx={{
                                            height: { xs: 150, md: 200 },
                                            width: '100%',
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            mb: 2,
                                            aspectRatio: '16/9',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            color: "text.primary",
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            textAlign: 'center',
                                            px: 1
                                        }}
                                    >
                                        {clinic.name}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </ResponsiveSlider>
                </Box >

                {/* Doctor Component */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    py: 8,
                    bgcolor: 'background.paper'
                }}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: { xs: 2, md: 8 },
                        mb: 4
                    }}>
                        <Typography
                            variant="h4"
                            sx={{
                                color: "text.primary",
                                fontSize: { xs: 24, md: 36 },
                                fontWeight: "bold",
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
                            Bác sĩ nổi bật
                        </Typography>
                        <Button
                            onClick={() => navigate("/doctor")}
                            variant="contained"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 3,
                                py: 1,
                                borderRadius: 3,
                                fontWeight: 600,
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(69, 195, 210, 0.3)'
                                }
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </Box>
                    <Box sx={{ px: { xs: 2, md: 8 } }}>
                        <ResponsiveSlider>
                            {loading ? (
                                // Show 4 skeleton cards while loading
                                [...Array(4)].map((_, index) => (
                                    <DoctorCardSkeleton key={`skeleton-doctor-${index}`} />
                                ))
                            ) : (
                                doctors?.map((doctor, index) => (
                                    <Box
                                        key={`doctor-${index}`}
                                        sx={{
                                            cursor: "pointer",
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-8px)'
                                            }
                                        }}
                                        onClick={() => navigate(`/doctor/${doctor.id}`)}
                                    >
                                        <Box
                                            component="img"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/images/users/${doctor.avatar}`}
                                            sx={{
                                                height: { xs: 150, md: 200 },
                                                width: { xs: 150, md: 200 },
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                mb: 2,
                                                margin: 'auto',
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "text.primary",
                                                fontWeight: 600,
                                                fontSize: '1.1rem',
                                                textAlign: 'center',
                                                px: 1
                                            }}
                                        >
                                            {doctor.name}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </ResponsiveSlider>
                    </Box>
                </Box>
            </Box >
        </>
    );
};

export default Home;