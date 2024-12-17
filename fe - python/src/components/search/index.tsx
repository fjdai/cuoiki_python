import SearchIcon from '@mui/icons-material/Search';
import { alpha, InputBase, styled, Paper, Box } from "@mui/material";

const SearchContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    borderRadius: 100,
    backgroundColor: alpha(theme.palette.common.white, 0.95),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
    },
    '&:focus-within': {
        border: `2px solid ${theme.palette.primary.main}`,
        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1.5, 2),
        fontSize: '1.1rem',
        '&::placeholder': {
            color: theme.palette.text.secondary,
            opacity: 0.7,
        },
    },
}));

const SearchTool = () => {
    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 2 }}>
            <SearchContainer elevation={0}>
                <SearchIcon sx={{
                    color: 'text.secondary',
                    mr: 1,
                    transition: 'color 0.3s ease',
                    '.MuiPaper-root:focus-within &': {
                        color: 'primary.main'
                    }
                }} />
                <StyledInputBase
                    placeholder="Tìm kiếm bác sĩ, chuyên khoa, phòng khám..."
                    inputProps={{ 'aria-label': 'search' }}
                />
            </SearchContainer>
        </Box>
    );
};

export default SearchTool;