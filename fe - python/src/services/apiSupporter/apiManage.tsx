import axios from "../../utils/axiosCustomize";


export const callGetPatientForSupporter = () => {
    return axios.get("/api/v1/schedules/supporter");
}


export const callUpdateAppointmentStatus = (scheduleId: string, patientId: string, status: string) => {
    return axios.put(`/api/v1/schedules/change-status`, { scheduleId, patientId, status });
};

export const callDeleteAppointment = (schedulesId: string, patientId: string) => {
    return axios.delete(`/api/v1/schedules/${schedulesId}/${patientId}`);
}; 