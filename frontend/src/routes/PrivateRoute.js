import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const navigate = useNavigate();
  const getToken = localStorage.getItem("token") || "";
  
  useEffect(() => {
    if (!getToken) {
      navigate("/login");
    }
  }, [getToken, navigate]);

  return children;
}
