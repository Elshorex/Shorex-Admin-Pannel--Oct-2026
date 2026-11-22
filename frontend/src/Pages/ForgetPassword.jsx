import { React, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  List,
  ListItemText,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";

import { usePutData } from "../hooks/usePutData";
import axios from "../constants/api";

import CollapseItem from "../components/CollapseItem";
import loginLogo from "../assets/svgs/loginLogo.png";
import PublicNavbar from "../components/publicNavbar";

export default function ForgetPassword() {
  const [err, setErr] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();

  const emailFromState = location.state?.email || "";
  const legacyToken = new URLSearchParams(location.search).get("token");
  const legacyEmail = new URLSearchParams(location.search).get("email");
  const isOtpFlow = !legacyToken;

  const { register, handleSubmit, formState } = useForm({
    mode: "onSubmit",
    defaultValues: {
      email: emailFromState || legacyEmail || "",
      code: "",
      newPassword: "",
      password: "",
    },
  });

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/confirmationchange",
    {},
    intl.formatMessage({ id: "forgetPassword.updatePasswordSuccess" }),
    "error"
  );

  const onSubmitLegacy = async (data) => {
    setEditRequest({
      newPassword: data?.newPassword,
      token: legacyToken,
      email: (legacyEmail || data.email || "").trim().toLowerCase(),
    });
  };

  const onSubmitOtp = async (data) => {
    setErr("");
    const email = (data.email || emailFromState).trim().toLowerCase();
    const code = String(data.code || "").trim();
    const newPassword = data.newPassword;

    if (data.newPassword !== data.password) {
      setErr("Passwords do not match");
      return;
    }

    try {
      await axios.post("/reset-password", {
        email,
        code,
        newPassword,
        type: "ADMIN",
      });
      toast.success(
        intl.formatMessage({ id: "forgetPassword.updatePasswordSuccess" })
      );
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        "Failed to reset password";
      setErr(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error(typeof msg === "string" ? msg : "Failed to reset password");
    }
  };

  useEffect(() => {
    if (resultEdit?.token) {
      navigate("/login");
    }
  }, [resultEdit, navigate]);

  return (
    <>
      <PublicNavbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #049A77 50%, #D5DDDB 50%)",
        }}
      >
        <Card component="main" sx={{ width: 600, pb: "50px" }}>
          <Box
            sx={{
              marginTop: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img alt="logo" src={loginLogo} width={176} height={32} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                alignItems: "start",
                width: "80%",
              }}
            >
              <Typography variant="h2" sx={{ mt: 2 }}>
                <FormattedMessage id="forgetPassword.updatePassword" />
              </Typography>
              <Typography variant="h3">
                <FormattedMessage id="forgetPassword.newPasswordText" />
              </Typography>
            </Box>

            <Box sx={{ mt: 1, width: "80%" }}>
              <form
                onSubmit={handleSubmit(
                  isOtpFlow ? onSubmitOtp : onSubmitLegacy
                )}
              >
                {isOtpFlow && (
                  <>
                    <Typography variant="h3">
                      <FormattedMessage id="login.email" />
                    </Typography>
                    <TextField
                      {...register("email", { required: true })}
                      margin="normal"
                      fullWidth
                      defaultValue={emailFromState}
                      disabled={!!emailFromState}
                    />
                    <Typography variant="h3">Verification code</Typography>
                    <TextField
                      {...register("code", { required: true })}
                      margin="normal"
                      fullWidth
                      placeholder="6-digit code from email"
                    />
                  </>
                )}

                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.newPassword" />
                </Typography>
                <TextField
                  {...register("newPassword", {
                    required: true,
                    minLength: 8,
                  })}
                  margin="normal"
                  fullWidth
                  type="password"
                  autoFocus={!isOtpFlow}
                />

                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.passwordRequirements" />
                </Typography>

                <List dense>
                  {[
                    "min8Char",
                    "1upperLetter",
                    "1LowerLetter",
                    "1Number",
                    "1specialChar",
                  ].map((key) => (
                    <ListItemText
                      key={key}
                      primary={
                        <Typography variant="h4">
                          - <FormattedMessage id={`forgetPassword.${key}`} />
                        </Typography>
                      }
                    />
                  ))}
                </List>

                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.confirmNewPassword" />
                </Typography>
                <TextField
                  {...register("password", { required: true })}
                  margin="normal"
                  fullWidth
                  type="password"
                />

                <LoadingButton
                  loading={loadingEdit}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                >
                  <Typography variant="h3">
                    <FormattedMessage id="forgetPassword.updatePassword" />
                  </Typography>
                </LoadingButton>
              </form>
            </Box>
            {err !== "" ? <CollapseItem err={err} /> : null}
          </Box>
        </Card>
      </Box>
    </>
  );
}
