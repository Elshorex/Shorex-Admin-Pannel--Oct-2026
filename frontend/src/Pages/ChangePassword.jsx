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

import { usePutData } from "../hooks/usePutData";

import CollapseItem from "../components/CollapseItem";
import loginLogo from "../assets/svgs/loginLogo.png";
import PublicNavbar from "../components/publicNavbar";
import { logout, useAuthDispatch } from "../context";

export default function ChangePassword() {
  const [err, setErr] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAuthDispatch(); // read dispatch method from context
  const intl = useIntl();

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onSubmit",
  });

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/user/changepassword",
    {},
    intl.formatMessage({ id: "forgetPassword.updatePasswordSuccess" }),
    "error"
  );

  const onSubmit = async (data) => {
    setEditRequest(data);
  };

  useEffect(() => {
    if (resultEdit?.user?.id) {
      logout(dispatch); //call the logout action
      navigate("/login");
    }
  }, [resultEdit?.user?.id]);

  return (
    <>
      <PublicNavbar />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          mt: "60px",
          background: "linear-gradient(to bottom, #049A77 50%, #D5DDDB 50%)",
        }}
      >
        <Card component="main" sx={{ width: 600, height: 600, pb: "50px" }}>
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.currentPassword" />
                </Typography>
                <TextField
                  {...register("currentPassword", {
                    required: intl.formatMessage({ id: "error.requiredField" }),
                  })}
                  margin="normal"
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoFocus
                  error={Boolean(errors.currentPassword)}
                  helperText={errors.currentPassword?.message}
                />

                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.passwordRequirements" />
                </Typography>

                <List>
                  <ListItemText
                    primary={
                      <Typography variant="h4">
                        - <FormattedMessage id="forgetPassword.min8Char" />
                      </Typography>
                    }
                  />
                  <ListItemText
                    primary={
                      <Typography variant="h4">
                        - <FormattedMessage id="forgetPassword.1upperLetter" />
                      </Typography>
                    }
                  />
                  <ListItemText
                    primary={
                      <Typography variant="h4">
                        - <FormattedMessage id="forgetPassword.1LowerLetter" />
                      </Typography>
                    }
                  />
                  <ListItemText
                    primary={
                      <Typography variant="h4">
                        - <FormattedMessage id="forgetPassword.1Number" />
                      </Typography>
                    }
                  />
                  <ListItemText
                    primary={
                      <Typography variant="h4">
                        - <FormattedMessage id="forgetPassword.1specialChar" />
                      </Typography>
                    }
                  />
                </List>

                <Typography variant="h3">
                  <FormattedMessage id="forgetPassword.newPassword" />
                </Typography>
                <TextField
                  {...register("newPassword", {
                    required: intl.formatMessage({ id: "error.requiredField" }),
                    minLength: {
                      value: 8,
                      message: intl.formatMessage({ id: "error.minLength" }),
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                      message: intl.formatMessage({
                        id: "error.passwordRequirements",
                      }),
                    },
                  })}
                  margin="normal"
                  fullWidth
                  name="newPassword"
                  type="password"
                  id="newPassword"
                  error={Boolean(errors.newPassword)}
                  helperText={errors.newPassword?.message}
                />

                <LoadingButton
                  loading={loading || loadingEdit}
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
            {err && <CollapseItem err={err} />}
          </Box>
        </Card>
      </Box>
    </>
  );
}
