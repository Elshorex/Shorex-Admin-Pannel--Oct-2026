import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { usePutData } from "../../hooks/usePutData";
import { useDeleteData } from "../../hooks/useDeleteData";

import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import WarningMessage from "../modals/warning_message";

export default function WarehouseMenuCell({row,getData,handleOpenSKHistory}) {
  const intl = useIntl();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [OpenWarningDeleteWarehouse, setOpenWarningDeleteWarehouse] =useState(false);
  const [OpenWarningDeleteStore, setOpenWarningDeleteStore] = useState(false);
  const [openApproveDeletion, setOpenApproveDeletion] = useState(false);

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    `/warehouse/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const [deleteWarehouseData, loadingDeleteWarehouse, deleteWarehouse] =
    useDeleteData(`/warehouse/${row?.row?.original?.id}`);

  const [deleteStorekeeperData, loadingDeleteStorekeeper, deleteStorekeeper] =
    useDeleteData(`/warehouse/${row?.row?.original?.id}/store-keeper`);

  const storeKeeperId = row?.row?.original?.storeKeeper?.id;
  const [approveDeletionData, , approveDeletion] = useDeleteData(
    "/deleteAccount",
    storeKeeperId ? { userId: storeKeeperId } : null
  );

  useEffect(() => {
    const fetchData = async () => {
      if (
        Object.keys(deleteWarehouseData).length > 0 ||
        Object.keys(deleteStorekeeperData).length > 0 ||
        Object.keys(approveDeletionData).length > 0
      ) {
        handleClose();
        await getData();
      }
    };

    fetchData();
  }, [
    Object.keys(deleteWarehouseData).length,
    Object.keys(deleteStorekeeperData).length,
    Object.keys(approveDeletionData).length,
  ]);

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
      status: status,
    });
  };

  const onSubmitDelete = async () => {
    OpenWarningDeleteWarehouse && (await deleteWarehouse());
    OpenWarningDeleteStore && (await deleteStorekeeper());
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
        {row?.row?.original?.storeKeeper?.name && (
          <MenuItem
            onClick={() => {
              navigate("addWarehouse", {
                state: {
                  id: row?.row?.original?.id,
                  useId: row?.row?.original?.storeKeeper?.id,
                  action: "editData",
                },
              });
            }}
          >
            <Typography variant="h4">
              <FormattedMessage id="warehouse.edit" />
            </Typography>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            navigate("addWarehouse", {
              state: { id: row?.row?.original?.id, action: "viewData" },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="providers.viewDetails" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("addWarehouse", {
              state: {
                id: row?.row?.original?.id,
                action: "changeStoreKeeper",
              },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="warehouse.changeStoreKeeper" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleOpenSKHistory}>
          <Typography variant="h4">
            <FormattedMessage id="warehouse.viewStoreKeeperHistory" />
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate("/stockRequests", {
              state: {
                id: row?.row?.original?.id,
              },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewStock" />
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
                  ? "providers.deactivate"
                  : "providers.activate"
              }
            />
          </Typography>
        </MenuItem>

        {row?.row?.original?.storeKeeper?.deletionRequested && (
          <MenuItem onClick={() => setOpenApproveDeletion(true)}>
            <Typography variant="h4" color="error">
              <FormattedMessage id="deleteAccount.approveDeletion" />
            </Typography>
          </MenuItem>
        )}

        <MenuItem onClick={() => setOpenWarningDeleteWarehouse(true)}>
          <Typography variant="h4" color="error">
            <FormattedMessage id="warehouse.deleteWarehouse" />
          </Typography>
        </MenuItem>

        {row?.row?.original?.storeKeeper?.name && (
          <MenuItem
            onClick={() => {
              setOpenWarningDeleteStore(true);
            }}
          >
            <Typography variant="h4" color="error">
              <FormattedMessage id="warehouse.deleteStorekeeper" />
            </Typography>
          </MenuItem>
        )}
      </Menu>

      <WarningMessage
        open={OpenWarningDeleteWarehouse}
        handleClose={() => setOpenWarningDeleteWarehouse(false)}
        message={intl.formatMessage({
          id: "warehouse.confirmationDeleteWarehouse",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />

      <WarningMessage
        open={OpenWarningDeleteStore}
        handleClose={() => setOpenWarningDeleteStore(false)}
        message={intl.formatMessage({
          id: "warehouse.confirmationDeleteStore",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />

      <WarningMessage
        open={openApproveDeletion}
        handleClose={() => setOpenApproveDeletion(false)}
        message={intl.formatMessage({ id: "deleteAccount.confirmApprove" })}
        buttonName={intl.formatMessage({ id: "deleteAccount.approveDeletion" })}
        buttonFunction={async () => {
          await approveDeletion();
          setOpenApproveDeletion(false);
        }}
      />
    </div>
  );
}
