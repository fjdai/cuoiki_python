import axios from "../../utils/axiosCustomize";

export const callRegister = (email: string, password: string, name: string, gender: string, roleId: number, phone: string, address: string) => {
    return axios.post("/api/v1/auth/register", { name, email, password, phone, gender, roleId, address });
}

// //cnpm
// export const callLogin = (email: string, password: string) => {
//     return axios.post("/api/v1/auth/login", { email, password })
// }

// python
export const callLogin = (username: string, password: string) => {
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    return axios.post("/api/v1/auth/login", formData);
}

export const callFetchAccount = (): Promise<any> => {
    return axios.get("/api/v1/auth/account");
}


export const callLogout = () => {
    return axios.post("/api/v1/auth/logout");
}

export const callUpdateInfo = (name: string, phone: string, avatar: string) => {
    return axios.put("/api/v1/auth/account", { name, phone, avatar });
}
