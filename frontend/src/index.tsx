import axios from "axios";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";

// { withCredentials: true }
axios.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("access_token");
  let tokenType = localStorage.getItem("token_type");
  // 如果JWT存在，則放入Header
  if (token !== null && tokenType !== null) {
    config.headers.Authorization = `${tokenType} ${token}`;
  }
  return config;
})

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <App />
);
