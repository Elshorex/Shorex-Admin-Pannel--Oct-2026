import { toast } from "react-toastify";
import axios from "../constants/api";

export function loginUser(dispatch, loginPayload, locale) {
  dispatch({ type: "LOGIN" });
  return axios
    .post("admin/signin", loginPayload, {
      headers: {
        "Accept-Language": locale,
      },
    })
    .then((data) => {
      const user = data.data.user;
      if (user) {
        const token = "Bearer " + data.data.token;
        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("token", JSON.stringify(token));
        dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
        return user;
      }
      return;
    })
    .catch((err) => {
      toast.error(err?.response?.data?.errors);
      dispatch({ type: "LOGIN_ERROR", error: err?.response?.data?.errors });
      return;
    });
}

export async function logout(dispatch) {
  dispatch({ type: "LOGOUT" });
  localStorage.removeItem("userData");
  localStorage.removeItem("token");
  sessionStorage.removeItem("pageSize");

  localStorage.clear();
  sessionStorage.clear();
}
