import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { usePutData } from "../../hooks/usePutData";
import { useDeleteData } from "../../hooks/useDeleteData";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ViewImage from "../modals/ViewImage";
import SpecialPoints from "../modals/specialPoints";
import WarningMessage from "../modals/warning_message";

export default function CustomerMenuCell({ row, getData }) {
  const intl = useIntl();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [openViewImage, setOpenViewImage] = useState(false);
  const [openSpecialPoints, setSpecialPoints] = useState(false);
  const [openApproveDeletion, setOpenApproveDeletion] = useState(false);

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/customer/updateUser",
    {},
    null,
    "error"
  );

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/customer/${row?.row?.original?.id}`
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

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit, getData]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleActive = () => {
    let status =  row?.row?.original?.status
    if(status === 1){
      status = 0
    }else if(status === 0){
      status = 1
    }else if(status === null){
      status = 1
    }
    setEditRequest({
      status: row?.row?.original?.status === 1 ? 0 : 1,
      userId: row?.row?.original?.id,
    });
  };

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
            navigate("/ViewCustomerDetails", {
              state: { customerId: row?.row?.original?.id },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="driver.viewDetails" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/editCustomer", {
              state: { customerId: row?.row?.original?.id,action:'edit' },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="driver.edit" />
          </Typography>
        </MenuItem>

        {/* <MenuItem
          onClick={() =>
            navigate(`/stockRequests`, {
              state: { customerId: row?.row?.original?.id },
            })
          }
        >
          <Typography variant="h4">
            <FormattedMessage id="customer.viewRequests" />
          </Typography>
        </MenuItem> */}

        {/* <MenuItem onClick={() => setSpecialPoints(true)}>
          <Typography variant="h4">
            <FormattedMessage id="customer.specialPoints" />
          </Typography>
        </MenuItem> */}

        <MenuItem onClick={() => setOpenViewImage(true)}>
          <Typography variant="h4">
            <FormattedMessage id="customer.viewLicense" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleActive} disabled={loadingEdit}>
          <Typography
            variant="h4"
            color={row?.row?.original?.status === 1 ? "error" : "#00B887"}
          >
            <FormattedMessage
              id={
                row?.row?.original?.status === 1
                  ? "customer.deactivateCustomer"
                  : "customer.activateCustomer"
              }
            />
          </Typography>
        </MenuItem>

        {row?.row?.original?.deletionRequested && (
          <MenuItem onClick={() => setOpenApproveDeletion(true)}>
            <Typography variant="h4" color="error">
              <FormattedMessage id="deleteAccount.approveDeletion" />
            </Typography>
          </MenuItem>
        )}

        <MenuItem
          onClick={async () => {
            await deleteRow();
          }}
        >
          <Typography variant="h4" color="error">
            <FormattedMessage id="customer.deleteCustomer" />
          </Typography>
        </MenuItem>
      </Menu>

      <ViewImage
        open={openViewImage}
        title={intl.formatMessage({
          id: "driver.license",
        })}
        subTitle={
          intl.formatMessage({
            id: "stock.customerName",
          }) +
          " : " +
          row?.row?.original?.name
        }
        handleClose={() => setOpenViewImage(false)}
        getData={getData}
        row={row}
        image={row?.row?.original?.licenceImage}
      />

      <SpecialPoints
        open={openSpecialPoints}
        title={intl.formatMessage({
          id: "customer.specialPoints",
        })}
        handleClose={() => setSpecialPoints(false)}
        getData={getData}
        row={row}
      />

      <WarningMessage
        open={openApproveDeletion}
        handleClose={() => setOpenApproveDeletion(false)}
        message={intl.formatMessage({ id: "deleteAccount.confirmApprove" })}
        buttonName={intl.formatMessage({ id: "deleteAccount.approveDeletion" })}
        buttonFunction={async () => {
          await deleteRow();
          setOpenApproveDeletion(false);
        }}
      />
    </div>
  );
}
