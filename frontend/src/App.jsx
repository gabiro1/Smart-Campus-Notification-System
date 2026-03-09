import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

/**
 * @main App
 * @description The root of the application.
 * We keep this minimal and delegate routing to AppRoutes.
 */
function App() {
  return (
    <BrowserRouter>
      {/* You can add your AuthProvider or ThemeProvider here later */}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
