import React, { useState } from "react";
import { Typography, FormControl, TextField, Button, Box } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

import BasicModal from "./basicModal";
import MainTable from "../table";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningMessage from "./warning_message";
import { usePutData } from "../../hooks/usePutData";
import moment from "moment";
import { useEffect } from "react";
import { assigningOptions } from "../../constants/constant";

export default function LinkedDriver_Vehicles({
  open,
  handleClose,
  getData,
  row = {},
  assignAction,
  screenType,
}) {
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(
    screenType == assigningOptions.driver
      ? row.row.original?.drivers?.length
      : row.row.original?.vehicles?.length
  );
  const [rowData, setRowData] = useState({});
  const [openWarningUnassign, setOpenWarningUnassign] = useState(false);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);

  useEffect(() => {
    screenType == assigningOptions.driver
      ? setData(row.row.original.drivers ? row.row.original.drivers : [])
      : setData(row.row.original.vehicles ? row.row.original.vehicles : []);
  }, []);

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    `/driver/${row?.row?.original?.id}/unassign-vehicle`,
    {},
    null,
    "error"
  );

  const [resultUnlinkDriver, loadingUnlinkDriver, setUnlinkDriver] = usePutData(
    `/vehicle/${row?.row?.original?.id}/unlink-driver`,
    {},
    null,
    "error"
  );

  const onSubmit = async () => {
    screenType == assigningOptions.driver
      ? await setUnlinkDriver({
          targetDriver: rowData?.row?.original?.id,
        })
      : await setEditRequest({ vehicle: rowData?.row?.original?.vehicle?.id });
    setOpenWarningUnassign(false);
  };

  useEffect(() => {
    if (resultEdit?.id || resultUnlinkDriver?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit, resultUnlinkDriver]);

  const assignedVehicleColumns = React.useMemo(
    () => [
      {
        accessorKey: "vehicle.name",
        header: intl.formatMessage({ id: "driver.name" }),
      },
      {
        accessorKey: "vehicle.vehicleNumber",
        header: intl.formatMessage({ id: "driver.email" }),
      },
      {
        header: intl.formatMessage({ id: "driver.assigningDate" }),
        cell: (row) => {
          return (
            <>
              <Typography>
                {moment(row?.row?.original?.joinDate).format("Do MMM YY")}
              </Typography>
            </>
          );
        },
        id: "assigningDate",
      },
      {
        cell: (row) => {
          return (
            <>
              <Button
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenWarningUnassign(true);
                  setRowData(row);
                }}
              >
                <DeleteOutlineIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </Button>
            </>
          );
        },
        id: "action",
      },
    ],
    []
  );

  const assignedDriverColumns = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: intl.formatMessage({ id: "driver.vehicle" }),
      },
      {
        accessorKey: "email",
        header: intl.formatMessage({ id: "driver.vehicleNumber" }),
      },
      {
        header: intl.formatMessage({ id: "driver.assigningDate" }),
        cell: (row) => {
          return (
            <>
              <Typography>
                {moment(row?.row?.original?.startAt).format("Do MMM YY")}
              </Typography>
            </>
          );
        },
        id: "assigningDate",
      },
      {
        cell: (row) => {
          return (
            <>
              <Button
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenWarningUnassign(true);
                  setRowData(row);
                }}
              >
                <DeleteOutlineIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </Button>
            </>
          );
        },
        id: "action",
      },
    ],
    []
  );

  return (
    <>
      <BasicModal
        open={open}
        handleClose={handleClose}
        title={
          <Typography variant="h2">
            {screenType == assigningOptions.driver ? (
              <FormattedMessage id="vehicle.viewLinkedDrivers" />
            ) : (
              <FormattedMessage id="driver.viewLinkedVehicles" />
            )}
          </Typography>
        }
      >
        <FormControl variant="standard" sx={{ width: "100%", mb: 2 }} fullWidth>
          <TextField
            disabled={true}
            value={
              screenType == assigningOptions.driver
                ? intl.formatMessage({
                    id: "vehicle.vehicleName",
                  }) +
                  " : " +
                  row?.row?.original?.name
                : intl.formatMessage({
                    id: "driver.driverName",
                  }) +
                  " : " +
                  row?.row?.original?.name
            }
          />
        </FormControl>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pb: "24px",
          }}
        >
          <Typography variant="h2">
            {screenType == assigningOptions.driver ? (
              <FormattedMessage id="driver.drivers" />
            ) : (
              <FormattedMessage id="driver.vehicles" />
            )}
          </Typography>
          <Button variant="contained" onClick={assignAction}>
            <Typography variant="h3">
              <FormattedMessage id="driver.assign" />
            </Typography>
          </Button>
        </Box>
        <MainTable
          data={data ? data : []}
          totalCount={totalCount}
          columns={
            screenType == assigningOptions.driver
              ? assignedDriverColumns
              : assignedVehicleColumns
          }
          {...{ pageIndex, setPageIndex, pageSize, setPageSize }}
        />
        <Button
          variant="contained"
          sx={{ width: "100%", mt: 2 }}
          onClick={handleClose}
        >
          <Typography variant="h3">
            <FormattedMessage id="driver.back" />
          </Typography>
        </Button>
      </BasicModal>
      <WarningMessage
        open={openWarningUnassign}
        handleClose={() => setOpenWarningUnassign(false)}
        message={intl.formatMessage({
          id: "driver.ays",
        })}
        buttonName={intl.formatMessage({
          id: "driver.unassign",
        })}
        buttonFunction={onSubmit}
      />
    </>
  );
}
