import { Box, Container, Grid, Typography, Link } from "@mui/material";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Footer = () => {
    return (
        <Box sx={{
            bgcolor: 'background.paper',
            py: 6,
            borderTop: '1px solid',
            borderColor: 'divider'
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <LocalHospitalIcon sx={{ color: 'primary.main', mr: 1, fontSize: 30 }} />
                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                DoctorCare
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Nền tảng Y tế chăm sóc sức khỏe toàn diện hàng đầu Việt Nam
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Về chúng tôi
                                </Typography>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Giới thiệu
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Liên hệ
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block">
                                    Điều khoản sử dụng
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Dịch vụ
                                </Typography>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Đặt khám tại cơ sở
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Khám chuyên khoa
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block">
                                    Tư vấn khám bệnh
                                </Link>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Hỗ trợ
                                </Typography>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Hướng dẫn
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    Câu hỏi thường gặp
                                </Link>
                                <Link href="#" underline="hover" color="text.secondary" display="block">
                                    Chính sách bảo mật
                                </Link>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 4, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}
                >
                    © {new Date().getFullYear()} DoctorCare. Tất cả quyền được bảo lưu.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;