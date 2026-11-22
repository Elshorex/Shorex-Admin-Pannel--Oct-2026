import { React, useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  TextField,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { useAuthDispatch, loginUser } from "../context";
import { useLanguage } from "../hooks/useLanguage";
import PublicNavbar from "../components/publicNavbar";

import loginLogo from "../assets/svgs/loginLogo.png";

export default function Login() {
  const navigate = useNavigate();
  const { locale } = useLanguage();

  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm({
    mode: "onSubmit",
  });

  const dispatch = useAuthDispatch();

  const onSubmit = async (data) => {
    let payload = { email: data.email, password: data.password, type: "ADMIN" };
    try {
      setLoading(true);
      const response = await loginUser(dispatch, payload, locale);
      if (response) {
        navigate("/dashboard", { replace: true });
      } else {
        reset();
      }
    } catch (err) {
      reset();
    }
    setLoading(false);
  };

  return (
    <>
      <PublicNavbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // mb: "32px",
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h3">
                <FormattedMessage id="login.email" />
              </Typography>
              <TextField
                {...register("email", {
                  required: true,
                })}
                margin="normal"
                fullWidth
                id="email"
                placeholder="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                // defaultValue="shorex@gmail.com"
                error={formState.errors?.email?.type === "required"}
                helperText={
                  formState.errors?.email?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
              <Typography variant="h3">
                <FormattedMessage id="login.password" />
              </Typography>
              <TextField
                {...register("password", {
                  required: true,
                })}
                margin="normal"
                fullWidth
                name="password"
                placeholder="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                // defaultValue="12345678"
                error={formState.errors?.password?.type === "required"}
                helperText={
                  formState.errors?.password?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label={
                    <Typography variant="h3">
                      <FormattedMessage id="login.rememberMe" />
                    </Typography>
                  }
                />
                <Link to="/updatePassword" sx={{ color: "primary.main" }}>
                  <Typography variant="h3">
                    <FormattedMessage id="login.forgetPassword" />
                  </Typography>
                </Link>
              </Box>
              <LoadingButton
                loading={loading}
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, width: 400 }}
              >
                <Typography variant="h3">
                  <FormattedMessage id="login.login" />
                </Typography>
              </LoadingButton>
            </form>
          </Box>
        </Card>
      </Box>
    </>
  );
}
