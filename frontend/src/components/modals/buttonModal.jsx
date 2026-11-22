import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BasicModal from "./basicModal";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function ButtonModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <Box>
      {/* <Typography variant="h3">Button Modal</Typography> */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
      >
        <EditIcon
          sx={{
            fontSize: 20,
          }}
        />
      </Button>
      <BasicModal open={open} handleClose={handleClose}>
        <Typography variant="h2"> inside Modal</Typography>
      </BasicModal>
    </Box>
  );
}
