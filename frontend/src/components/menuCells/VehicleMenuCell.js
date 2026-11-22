import React, { useEffect, useState } from "react";
import { MenuItem, Menu, IconButton, Typography } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { usePutData } from "../../hooks/usePutData";
import { useDeleteData } from "../../hooks/useDeleteData";

import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import AssignVehicle from "../modals/AssignVehicle";
import ViewImage from "../modals/ViewImage";
import StoreKeeperHistory from "../modals/storeKeeperHistory";
import LinkedDriver_Vehicles from "../modals/linkedDriver_Vehicles";
import { assigningOptions } from "../../constants/constant";
import WarningMessage from "../modals/warning_message";

export default function VehicleMenuCell({ row, getData }) {
  const intl = useIntl();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAssigning, setOpenAssigning] = useState(false);
  const [openViewImage, setOpenViewImage] = useState(false);
  const [openViewAssignTable, setOpenViewAssignTable] = useState(false);
  const [openDriverHistory, setOpenDriverHistory] = useState(false);
  const [OpenWarningDelete, setOpenWarningDelete] = useState(false);

  const navigate = useNavigate();

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    `/vehicle/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const [deleteData, loadingDeleteVehicle, deleteVehicle] = useDeleteData(
    `/vehicle/${row?.row?.original?.id}`
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
    });
  };

  const assignDriverModal = () => {
    setOpenViewAssignTable(false);
    setOpenAssigning(true);
  };

  const onSubmitDelete = async () => {
    await deleteVehicle();
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
            navigate("/VehiclesFlow", {
              state: { id: row?.row?.original?.id, action: "viewData" },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewDetails" />
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/VehiclesFlow", {
              state: { id: row?.row?.original?.id, action: "editData" },
            });
          }}
        >
          <Typography variant="h4">
            <FormattedMessage id="vehicle.edit" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenViewAssignTable(true)}>
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewLinkedDrivers" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenAssigning(true)}>
          <Typography variant="h4">
            <FormattedMessage id="vehicle.assignDriver" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => navigate("/stock")}>
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewStock" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenDriverHistory(true)}>
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewDriversHistory" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={() => setOpenViewImage(true)}>
          <Typography variant="h4">
            <FormattedMessage id="vehicle.viewRegistrationDocs" />
          </Typography>
        </MenuItem>

        <MenuItem onClick={handleActive} disabled={loadingEdit}>
          <Typography
            variant="h4"
            color={row?.row?.original?.status=== 1 ? "error" : "#00B887"}
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

        <MenuItem
          onClick={async () => {
            setOpenWarningDelete(true);
          }}
        >
          <Typography variant="h4" color="error">
            <FormattedMessage id="vehicle.deleteVehicle" />
          </Typography>
        </MenuItem>
      </Menu>
      <AssignVehicle
        open={openAssigning}
        handleClose={() => setOpenAssigning(false)}
        getData={getData}
        row={row}
        screenType={assigningOptions.driver}
      />
      <ViewImage
        open={openViewImage}
        title={intl.formatMessage({
          id: "vehicle.viewRegistrationDocs",
        })}
        subTitle={
          intl.formatMessage({
            id: "vehicle.vehicleName",
          }) +
          " : " +
          row?.row?.original?.name
        }
        handleClose={() => setOpenViewImage(false)}
        getData={getData}
        row={row}
        image={row?.row?.original?.docs[0]}
      />

      <StoreKeeperHistory
        open={openDriverHistory}
        handleClose={() => setOpenDriverHistory(false)}
        row={row}
        flag="DriverHistory"
      />

      <LinkedDriver_Vehicles
        open={openViewAssignTable}
        handleClose={() => setOpenViewAssignTable(false)}
        getData={getData}
        row={row}
        screenType={assigningOptions.driver}
        assignAction={assignDriverModal}
        // image={row?.row?.original?.licenceImage}
      />

      <WarningMessage
        open={OpenWarningDelete}
        handleClose={() => setOpenWarningDelete(false)}
        message={intl.formatMessage({
          id: "vehicle.confirmationDeleteVehicle",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />
    </div>
  );
}
