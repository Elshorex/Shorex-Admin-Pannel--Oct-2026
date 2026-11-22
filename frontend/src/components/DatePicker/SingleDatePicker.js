import * as React from "react";
import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Box } from "@mui/material";

export default function SingleDatePicker({
  setValue,
  disabledState,
  watch,
  param,
  disablePastDates = false,
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          "& .css-z3c6am-MuiFormControl-root-MuiTextField-root": {
            width: "100%",
            overflow: "hidden",
          },
          "& .css-1jkn16n-MuiInputBase-root-MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "rgba(0, 0, 0, 0.23)",
            },
        }}
      >
        <DemoContainer components={["DatePicker"]}>
          <DatePicker
            format="YYYY-MM-DD"
            value={watch(param) ? dayjs(watch(param), "YYYY-MM-DD") : null}
            onChange={(newValue) =>
              setValue(param, newValue ? newValue.format("YYYY-MM-DD") : null)
            }
            disabled={disabledState}
            disablePast={disablePastDates}
          />
        </DemoContainer>
      </Box>
    </LocalizationProvider>
  );
}
