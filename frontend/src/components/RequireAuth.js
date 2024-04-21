import { useLocation, Navigate, Outlet } from "react-router-dom";
import AuthContext from '../context/AuthContext'

const RequireAuth = ({ allowedRoles }) => {
	const { isLogged } = useContext(AuthContext);
    const location = useLocation();

    return (
			isLogged ?
				<Navigate to="/dashboard" state={{ from: location }} replace />
			: <Navigate to="/unauthorized" state={{ from: location }} replace />
    );
}

export default RequireAuth;