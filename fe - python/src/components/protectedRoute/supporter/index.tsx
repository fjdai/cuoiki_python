import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import NotPermitted from "../NotPermitted";

const RoleBaseRouteAdmin = (props: any) => {
    const isSupportRoute = window.location.pathname.startsWith("/supporter");
    const user = useSelector((state: any) => state.account.user);
    const userRole = user.roleId;

    if (isSupportRoute && userRole === 3) {
        return (<>{props.children}</>)
    }
    else {
        return (<NotPermitted />)
    }
}

const ProtectedRouteSupport = (props: any) => {
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

export default ProtectedRouteSupport