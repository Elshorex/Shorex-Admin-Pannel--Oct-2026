import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { usePutData } from "../../hooks/usePutData";
import { FormattedMessage } from "react-intl";

export default function ProviderMenuCell({ row, handleOpenEdit, handleOpenView, getData }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    `/provider/updateUser`,
    {},
    null,
    "error"
  );

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit, getData]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleActive = () => {
    setEditRequest({
      userId: row?.row?.original?.id,
      status: row?.row?.original?.status?.id === 1 ? 2 : 1,
    });
  };

  return (
    <div>
      <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleOpenEdit();
            handleClose();
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="providers.edit" />
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenView();
            handleClose();
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="providers.viewDetails" />
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleActive}
          disabled={loadingEdit}
        >
          <Typography variant="h4">
            <FormattedMessage id={row?.row?.original?.status?.id === 1 ? "providers.deactivate" : "providers.activate"} />
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
