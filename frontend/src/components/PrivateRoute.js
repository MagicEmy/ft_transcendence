import { Routes, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const PrivateRoute = ({children, ...rest}) => {
    const navigate = useNavigate();

    let {authToken} = useContext(AuthContext)
    return(
        <Routes {...rest}>{!authToken ? navigate('*') :   children}</Routes>
    )
}

export default PrivateRoute;
