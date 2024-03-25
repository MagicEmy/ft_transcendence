// Routing
import Router from "./containers/Router/Router";
import UserProvider from "./context/UserProvider";
import AuthProvider from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router />
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
