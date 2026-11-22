let userData = localStorage.getItem("userData")
? JSON.parse(localStorage.getItem("userData"))
: "";

let token = localStorage.getItem("token")
? JSON.parse(localStorage.getItem("token"))
  : "";

export const initialState = {
  userData: "" || userData,
  token: "" || token,
  loading: false,
  errorMessage: null,
};

export const AuthReducer = (initialState, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...initialState,
        loading: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...initialState,
        userData: action.payload.user,
        token: action.payload.token,
        loading: false,
        errorMessage: null,
      };
    case "LOGOUT":
      return {
        ...initialState,
        userData: "",
        token: "",
      };

    case "LOGIN_ERROR":
      return {
        ...initialState,
        loading: false,
        errorMessage: action.error,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
