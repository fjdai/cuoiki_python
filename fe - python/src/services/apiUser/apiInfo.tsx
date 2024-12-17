import axios from "../../utils/axiosCustomize";

export const callUploadAvt = (fileImg: any) => {
    const bodyFormData = new FormData();
    bodyFormData.append("avatar", fileImg);
    return axios({
        method: "post",
        url: "/api/v1/users/avatar",
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
            "upload-type": "avatar"
        },
    })
}

export const callUpdateUserInfo = (_id: any, phone: any, fullName: any, avatar: any) => {
    return axios.put(`/api/v1/user`, { _id, phone, fullName, avatar })
}

export const changePassword = (oldPassword: string, newPassword: string) => {
    return axios.post(`/api/v1/auth/change-password`, { oldPassword, newPassword });
}


export const forgotPassword = (email: string) => {
    return axios.post(`/api/v1/auth/forgot-password`, { email });
}
