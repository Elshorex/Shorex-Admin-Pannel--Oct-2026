import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { useAuthState } from "../context";
import { useLanguage } from "./useLanguage";
import axios from "../constants/api";

export const usePostData = (url, requestData, successMsg, failMsg) => {
  const user = useAuthState();
  const { locale } = useLanguage();
  
  const [response, setResponse] = useState({});
  const [reqData, setReq] = useState(requestData);
  const [loading, setLoading] = useState(false);
  console.log(user?.token,"token");
  const postRequest = useCallback(() => {
    if (Object.keys(reqData).length === 0) return;
    setLoading(true);
    axios
      .post(url, reqData, {
        headers: {
          Authorization: user.token,
          "Accept-Language": locale,
        },
      })
      .then((data) => {
        if (data.status === 200) {
          setResponse(data.data);
          successMsg && toast.success(successMsg);
          setLoading(false);
        } else {
          setResponse([]);
          toast.error(data.responseMsg || data?.errors);
          setLoading(false);
        }
      })
      .catch((error) => {
        setResponse([]);
        setLoading(false);
        toast.error(
          failMsg && failMsg ||
          error?.response?.data?.errors[0]?.param
            ? error?.response?.data?.errors[0].msg +
                " in " +
                " " +
                error?.response?.data?.errors[0]?.param
            : error?.response?.data?.errors[0].msg
        );
      });
  }, [reqData]);

  useEffect(() => {
    postRequest();
  }, [reqData]);

  return [response, loading, setReq];
};
