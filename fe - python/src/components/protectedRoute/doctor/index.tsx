import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import NotPermitted from "../NotPermitted";

const RoleBaseRouteAdmin = (props: any) => {
    const isDoctorRoute = window.location.pathname.startsWith("/doctor-management");
    const user = useSelector((state: any) => state.account.user);
    const userRole = user.roleId;

    if (isDoctorRoute && userRole === 2) {
        return (<>{props.children}</>)
    }
    else {
        return (<NotPermitted />)
    }
}

const ProtectedRouteDoctor = (props: any) => {
    const isAuthenticated = useSelector((state: any) => state.account.isAuthenticated);

    return (
        <>
            {isAuthenticated
                ?
                <RoleBaseRouteAdmin>
                    {props.children}
                </RoleBaseRouteAdmin>
                :
                <Navigate to={"/login"} replace />
            }
        </>
    )
}

export default ProtectedRouteDoctor