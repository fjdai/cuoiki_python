import axios from "../../utils/axiosCustomize";

export const callAllSpecialities = () => {
    return axios.get(`/api/v1/specialty`)
}

export const callAllClinics = () => {
    return axios.get(`/api/v1/clinic`)
}

export const callAllDoctors = () => {
    return axios.get(`/api/v1/doctor`)
}

export const callDoctorByClinicId = (id: any) => {
    return axios.get(`/api/v1/doctor/clinic/${id}`)
}

export const callDoctorBySpecialty = (id: any) => {
    return axios.get(`/api/v1/doctor/spec/${id}`)
}

export const callDoctorById = (id: any) => {
    return axios.get(`/api/v1/doctor/${id}`)
}

export const callSchedulesByDoctorId = (id: any) => {
    return axios.get(`/api/v1/schedules/${id}`)
}

export const callCreateSchedule = (scheduleId: string, name: string, phone: string, email: string, gender: string, address: string, description: string) => {
    return axios.post(`/api/v1/patient`, { scheduleId, name, phone, email, gender, address, description })
}
