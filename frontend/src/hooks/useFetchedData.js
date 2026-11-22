import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../constants/api";
import { useAuthState } from "../context";
import { useLanguage } from "./useLanguage";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

export const useFetchedData = (url, firstRender = true) => {
  const [fetchedData, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const user = useAuthState();
  const getToken = localStorage.getItem("token") || "";
  const intl = useIntl();
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const getData = (paginationUrl) => {
    setLoading(true);
    axios
      .get(paginationUrl ? paginationUrl : url, {
        headers: {
          Authorization: user.token,
          "Accept-Language": locale,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setData(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(
          intl.formatMessage({
            id: "error.serverError",
          })
        );
      });
  };

  useEffect(() => {
    if (!getToken) {
      navigate("/login");
    } else {
      firstRender && getData();
    }
  }, []);

  return [fetchedData, loading, getData];
};
