import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useDeleteData } from "../../hooks/useDeleteData";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WarningMessage from "../modals/warning_message";

export default function RequestsMenuCell({
  row,
  getData,
  deleteAction = true,
}) {
  const intl = useIntl();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [OpenWarningDelete, setOpenWarningDelete] = useState(false);

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/request/${row?.row?.original?.id}`
  );

  const onSubmitDelete = async () => {
    await deleteRow();
  };

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
          onClick={() =>
            navigate(`/ViewRequestDetails`, {
              state: { requestId: row?.row?.original?.id },
            })
          }
        >
          <Typography variant="h4">
            <FormattedMessage id="warehouse.viewDetails" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/ViewCustomerDetails", {
              state: { customerId: row?.row?.original?.customer?.id },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="requestsManagement.viewCustomerDetails" />
          </Typography>
        </MenuItem>
        {deleteAction && (
          <MenuItem
            onClick={() => {
              setOpenWarningDelete(true);
            }}
          >
            <Typography variant="h4" color="error">
              <FormattedMessage id="requestsManagement.deleteRequest" />
            </Typography>
          </MenuItem>
        )}
      </Menu>

      <WarningMessage
        open={OpenWarningDelete}
        handleClose={() => setOpenWarningDelete(false)}
        message={intl.formatMessage({
          id: "requestsManagement.confirmationDelete",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />
    </div>
  );
}
