import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { usePutData } from "../../hooks/usePutData";
import { useDeleteData } from "../../hooks/useDeleteData";
import AssignVehicle from "../modals/AssignVehicle";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ViewImage from "../modals/ViewImage";
import LinkedDriver_Vehicles from "../modals/linkedDriver_Vehicles";
import { assigningOptions } from "../../constants/constant";
import WarningMessage from "../modals/warning_message";

export default function DriverMenuCell({ row, getData }) {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState();
  const [openAssigning, setOpenAssigning] = useState(false);
  const [openViewImage, setOpenViewImage] = useState(false);
  const [openViewTable, setOpenViewTable] = useState(false);
  const [OpenWarningDelete, setOpenWarningDelete] = useState(false);
  const [openApproveDeletion, setOpenApproveDeletion] = useState(false);

  const navigate = useNavigate();

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/driver/updateUser",
    {},
    null,
    "error"
  );

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/driver/${row?.row?.original?.id}`
  );

  const getDataAndCLosemenu = async () => {
    getData();
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        handleClose();
        getData();
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  useEffect(() => {
    if (resultEdit?.id) {
      getDataAndCLosemenu();
      // handleClose();
      // getData();
      handleClose();
    }
  }, [resultEdit]);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const assignVehicleModal = () => {
    setOpenViewTable(false);
    setOpenAssigning(true);
  };

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
      // status: row?.row?.original?.status === 1 ? 0 : 1,
      status: status,
      userId: row?.row?.original?.id,
    });
  };

  const onSubmitDelete = async () => {
    await deleteRow();
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
            navigate("/driverForm", {
              state: { id: row?.row?.original?.id, action: "viewData" },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="driver.viewDetails" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/driverForm", {
              state: { id: row?.row?.original?.id, action: "editData" },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="driver.edit" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenViewTable(true)}>
          <Typography variant="h4">
            <FormattedMessage id="driver.viewLinkedVehicles" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenAssigning(true)}>
          <Typography variant="h4">
            <FormattedMessage id="driver.assignVehicle" />
          </Typography>
        </MenuItem>

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
                  ? "providers.deactivate"
                  : "providers.activate"
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
          onClick={() => {
            setOpenWarningDelete(true);
          }}
        >
          <Typography variant="h4" color="error">
            <FormattedMessage id="driver.deleteDriver" />
          </Typography>
        </MenuItem>
      </Menu>
      <AssignVehicle
        open={openAssigning}
        handleClose={() => setOpenAssigning(false)}
        getData={getDataAndCLosemenu}
        row={row}
      />
      {console.log(row?.row?.original?.licenceImage,'preview image')}
      <ViewImage
        open={openViewImage}
        title={intl.formatMessage({
          id: "driver.license",
        })}
        subTitle={
          intl.formatMessage({
            id: "driver.driverName",
          }) +
          " : " +
          row?.row?.original?.name
        }
        handleClose={() => setOpenViewImage(false)}
        getData={getDataAndCLosemenu}
        row={row}
        image={row?.row?.original?.licenceImage}
      />
      <LinkedDriver_Vehicles
        open={openViewTable}
        handleClose={() => setOpenViewTable(false)}
        getData={getDataAndCLosemenu}
        row={row}
        assignAction={assignVehicleModal}
        screenType={assigningOptions.vehicle}

        // image={row?.row?.original?.licenceImage}
      />

      <WarningMessage
        open={OpenWarningDelete}
        handleClose={() => setOpenWarningDelete(false)}
        message={intl.formatMessage({
          id: "driver.confirmationDelete",
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
          await deleteRow();
          setOpenApproveDeletion(false);
        }}
      />
    </div>
  );
}
