import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import NotPermitted from "../NotPermitted";

const RoleBaseRouteAdmin = (props: any) => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    const user = useSelector((state: any) => state.account.user);
    const userRole = user.roleId;

    if (isAdminRoute && userRole === 1) {
        return (<>{props.children}</>)
    }
    else {
        return (<NotPermitted />)
    }
}

const ProtectedRouteAdmin = (props: any) => {
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

export default ProtectedRouteAdmin