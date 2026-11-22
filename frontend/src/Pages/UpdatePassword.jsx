import { React, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import CollapseItem from "../components/CollapseItem";
import loginLogo from "../assets/svgs/loginLogo.png";
import { Card, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { usePostData } from "../hooks/usePostData";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { register, handleSubmit, formState } = useForm({
    mode: "onSubmit",
  });

  const [resultEdit, loadingEdit, setEditRequest] = usePostData(
    "/forgetPassword",
    {},
    intl.formatMessage({ id: "forgetPassword.pleaseCheckEmail" }),
    "error"
  );

  const [submittedEmail, setSubmittedEmail] = useState("");

  const onSubmit = async (data) => {
    const email = data.email.trim().toLowerCase();
    setSubmittedEmail(email);
    setEditRequest({
      email,
      type: "ADMIN",
    });
  };

  useEffect(() => {
    if (resultEdit?.message && submittedEmail) {
      navigate("/forgetPassword", {
        state: { email: submittedEmail },
      });
    }
  }, [resultEdit, submittedEmail, navigate]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to bottom, #049A77 50%, #F2F3F2 50%)",
          height: "100vh",
        }}
      >
        <Card component="main" sx={{ width: 600, heigh: 600, pb: "50px" }}>
          <Box
            sx={{
              marginTop: 8,
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
                my: 5,
              }}
            >
              <Typography variant="h2">
                <FormattedMessage id="forgetPassword.updatePassword" />
              </Typography>
              <Typography variant="h3" sx={{ color: "#0F6BD2" }}>
                <FormattedMessage id="forgetPassword.verifyEmailMessage" />
              </Typography>
            </Box>
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: "80%" }}>
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
                name="email"
                autoComplete="email"
                autoFocus
                error={formState.errors?.email?.type === "required"}
                helperText={
                  formState.errors?.email?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, px: 3 }}
                disabled={loadingEdit}
              >
                <FormattedMessage id="forgetPassword.next" />
              </Button>
            </form>
          </Box>
        </Card>
      </Box>
    </>
  );
}
