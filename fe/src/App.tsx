import { ToastContainer } from "react-toastify";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { CookiesProvider } from "react-cookie";
import { store } from "./store";
import router from "./routes";

import "./assets/plugins/tabler-icons/tabler-icons.min.css";
import "./assets/css/style.css";
import "./assets/css/overrides.css";
import "react-toastify/dist/ReactToastify.css";
import ThemeSettings from "./components/ThemeCustomizer/ThemeSettings";

function App() {
  return (
    <>
      <Provider store={store}>
        <CookiesProvider>
          <RouterProvider router={router} />
          <ThemeSettings />
        </CookiesProvider>
      </Provider>
      <ToastContainer />
    </>
  );
}
export default App;
