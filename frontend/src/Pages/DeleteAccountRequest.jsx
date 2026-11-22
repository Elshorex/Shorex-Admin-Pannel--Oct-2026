import { React, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  TextField,
  Box,
  Card,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import PublicNavbar from "../components/publicNavbar";
import axios from "../constants/api";
import { useLanguage } from "../hooks/useLanguage";

import loginLogo from "../assets/svgs/loginLogo.png";

export default function DeleteAccountRequest() {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm({
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post(
        "/request-account-deletion",
        {
          email: data.email.trim().toLowerCase(),
          reason: data.reason.trim(),
        },
        {
          headers: {
            "Accept-Language": locale,
          },
        }
      );
      setSubmitted(true);
      reset();
    } catch (error) {
      const msg =
        error?.response?.data?.errors ||
        error?.response?.data?.message ||
        "Failed to submit request";
      toast.error(typeof msg === "string" ? msg : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #049A77 50%, #F2F3F2 50%)",
          height: "100vh",
        }}
      >
        <Card
          component="main"
          sx={{ minWidth: 400, maxWidth: 600, py: 5, px: 3, m: 3 }}
        >
          <Box
            sx={{
              my: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img alt="logo" src={loginLogo} width={176} height={32} />

            {submitted ? (
              <Box sx={{ mt: 3, textAlign: "center", width: 400 }}>
                <Typography variant="h3" sx={{ color: "#049A77", mb: 1 }}>
                  <FormattedMessage id="deleteAccount.successTitle" />
                </Typography>
                <Typography variant="h3">
                  <FormattedMessage id="deleteAccount.successMessage" />
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h3">
                  <FormattedMessage id="login.email" />
                </Typography>
                <TextField
                  {...register("email", {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  })}
                  margin="normal"
                  fullWidth
                  id="email"
                  placeholder="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={
                    formState.errors?.email?.type === "required" ||
                    formState.errors?.email?.type === "pattern"
                  }
                  helperText={
                    formState.errors?.email?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
                <Typography variant="h3">
                  <FormattedMessage id="deleteAccount.reason" />
                </Typography>
                <TextField
                  {...register("reason", { required: true })}
                  margin="normal"
                  fullWidth
                  id="reason"
                  name="reason"
                  placeholder="Reason for account deletion"
                  multiline
                  minRows={4}
                  error={formState.errors?.reason?.type === "required"}
                  helperText={
                    formState.errors?.reason?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      maxHeight: "none",
                      height: "auto",
                      alignItems: "flex-start",
                    },
                    "& .MuiInputBase-input": {
                      padding: "12px 14px",
                    },
                  }}
                />
                <LoadingButton
                  loading={loading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, width: 300 }}
                >
                  <Typography variant="h3">
                    <FormattedMessage id="deleteAccount.submit" />
                  </Typography>
                </LoadingButton>
              </form>
            )}
          </Box>
        </Card>
      </Box>
    </>
  );
}
