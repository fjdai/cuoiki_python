import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import Home from "./pages/home"
import LoginPage from "./pages/login"
import { useDispatch } from "react-redux";
import { doGetAccountAction } from "./redux/account/accountSlice";
import { callFetchAccount } from "./services/apiUser/apiAuth";
import { useEffect, FC } from "react";
import NotFound from "./components/notFound";
import { Box } from "@mui/material";
import Header from "./components/header";
import Footer from "./components/footer";
import ProtectedRouteAdmin from "./components/protectedRoute/admin";
import Specialty from "./pages/specialty";
import Clinic from "./pages/clinic";
import Doctor from "./pages/doctor";
import DetailSpecialty from "./pages/detailSpecialty";
import DetailDoctor from "./pages/detailDoctor";
import DetailClinic from "./pages/detailClinic";
import LayoutManagement from "./components/layoutManagement";
import AdminDashboard from "./pages/admin";
import ManageUser from "./pages/manageUser";
import ProtectedRouteDoctor from "./components/protectedRoute/doctor";
import ProtectedRouteSupport from "./components/protectedRoute/supporter";
import ManagePatient from "./pages/managePatient";
import Supporter from "./pages/supporter";
import DoctorPatient from "./pages/doctorPatient";
import ManageClinic from "./pages/manageClinic";
import ManageSpec from "./pages/manageSpec";

const Layout = () => {
  return (
    <div className="layout-app">
      <Box display={"flex"} flexDirection={"column"} overflow={"hidden"}>
        <Header />
        <Outlet />
        <Footer />
      </Box>
    </div>
  )
}

const App: FC = () => {
  const dispatch = useDispatch();
  const getAccount = async () => {
    const res = await callFetchAccount();
    if (res && res.data) {
      dispatch(doGetAccountAction(res.data))
    }
  }

  useEffect(() => {
    getAccount()
  }, [])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: "specialty",
          element: <Specialty />,
        },
        {
          path: "specialty/:id",
          element: <DetailSpecialty />,
        },
        {
          path: "clinic",
          element: <Clinic />,
        }, {
          path: "clinic/:id",
          element: <DetailClinic />,
        },
        {
          path: "doctor",
          element: <Doctor />,
        },
        {
          path: "doctor/:id",
          element: <DetailDoctor />,
        },
      ]
    },


    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/admin",
      element:
        <ProtectedRouteAdmin>
          <LayoutManagement />
        </ProtectedRouteAdmin>,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <AdminDashboard />
        },
        {
          path: "manage",
          element: <ManageUser />
        },
        {
          path: "clinic",
          element: <ManageClinic />
        },
        {
          path: "spec",
          element: <ManageSpec />
        },
      ]
    },
    {
      path: "/doctor-management",
      element:
        <ProtectedRouteDoctor>
          <LayoutManagement />
        </ProtectedRouteDoctor>,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <DoctorPatient />
        },

        {
          path: "patient",
          element: <ManagePatient />
        },
      ]
    },
    {
      path: "/supporter",
      element:
        <ProtectedRouteSupport>
          <LayoutManagement />
        </ProtectedRouteSupport>,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <Supporter />
        },
      ]
    },

  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
