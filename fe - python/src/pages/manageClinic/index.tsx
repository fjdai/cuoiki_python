import { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TableSortLabel,
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { callAllClinics } from '../../services/apiPatient/apiHome';
import { callCreateClinic, callUploadImgClinic, callUpdateClinic, callDeleteClinic } from '../../services/apiAdmin';

// Interface Clinic     
interface Clinic {
    id: number;
    name: string;
    phone: string;
    address: string;
    description: string;
    image: string;
}

// Interface HeadCell
interface HeadCell {
    id: keyof Clinic;
    label: string;
    sortable: boolean;
}

type Order = 'asc' | 'desc';

interface SortConfig {
    property: keyof Clinic;
    order: Order;
}

// Interface FormErrors
interface FormErrors {
    name: string;
    phone: string;
    address: string;
    description: string;
}

const ManageClinic = () => {
    // States
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        description: '',
        image: null as string | null
    });

    // State for form errors
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        phone: '',
        address: '',
        description: ''
    });

    // Head cells configuration
    const headCells: HeadCell[] = [
        { id: 'name', label: 'Tên cơ sở', sortable: true },
        { id: 'phone', label: 'Số điện thoại', sortable: true },
        { id: 'address', label: 'Địa chỉ', sortable: true },
        { id: 'description', label: 'Mô tả', sortable: false },
    ];

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        const res = await callAllClinics();
        if (res && res.data) {
            setClinics(res.data);
        }
        else {
            toast.error('Không thể tải dữ liệu');
        }
        setLoading(false);
    }

    // Fetch data when component is mounted
    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };
    // Handle change rows per page
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle search
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    // Handle sort
    const handleSort = (property: keyof Clinic) => {
        const isAsc = sortConfig[0]?.property === property && sortConfig[0]?.order === 'asc';
        setSortConfig([{ property, order: isAsc ? 'desc' : 'asc' }]);
    };

    // Handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // Handle open dialog
    const handleOpenDialog = (clinic?: Clinic) => {
        if (clinic) {
            setSelectedClinic(clinic);
            setFormData({
                name: clinic.name,
                phone: clinic.phone,
                address: clinic.address,
                description: clinic.description,
                image: clinic.image
            });
            setPreviewImage(clinic.image ? `${import.meta.env.VITE_BACKEND_URL}/images/clinics/${clinic.image}` : '');
        } else {
            setSelectedClinic(null);
            setFormData({
                name: '',
                phone: '',
                address: '',
                description: '',
                image: null as string | null
            });
            setPreviewImage('');
            setImageFile(null);
        }
        setOpenDialog(true);
    };

    // Validate form    
    const validateForm = (): boolean => {
        let tempErrors = {
            name: '',
            phone: '',
            address: '',
            description: ''
        };
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            tempErrors.name = 'Tên cơ sở là bắt buộc';
            isValid = false;
        } else if (formData.name.length < 3) {
            tempErrors.name = 'Tên cơ sở phải có ít nhất 3 ký tự';
            isValid = false;
        }

        // Validate phone
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!formData.phone) {
            tempErrors.phone = 'Số điện thoại là bắt buộc';
            isValid = false;
        } else if (!phoneRegex.test(formData.phone)) {
            tempErrors.phone = 'Số điện thoại không hợp lệ';
            isValid = false;
        }

        // Validate address
        if (!formData.address.trim()) {
            tempErrors.address = 'Địa chỉ là bắt buộc';
            isValid = false;
        } else if (formData.address.length < 5) {
            tempErrors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
            isValid = false;
        }

        // Validate description (optional)
        if (formData.description && formData.description.length < 10) {
            tempErrors.description = 'Mô tả phải có ít nhất 10 ký tự';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        setLoading(true);
        if (selectedClinic) {
            if (imageFile) {
                const resImg = await callUploadImgClinic(imageFile);
                if (resImg && resImg.data) {
                    setFormData({ ...formData, image: resImg.data });
                    const res = await callUpdateClinic(selectedClinic.id, formData.name, formData.phone, formData.address, formData.description, resImg.data);
                    if (res && res.data) {
                        toast.success('Cập nhật cơ sở thành công');
                    }
                    else {
                        toast.error("Cập nhật cơ sở thất bại");
                    }
                }
                else {
                    toast.error("Cập nhật cơ sở thất bại");
                }
            }
            else {
                const res = await callUpdateClinic(selectedClinic.id, formData.name, formData.phone, formData.address, formData.description, formData.image);
                if (res && res.data) {
                    toast.success('Cập nhật cơ sở thành công');
                }
                else {
                    toast.error("Cập nhật cơ sở thất bại");
                }
            }
            setOpenDialog(false);
        } else {
            if (imageFile) {

                const resImg = await callUploadImgClinic(imageFile);
                const res = await callCreateClinic(formData.name, formData.phone, formData.address, formData.description, resImg.data);
                if (res && res.data) {
                    toast.success('Thêm cơ sở thành công');
                }
                else {
                    toast.error("Thêm cơ sở thất bại");
                }
            }
            else {
                const res = await callCreateClinic(formData.name, formData.phone, formData.address, formData.description, formData.image);
                if (res && res.data) {
                    toast.success('Thêm cơ sở thành công');
                }
                else {
                    toast.error("Thêm cơ sở thất bại");
                }
            }
        }
        fetchData();
        setOpenDialog(false);
        setLoading(false);
    };

    // Handle delete
    const handleDelete = async (clinicId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
            setLoading(true);
            const res = await callDeleteClinic(clinicId);
            if (res && res.data) {
                toast.success('Xóa cơ sở thành công');
            }
            else {
                toast.error(res.message);
            }
            fetchData();
            setLoading(false);
        }
    };

    // Filter and sort data
    const filteredClinics = clinics.filter(clinic =>
        Object.values(clinic).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedClinics = [...filteredClinics].sort((a, b) => {
        if (sortConfig.length === 0) return 0;
        const { property, order } = sortConfig[0];
        const aValue = a[property];
        const bValue = b[property];

        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Quản lý cơ sở khám bệnh
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Tìm kiếm cơ sở..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            minWidth: '160px'
                        }}
                    >
                        Thêm mới
                    </Button>
                    <IconButton
                        onClick={() => window.location.reload()}
                        sx={{ color: 'primary.main' }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={sortConfig[0]?.property === headCell.id ? sortConfig[0].order : false}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {headCell.sortable ? (
                                            <TableSortLabel
                                                active={sortConfig[0]?.property === headCell.id}
                                                direction={sortConfig[0]?.property === headCell.id ? sortConfig[0].order : 'asc'}
                                                onClick={() => handleSort(headCell.id)}
                                            >
                                                {headCell.label}
                                            </TableSortLabel>
                                        ) : (
                                            headCell.label
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : sortedClinics.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedClinics
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((clinic) => (
                                        <TableRow key={clinic.id}>
                                            <TableCell>{clinic.name}</TableCell>
                                            <TableCell>{clinic.phone}</TableCell>
                                            <TableCell>{clinic.address}</TableCell>
                                            <TableCell>{clinic.description}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleOpenDialog(clinic)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(clinic.id)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={sortedClinics.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                />
            </Paper>

            {/* Dialog for Add/Edit Clinic */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedClinic ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Tên cơ sở"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                        <TextField
                            label="Số điện thoại"
                            fullWidth
                            value={formData.phone}
                            onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (errors.phone) setErrors({ ...errors, phone: '' });
                            }}
                            required
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                        <TextField
                            label="Địa chỉ"
                            fullWidth
                            value={formData.address}
                            onChange={(e) => {
                                setFormData({ ...formData, address: e.target.value });
                                if (errors.address) setErrors({ ...errors, address: '' });
                            }}
                            required
                            error={!!errors.address}
                            helperText={errors.address}
                        />
                        <TextField
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (errors.description) setErrors({ ...errors, description: '' });
                            }}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                        >
                            Tải ảnh lên
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </Button>
                        {previewImage ? (
                            <Box sx={{ mt: 2 }}>
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                            </Box>
                        ) : selectedClinic && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                                <Typography color="text.secondary">
                                    Không có ảnh
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        {selectedClinic ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageClinic;
