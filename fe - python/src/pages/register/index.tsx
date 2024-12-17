import { Box, Button, CircularProgress, IconButton, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";
import background from "../../assets/bg-register.jpg";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { callRegister } from "../../services/apiUser/apiAuth";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";




const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [roleId, setRoleId] = useState("" as any);
    const [gender, setGender] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();


    const handleOnSubmit = async (event: any) => {
        event.preventDefault();
        setIsLoading(true);
        const res: any = await callRegister(email, password, name, gender, roleId, phone, address);
        setIsLoading(false);

        if (res?.data?.user?.id) {
            navigate("/admin/manage");
            toast.success("Đăng kí thành công")
        } else {

            if (Array.isArray(res.message)) {
                toast.error(`${res.message[0]}`)
            }
            else {
                toast.error(`${res.message}`)

            }

        };
    }


    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                bgcolor="common.white"
                sx={{
                    backgroundImage: `url(${background})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
            >

                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        height: "auto",
                        width: '25%',
                        minWidth: "450px",
                        backgroundColor: "common.white",
                        boxShadow: 15,
                        borderRadius: 15,
                        padding: "50px"
                    }}
                    onSubmit={handleOnSubmit}
                >
                    <Typography variant="h4" fontWeight={550} align="center" sx={{
                        p: "20px"
                    }}>
                        Sign Up
                    </Typography>
                    <TextField
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="abc@gmail.com"
                        label="Email"
                        variant="outlined"
                        fullWidth />
                    <TextField
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password" placeholder="123456" variant="outlined" fullWidth
                        type={showPassword ? 'text' : 'password'}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            },
                        }}

                    />
                    <TextField
                        required

                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A" label="Name" variant="outlined" fullWidth />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <TextField
                            required

                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            select
                            label="Gender"
                            style={{ width: "45%" }}
                        >
                            <MenuItem key={1} value="Male">
                                Male
                            </MenuItem>
                            <MenuItem key={2} value="Famale">
                                Female
                            </MenuItem>
                        </TextField>
                        <TextField
                            required

                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            select
                            label="Role"
                            style={{ width: "45%" }}
                        >
                            <MenuItem key={1} value={1}>
                                Admin
                            </MenuItem>
                            <MenuItem key={2} value={2}>
                                Doctor
                            </MenuItem>
                            <MenuItem key={3} value={3}>
                                Supporter
                            </MenuItem>
                        </TextField>
                    </Box>
                    <TextField
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0987654321" label="Phone" variant="outlined" fullWidth />
                    <TextField
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Địa chỉ nơi ở của bạn" label="Address" variant="outlined" fullWidth />
                    <Box display={"flex"} justifyContent={"flex-end"}>
                        <Box
                            sx={{ cursor: "pointer", width: "22%" }}
                            display={"flex"}
                            alignItems={"center"}
                            gap={0.5}
                            onClick={() => navigate("/admin/manage")}
                        >
                            <ArrowBackIcon style={{ fontSize: 15 }} />
                            <Typography variant="body2">Go Back</Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        style={{ borderRadius: 15, width: "60%", alignSelf: "center" }}
                        color="primary"
                        onClick={handleOnSubmit}
                        disabled={isLoading}
                        type="submit"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {!isLoading ? "Sign Up" : <><CircularProgress sx={{ ml: -2.5, mr: 0.5 }} size="1rem" color="inherit" />Sign Up</>}
                    </Button>
                </Box>
            </Box >
        </>
    )
}


export default RegisterPage;