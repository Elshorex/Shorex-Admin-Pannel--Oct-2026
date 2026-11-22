import { Typography } from "@mui/material";

export default function Required() {
  return (
    <Typography color="error" variant="h3" sx={{ mx: "5px" }}>
      *
    </Typography>
  );
}
