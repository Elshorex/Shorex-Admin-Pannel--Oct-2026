import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormattedMessage } from "react-intl";

export default function BasicModal({
  title,
  open,
  handleClose,
  children,
  width,
  left,
  right,
}) {
  const [scroll, setScroll] = React.useState("paper");

  const style = {
    // position: "absolute",
    // top: "50%",
    left: left || "30%",
    right: right || "30%",
    // transform: "translate(-50%, -50%)",
    width: width || "50%",
    height: "90%",
    // bgcolor: "background.paper",
    // boxShadow: 24,
    // p: 4,
  };
  return (
    // <Modal
    //   open={open}
    //   onClose={handleClose}
    //   aria-labelledby="modal-modal-title"
    //   aria-describedby="modal-modal-description"
    // >
    <Dialog open={open} onClose={handleClose} scroll="paper" sx={style}>
      <DialogTitle id="scroll-dialog-title" sx={{ p: 0 }}>
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", p: 0 }}
        >
          <Typography sx={{ ml: 2, flex: 1 }} variant="h2">
            {title}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </DialogTitle>
      <DialogContent dividers={scroll === "paper"}>{children}</DialogContent>
    </Dialog>
    // </Modal>
  );
}
