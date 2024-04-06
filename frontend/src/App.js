// Routing
import AppRouter from "./containers/Router/Router";
// import UserProvider from "./context/UserProvider";
// import AuthProvider from "./context/AuthProvider";

function App() {
  return (
    // <AuthProvider>
    //   <UserProvider>
        <AppRouter />
    //   </UserProvider>
    // </AuthProvider>
  );
}

export default App;
