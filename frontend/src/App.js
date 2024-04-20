// Routing
import AppRouter from "./containers/Router/Router";
// import UserProvider from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
        <AppRouter />
	 </AuthProvider>
  );
}

export default App;

// {/* <UserProvider> */}
// {/* </UserProvider> */}