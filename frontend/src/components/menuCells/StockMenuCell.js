import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDeleteData } from "../../hooks/useDeleteData";

import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";

export default function StockMenuCell({ row, getData }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const [deleteData, loadingDeleteStock, deleteStock] = useDeleteData(
    `/stock/${row?.row?.original?.product?._id}/warehouse/${row?.row?.original?._id}`
  );

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        handleClose();
        await getData();
      }
    };
    fetchData();
  }, [Object.keys(deleteData).length]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
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
            navigate("/stockRequests", {
              state: {
                id: row?.row?.original?.warehouseId,
              },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="stock.viewRequests" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={async () => {
            await deleteStock();
          }}
        >
          <Typography variant="h4" color="error">
            <FormattedMessage id="stock.clearStock" />
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
}
