import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  styled,
  alpha,
  InputBase,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

export default function BasicInput({
  label,
  defaultValue,
  register,
  type,
  errorRequired,
  disable = false,
  sx,
}) {
  return (
    <>
      <Typography variant="h3" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <TextField
        register
        // margin="normal"
        fullWidth
        // id="email"
        disable={disable}
        id={type}
        placeholder={type}
        name={type}
        autoComplete={type}
        autoFocus
        // defaultValue="shorex@gmail.com"
        defaultValue={defaultValue}
        // error={formState.errors?.email?.type === "required"}
        error={errorRequired === "required"}
        helperText={errorRequired === "required" &&<FormattedMessage id="error.requiredField" />}
        sx={sx}
      />
    </>
  );
}

const BasicInputComponent = styled(TextField)(({ theme }) => ({
  "label + &": {
    marginTop: "24px",
  },
  "& .MuiInputBase-input": {
    fontFamily: `var(--font-500)`,
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: "0.16px",
    borderRadius: 4,
    position: "relative",
    border: "1px solid",
    borderColor: theme.palette.mode === "light" ? "#E0E3E7" : "#2D3843",
    // fontSize: 16,
    // width: "240px",
    padding: "10px 12px",
    marginBottom: "12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));
