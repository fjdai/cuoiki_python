import axios from "../../utils/axiosCustomize";

export const callDoctorSchedule = () => {
    return axios.get(`/api/v1/schedules`)
}

export const callCreateSchedule = (startTime: string, endTime: string, price: number, maxBooking: number) => {
    return axios.post(`/api/v1/schedules`, { startTime, endTime, price, maxBooking })
}

export const callUpdateSchedule = (
    id: string,
    startTime: string,
    endTime: string,
    price: number,
    maxBooking: number
) => {
    return axios.put(`/api/v1/schedules`, {
        id,
        startTime,
        endTime,
        price,
        maxBooking
    });
};

export const callDeleteSchedule = (id: string) => {
    return axios.delete(`/api/v1/schedules/${id}`);
};

export const callGetPatientForDoctor = () => {
    return axios.get(`/api/v1/schedules/patient-accept`);
}

export const callSendBill = (patientId: string, scheduleId: string) => {
    return axios.put(`/api/v1/doctor/bill`, { patientId, scheduleId });
}
