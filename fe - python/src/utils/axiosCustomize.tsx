import axios from 'axios';
import nProgress from 'nprogress';

nProgress.configure({
    showSpinner: false,
    trickleSpeed: 100
})


const baseUrl = import.meta.env.VITE_BACKEND_URL;
const instance = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

instance.defaults.headers.common = { 'Authorization': `Bearer ${localStorage.getItem("access_token")}` }

const handleRefreshToken = async () => {
    const res = await instance.get("/api/v1/auth/refresh");
    if (res && res.data) {
        return res.data.access_token;
    }
    else {
        null;
    }
}
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    nProgress.start();
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem("access_token")) {
        config.headers.Authorization = "Bearer " + window.localStorage.getItem("access_token")
    }
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    nProgress.done();
    return Promise.reject(error);
});

const NO_RETRY_HEADER = "x-no-retry";

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    nProgress.done();
    return response && response.data ? response.data : response;
}, async function (error) {
    nProgress.done();
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.config && error.response && +error.response.statusCode === 401 && !error.config.headers[NO_RETRY_HEADER]) {
        const access_token = await handleRefreshToken();
        error.config.headers[NO_RETRY_HEADER] = "true";
        if (access_token) {
            error.config.headers['Authorization'] = `Bearer ${access_token}`;
            localStorage.setItem("access_token", access_token);

            return instance.request(error.config);
        }
    }
    if (error.config && error.response
        && +error.response.statusCode === 400
        && error.config.url === "/api/v1/auth/refresh"
        && window.location.pathname !== "/login"
    ) {
        if (window.location.pathname !== "/"
            && !window.location.pathname.startsWith("specialty")
            && !window.location.pathname.startsWith("clinic")
            && !window.location.pathname.startsWith("doctor")
        ) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
        }
    }


    return error?.response?.data ?? Promise.reject(error);
});




export default instance;
