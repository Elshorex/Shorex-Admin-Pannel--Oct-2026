import React, { useEffect, useState } from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";

import { usePutData } from "../../hooks/usePutData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { assigningOptions } from "../../constants/constant";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";

export default function AssignVehicle({
  open,
  handleClose,
  getData,
  row = {},
  screenType,
}) {
  const intl = useIntl();

  const [fetchedVehicle, loadingVehicle, getDataVehicle] = useFetchedData(
    "/vehicle?removeLanguage=true",
    false
  );

  const [fetchedDrivers, loadingDrivers, getDataDrivers] = useFetchedData(
    "/driver?removeLanguage=true",
    false
  );
  useEffect(() => {
    open && getDataVehicle();
    open && getDataDrivers();
  }, [open]);

  const [resultAssignVehicle, loadingAssignVehicle, SetRequestAssignVehicle] =
    usePutData(
      `driver/${row?.row?.original?.id}/assign-vehicle`,
      {},
      null,
      intl.formatMessage({
        id: "vehicle.unActiveMsg",
      })
    );

  const [resultAssignDriver, loadingAssignDriver, SetRequestAssignDriver] =
    usePutData(
      `vehicle/${row?.row?.original?.id}/link-driver`,
      {},
      null,
      "Already exist"
    );

  const { register, handleSubmit, reset, formState } = useForm();
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({}); // State to store selected checkboxes
  const [currentOptions, setCurrentOptions] = useState(
    screenType == assigningOptions.driver ? fetchedDrivers : fetchedVehicle
  );

  useEffect(() => {
    setCurrentOptions(
      screenType == assigningOptions.driver ? fetchedDrivers : fetchedVehicle
    );
  }, [fetchedDrivers, fetchedVehicle]);

  const onSubmit = async (data) => {
    if (Object.keys(selectedCheckboxes) != 0) {
      const selectedValues = Object.entries(selectedCheckboxes)
        .filter(([key, value]) => value)
        .map(([key, value]) => Number(key));
     
  const body =
      screenType == assigningOptions.driver ? { targetDriver: selectedValues[0]} : { vehicle: selectedValues.map((number) => ({ vehicle: number })) };
      screenType == assigningOptions.driver ? await SetRequestAssignDriver(body) : await SetRequestAssignVehicle(body);
      onCancel();
    } else {
      toast.error(intl.formatMessage({ id: "error.requiredOneDay" }));
    }
  };

   const handleCheckboxChange = (value) => {
      setSelectedCheckboxes({ [value]: true }); // reset all others
    };


  const onCancel = () => {
    setSelectedCheckboxes({});
    handleClose();
  };

  useEffect(() => {
    if (resultAssignDriver?.id || resultAssignVehicle?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultAssignDriver, resultAssignVehicle]);

  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.row?.original?.updatedAt]);

      const driverId = row?.row?.original?.id;

      const filteredVehicles = (fetchedVehicle?.data?.data || []).filter(v => {
        console.log(driverId,'driverId')
      const isActive = v.status === 1; // or whatever your ACTIVE code is
      const isUnassigned = !v.drivers[0]?.id;
      const isAssignedToThisDriver = v.drivers[0]?.id === driverId;

      if (!isActive) return false;

      // Show if free or assigned to same driver
      if (isUnassigned || isAssignedToThisDriver) return true;

      // Hide if assigned to other driver
      return false;
    });


  return (
    <>
      <BasicModal
        open={open}
        handleClose={onCancel}
        title={
          <Typography variant="h3">
            {screenType == assigningOptions.driver ? (
              <FormattedMessage id="vehicle.assignDriver" />
            ) : (
              <FormattedMessage id="driver.assignVehicle" />
            )}
          </Typography>
        }
      >
        {(loadingVehicle || loadingDrivers) && <CircularProgress />}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* <FormGroup>
            {currentOptions?.data?.data?.length > 0 &&
              currentOptions?.data?.data?.map((day) => {
                return (
                  <FormControlLabel
                    key={day.id}
                    control={
                      <Checkbox
                        checked={selectedCheckboxes[day.id] || false} // Set checked state
                        onChange={() => handleCheckboxChange(day.id)} // Toggle checkbox
                      />
                    }
                    label={day.name}
                    {...register("data")}
                  />
                );
              })}
          </FormGroup> */}
          <FormGroup>
            {filteredVehicles.map(vehicle => {
              const isAssignedToThisDriver = vehicle.drivers[0]?.id === driverId;
              return (
                <FormControlLabel
                  key={vehicle.id}
                  control={
                    <Checkbox
                      checked={selectedCheckboxes[vehicle.id] || false}
                      onChange={() => handleCheckboxChange(vehicle.id)}
                      disabled={isAssignedToThisDriver}  // Condition #3
                    />
                  }
                  label={
                    isAssignedToThisDriver ? (
                      <Typography color="gray">
                        {vehicle.name} (Already assigned)
                      </Typography>
                    ) : (
                      vehicle.name
                    )
                  }
                />
              );
            })}
          </FormGroup>

          <Box sx={{ display: "flex", flex: "col" }}>
            <LoadingButton
              loading={loadingAssignVehicle || loadingAssignDriver}
              sx={{ m: 3, px: 2 }}
              variant="contained"
              startIcon={<PublicIcon sx={{ mx: "4px" }} />}
              type="submit"
            >
              <Typography variant="h3">
                <FormattedMessage id="driver.assign" />
              </Typography>
            </LoadingButton>
            <Button
              sx={{ m: 3, px: 2 }}
              variant="outlined"
              onClick={handleClose}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.cancel" />
              </Typography>
            </Button>
          </Box>
        </form>
      </BasicModal>
    </>
  );
}
