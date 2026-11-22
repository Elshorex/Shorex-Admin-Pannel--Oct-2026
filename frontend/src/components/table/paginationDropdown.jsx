import React from "react";
import {
  Select,
  FormControl,
  Box,
  MenuItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

export default function PaginationDropdown({
  pageSize,
  setPageSize,
  setPageIndex,
}) {
  const DashboardFilters = [
    { name: "10", pageSize: 10 },
    { name: "20", pageSize: 20 },
    { name: "50", pageSize: 50 },
    { name: "75", pageSize: 75 },
    { name: "100", pageSize: 100 },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: "4px",
      }}
    >
      <Typography variant="label" sx={{ mt: "20px" }} color="#3E4140">
        <FormattedMessage id="warehouse.rowsPerPage" /> :
      </Typography>
      <FormControl
        sx={{
          minWidth: 70,
          height: 40,
          margin: "16px 5px",
          borderColor: "#B0D9C3",
          "& .css-6jq361-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root":
            {
              padding: "0px",
            },
          "& .css-1ofh13b-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root":
            {
              padding: "2px 8px",
              border: "none",
            },
        }}
      >
        <Select
          value={pageSize}
          defaultValue={pageSize}
          onChange={(e) => {
            setPageSize(e.target.value);
            setPageIndex(0);
            sessionStorage.setItem("pageSize", e.target.value);
          }}
          sx={{
            color: "#049A77",
            backgroundColor: "#ffffff",
            p: 2,
            border: "0.1px solid #B0D9C3",
            "& .css-zfkjlr-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              {
                padding: "0px",
              },
          }}
        >
          {DashboardFilters.map((item) => (
            <MenuItem key={item.pageSize} value={item.pageSize}>
              <ListItemText
                primary={item.name}
                sx={{
                  color: "#049A77",
                  borderColor:
                    pageSize === item.pageSize ? "#049A77" : "transparent",
                  marginTop: "5px",
                }}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
