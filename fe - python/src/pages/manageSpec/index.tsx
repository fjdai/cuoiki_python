import { useState, useEffect } from 'react';
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
    CircularProgress
} from '@mui/material';
import {
    Search,
    Edit,
    Delete,
    Add as AddIcon,
    Refresh,
    Upload as UploadIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { callAllSpecialities } from '../../services/apiPatient/apiHome';
import { callCreateSpecialty, callDeleteSpecialty, callUpdateSpecialty, callUploadImgSpecialty } from '../../services/apiAdmin';

// Định nghĩa interfaces
interface Specialty {
    id: number;
    name: string;
    description: string;
    image: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
    id: keyof Specialty;
    label: string;
    sortable: boolean;
}

interface SortConfig {
    property: keyof Specialty;
    order: Order;
}

// Thêm interface FormErrors
interface FormErrors {
    name: string;
    description: string;
}

const ManageSpec = () => {
    // States
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>('');

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null as File | null
    });

    // Table headers
    const headCells: HeadCell[] = [
        { id: 'name', label: 'Tên chuyên khoa', sortable: true },
        { id: 'description', label: 'Mô tả', sortable: false },
    ];

    // Trong component ManageSpec, thêm state errors
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        description: ''
    });

    // Fetch data
    const fetchData = async () => {
        setLoading(true);
        const res = await callAllSpecialities();
        if (res && res.data) {
            setSpecialties(res.data);
        }
        else {
            toast.error("Không thể lấy dữ liệu");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleSort = (property: keyof Specialty) => {
        const isAsc = sortConfig[0]?.property === property && sortConfig[0]?.order === 'asc';
        setSortConfig([{ property, order: isAsc ? 'desc' : 'asc' }]);
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleEdit = (specialty: Specialty) => {
        setSelectedSpecialty(specialty);
        setFormData({
            name: specialty.name,
            description: specialty.description,
            image: null
        });
        if (specialty.image) {
            setPreviewImage(`${import.meta.env.VITE_BACKEND_URL}/images/specializations/${specialty.image}`);
        } else {
            setPreviewImage('');
        }
        setImageFile(null);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa chuyên khoa này?')) {
            const res = await callDeleteSpecialty(id);
            if (res && res.data) {
                toast.success('Xóa chuyên khoa thành công');
                await fetchData();
            }
            else {
                toast.error(res.message);
            }
        }
    };

    // Thay thế hàm validateForm hiện tại bằng:
    const validateForm = (): boolean => {
        let tempErrors = {
            name: '',
            description: ''
        };
        let isValid = true;

        // Validate name
        if (!formData.name.trim()) {
            tempErrors.name = 'Tên chuyên khoa là bắt buộc';
            isValid = false;
        } else if (formData.name.length < 3) {
            tempErrors.name = 'Tên chuyên khoa phải có ít nhất 3 ký tự';
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

    // Cập nhật hàm handleSubmit
    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        try {
            setLoading(true);
            let imageUrl = selectedSpecialty?.image || '';

            if (selectedSpecialty) {
                // Update
                if (imageFile) {
                    const imgRes = await callUploadImgSpecialty(imageFile);
                    if (imgRes && imgRes.data) {
                        imageUrl = imgRes.data;
                        const res = await callUpdateSpecialty(
                            selectedSpecialty.id,
                            formData.name,
                            formData.description,
                            imageUrl
                        );
                        if (res && res.data) {
                            toast.success('Cập nhật chuyên khoa thành công');
                            await fetchData();
                            handleCloseDialog();
                        } else {
                            toast.error('Không thể cập nhật chuyên khoa');
                        }
                    } else {
                        toast.error('Không thể tải lên hình ảnh');
                    }
                } else {
                    const res = await callUpdateSpecialty(
                        selectedSpecialty.id,
                        formData.name,
                        formData.description,
                        imageUrl
                    );
                    if (res && res.data) {
                        toast.success('Cập nhật chuyên khoa thành công');
                        await fetchData();
                        handleCloseDialog();
                    } else {
                        toast.error('Không thể cập nhật chuyên khoa');
                    }
                }
            } else {
                // Create
                if (!imageFile) {
                    toast.error('Vui lòng chọn hình ảnh');
                    setLoading(false);
                    return;
                }
                const imgRes = await callUploadImgSpecialty(imageFile);
                if (imgRes && imgRes.data) {
                    imageUrl = imgRes.data;
                    const res = await callCreateSpecialty(
                        formData.name,
                        formData.description,
                        imageUrl
                    );
                    if (res && res.data) {
                        toast.success('Thêm chuyên khoa thành công');
                        await fetchData();
                        handleCloseDialog();
                    } else {
                        toast.error('Không thể thêm chuyên khoa');
                    }
                } else {
                    toast.error('Không thể tải lên hình ảnh');
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Có lỗi xảy ra');
            setLoading(false);
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setFormData({ ...formData, image: file });
            // Tạo preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);
        }
    };

    // Cleanup URL khi component unmount hoặc URL thay đổi
    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image: null
        });
        setSelectedSpecialty(null);
        setImageFile(null);
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage('');
        }
    };

    // Filter and sort data
    const filteredSpecialties = specialties.filter(specialty =>
        Object.values(specialty).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const sortedSpecialties = [...filteredSpecialties].sort((a, b) => {
        const sort = sortConfig[0];
        if (!sort) return 0;

        const aValue = a[sort.property] || '';
        const bValue = b[sort.property] || '';

        if (sort.order === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    const handleCloseDialog = () => {
        setOpenDialog(false);
        resetForm();
        setImageFile(null);
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage('');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                Quản lý chuyên khoa
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="Tìm kiếm chuyên khoa..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            resetForm();
                            setOpenDialog(true);
                        }}
                        sx={{
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' },
                            minWidth: '160px'
                        }}
                    >
                        Thêm mới
                    </Button>
                    <IconButton
                        onClick={() => fetchData()}
                        sx={{ color: 'primary.main' }}
                    >
                        <Refresh />
                    </IconButton>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                bgcolor: 'primary.lighter',
                                '& th': { fontWeight: 'bold' }
                            }}>
                                {headCells.map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={sortConfig[0]?.property === headCell.id ? sortConfig[0].order : false}
                                        sx={{
                                            color: 'primary.darker',
                                            fontSize: '0.875rem'
                                        }}
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
                                <TableCell
                                    sx={{
                                        color: 'primary.darker',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Thao tác
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : sortedSpecialties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedSpecialties
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((specialty) => (
                                        <TableRow
                                            key={specialty.id}
                                            hover
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell sx={{ maxWidth: '200px' }}>{specialty.name}</TableCell>
                                            <TableCell sx={{
                                                maxWidth: '400px',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {specialty.description}
                                            </TableCell>
                                            <TableCell sx={{ width: '120px' }}>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(specialty)}
                                                        sx={{
                                                            color: 'primary.main',
                                                            '&:hover': { bgcolor: 'primary.lighter' }
                                                        }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(specialty.id)}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': { bgcolor: 'error.lighter' }
                                                        }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={sortedSpecialties.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                />
            </Paper>

            {/* Dialog for Add/Edit Specialty */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedSpecialty ? 'Chỉnh sửa chuyên khoa' : 'Thêm chuyên khoa mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Tên chuyên khoa"
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
                            fullWidth
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
                        ) : selectedSpecialty && (
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
                        onClick={handleCloseDialog}
                        sx={{ color: 'text.secondary' }}
                        disabled={loading}
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
                        {loading ? 'Đang xử lý...' : (selectedSpecialty ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageSpec;
