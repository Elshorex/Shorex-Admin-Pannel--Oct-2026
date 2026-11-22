import { useState } from "react";
import { toast } from "react-toastify";
import axios from "../constants/api";
import { useAuthState } from "../context";
import { useLanguage } from "./useLanguage";

export const useDeleteData = (url, body = null) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const user = useAuthState();
  const { locale } = useLanguage();

  const deleteData = () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: user.token,
        "Accept-Language": locale,
      },
    };

    const axiosRequest = body
      ? axios.delete(url, { ...config, data: body })
      : axios.delete(url, config);

    axiosRequest
      .then((data) => {
        if (data.status === 200) {
          setLoading(false);
          setData(data?.data);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(
          error?.response?.data?.errors
          // intl.formatMessage({
          //   id: "error.serverError",
          // })
        );
      });
  };

  return [data, loading, deleteData];
};
