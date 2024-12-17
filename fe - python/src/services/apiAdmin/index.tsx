import axios from "../../utils/axiosCustomize";

export const callCreateClinic = (name: string, phone: string, address: string, description: string, image: string | null) => {
    return axios.post('/api/v1/clinic', { name, phone, address, description, image });
}

export const callUpdateClinic = (id: number, name: string, phone: string, address: string, description: string, image: string | null) => {
    return axios.put(`/api/v1/clinic/${id}`, { name, phone, address, description, image });
}

export const callDeleteClinic = (id: number) => {
    return axios.delete(`/api/v1/clinic/${id}`);
}


export const callUploadImgClinic = (fileImg: any) => {
    const bodyFormData = new FormData();
    bodyFormData.append("clinicImage", fileImg);
    return axios({
        method: "post",
        url: `/api/v1/clinic/image/`,
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "upload-type": "avatar"
        },
    })
}

export const callCreateSpecialty = (name: string, description: string, image: string | null) => {
    return axios.post('/api/v1/specialty', { name, description, image });
}

export const callUpdateSpecialty = (id: number, name: string, description: string, image: string | null) => {
    return axios.put(`/api/v1/specialty/${id}`, { name, description, image });
}

export const callDeleteSpecialty = (id: number) => {
    return axios.delete(`/api/v1/specialty/${id}`);
}

export const callUploadImgSpecialty = (fileImg: any) => {
    const bodyFormData = new FormData();
    bodyFormData.append("specImage", fileImg);
    return axios({
        method: "post",
        url: `/api/v1/specialty/image/`,
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "upload-type": "avatar"
        },
    })
}

export const callGetAllUsers = () => {
    return axios.get('/api/v1/users');
}


export const callCreateUser = (name: string, email: string, phone: string, address: string, gender: string, roleId: number, password: string, specialtyId: string | undefined, clinicId: string | undefined, description: string) => {
    return axios.post('/api/v1/users', { name, email, phone, address, gender, roleId, password, specialtyId, clinicId, description });
}

export const callUpdateUser = (id: string, name: string, email: string, phone: string, address: string, gender: string, roleId: number, specialtyId: string | undefined = undefined, clinicId: string | undefined = undefined, description: string) => {
    return axios.put('/api/v1/users', { id, name, email, phone, address, gender, roleId, specialtyId, clinicId, description });
}

export const callDeleteUser = (id: string) => {
    return axios.delete(`/api/v1/users/${id}`);
}


export const callDashboard = () => {
    return axios.get('/api/v1/admin/dashboard');
}
