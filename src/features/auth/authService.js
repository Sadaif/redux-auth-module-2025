import api from "../../services/api";
import { loginStart, loginSuccess, loginFailure, logout } from "./authSlice";

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
 
    const response = await api.request("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store tokens in memory and set expiration timer
    api.setTokens(
      response.accessToken,
      response.refreshToken,
      credentials.expiresInMins
    );

    dispatch(loginSuccess({ user: response }));
    return response;
  } catch (error) {
    dispatch(loginFailure(error.message || "Login failed"));
    throw error;
  }
};

export const logoutUser = () =>  (dispatch) => {
  
    // Clear cookies explicitly
    document.cookie = "accessToken=; Max-Age=0; path=/; secure;";
    document.cookie = "refreshToken=; Max-Age=0; path=/; secure;";

    // Clear tokens and dispatch logout
    api.clearTokens();
    dispatch(logout());
    window.location.href = "/login";
   
};

export const checkAuth = () => async (dispatch) => {
  try {
    const response = await api.request("/me");
    dispatch(loginSuccess({ user: response.user }));
    return response;
  } catch (error) {
    dispatch(logout());
    throw error;
  }
};