import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const signIn = async (email: string, password: string) => {
  const res = await api.post("/auth/sign_in", { email, password });

  const { ["access-token"]: token, client, uid } = res.headers;
  localStorage.setItem("access-token", token);
  localStorage.setItem("client", client);
  localStorage.setItem("uid", uid);

  return res.data;
};
