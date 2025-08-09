import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // update for prod
  withCredentials: true,
});

export default api;
