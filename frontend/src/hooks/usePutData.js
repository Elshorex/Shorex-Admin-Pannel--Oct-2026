import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { useAuthState } from "../context";
import axios from "../constants/api";
import { useLanguage } from "./useLanguage";

export const usePutData = (url, requestData, successMsg, failMsg) => {
  const user = useAuthState();
  const { locale } = useLanguage();

  const [response, setResponse] = useState({});
  const [reqData, setReq] = useState(requestData);
  const [loading, setLoading] = useState(false);

  const putRequest = useCallback(() => {
    if (reqData != "approve" && Object.keys(reqData).length === 0) return;
    setLoading(true);
    axios
      .put(url, reqData != "approve" ? reqData : {}, {
        headers: {
          Authorization: user.token,
          "Accept-Language": locale,
          "Content-Type": "application/json",
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
          (error?.response?.data?.errors[0]?.param
            ? error?.response?.data?.errors[0].msg +
              " in " +
              " " +
              error?.response?.data?.errors[0]?.param
            : error?.response?.data?.errors[0].msg) || error?.response?.data?.errors
        );
        toast.error(failMsg);
      });
  }, [reqData]);

  useEffect(() => {
    putRequest();
  }, [reqData]);

  return [response, loading, setReq];
};
