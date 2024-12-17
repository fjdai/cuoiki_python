import { Box, Grid, Typography, Card, CardContent, IconButton, } from '@mui/material';
import { PeopleAlt, LocalHospital, EventNote, TrendingUp, } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { callDashboard } from '../../services/apiAdmin';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalSpecialties: 0
    });

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await callDashboard();
            if (res && res.data) {
                setStats({
                    totalUsers: res.data.supporters,
                    totalDoctors: res.data.doctors,
                    totalAppointments: res.data.schedule,
                    totalSpecialties: res.data.specialties
                });
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card
            sx={{
                height: '100%',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        sx={{
                            backgroundColor: `${color}15`,
                            color: color,
                            width: 48,
                            height: 48,
                            '&:hover': {
                                backgroundColor: `${color}25`,
                            }
                        }}
                    >
                        {icon}
                    </IconButton>
                </Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                    {loading ? '-' : (value ?? 0).toLocaleString()}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: 1
                    }}
                >
                    Tổng quan
                </Typography>
                <Typography color="text.secondary">
                    Thống kê tổng quan về hoạt động của hệ thống
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng số người hỗ trợ"
                        value={stats.totalUsers}
                        icon={<PeopleAlt />}
                        color="#45c3d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng số bác sĩ"
                        value={stats.totalDoctors}
                        icon={<LocalHospital />}
                        color="#4CAF50"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng số lịch hẹn"
                        value={stats.totalAppointments}
                        icon={<EventNote />}
                        color="#FF9800"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng số chuyên khoa"
                        value={stats.totalSpecialties}
                        icon={<TrendingUp />}
                        color="#F44336"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
