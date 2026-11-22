import React, { useEffect } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import { FormattedMessage } from "react-intl";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { usePostData } from "../hooks/usePostData";
import DriverForm from "../components/DriverForm";
import { useFetchedData } from "../hooks/useFetchedData";
import { usePutData } from "../hooks/usePutData";
import { removeEmptyParameters } from "../components/utils/Helper";
import { useLanguage } from "../hooks/useLanguage";
import WarningMessage from "../components/modals/warning_message";

export default function DriverFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, action } = location?.state || {};
  const form = useForm();
  const { locale } = useLanguage();

  const [conflictMessage, setConflictMessage] = React.useState(null);
  const [newDriver, setNewDriver] = React.useState(null);
  const [oldDrivers, setOldDrivers] = React.useState([]);
  const [openConflictModal, setOpenConflictModal] = React.useState(false);

  const [resultAdd, , SetAddRequest] = usePostData(
    "/driver/addUser",
    {},
    null,
    "error"
  );

  const [resultEdit, , SetEditRequest] = usePutData(
    "/driver/updateUser",
    {},
    null,
    "error"
  );

  const [fetchedDriver, loadingFetchedDriver, getDataDriver] = useFetchedData(
    `/driver/userInfo?userId=${id}`,
    false
  );

  useEffect(() => {
    if (id) {
      getDataDriver();
    }
  }, [id]);

  const onSubmit = async (data) => {
    if (action === "editData") {
      if (!data.password) delete data.password;
      if (!data.licenceImage) delete data.licenceImage;
      if (!data.idImage) delete data.idImage;
    }

    if (action !== "editData") {
      data = removeEmptyParameters(data);
    }

    if (action === "editData") {
      await SetEditRequest({ ...data, userId: id });
    } else {
      await SetAddRequest(data);
    }
  };


  useEffect(() => {
    if (!resultEdit) return;

    if (resultEdit.message) {
      // conflict occurred
      setConflictMessage(resultEdit.message);
      setNewDriver(resultEdit.user); // new driver returned by backend
      setOldDrivers(resultEdit.oldDrivers || []); // previously active drivers
      setOpenConflictModal(true);
      return;
    }

    if (resultEdit.user?.id) {
      navigate("/driver");
    }
  }, [resultEdit]);

  useEffect(() => {
    if (!resultAdd) return;

    if (resultAdd.message) {
      // conflict occurred
      setConflictMessage(resultAdd.message);
      setNewDriver(resultAdd.user); // new driver returned by backend
      setOldDrivers(resultAdd.oldDrivers || []); // previously active drivers
      setOpenConflictModal(true);
      return;
    }

    if (resultAdd.user?.id) {
      navigate("/driver");
    }
  }, [resultAdd]);

  const activateNewDriver = async () => {

    console.log(oldDrivers,'old driver')
    console.log(newDriver,'old newDriver')
    try {
      // Deactivate old drivers FIRST
      for (let oldD of oldDrivers) {
        await SetEditRequest({
          userId: oldD._id,
          status: 0
        });
      }

      // Activate the new driver
      await SetEditRequest({
        userId: newDriver.id,
        status: 1
      });

      setOpenConflictModal(false);
      navigate("/driver");
    } catch (err) {
      console.error("Activation error:", err);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      
      {openConflictModal && (
        <WarningMessage
          open={openConflictModal}
          handleClose={async () => {
              await SetEditRequest({
              userId: newDriver.id,
              status: 0
            });
             navigate("/driver");
             setOpenConflictModal(false);
          }}
          message={conflictMessage}
          buttonName="Activate"
          buttonFunction={activateNewDriver}
          secondButtonName="No"
          secondButtonFunction={async () =>  {
             await SetEditRequest({
              userId: newDriver.id,
              status: 0
            });
             navigate("/driver")
             setOpenConflictModal(false)
          }}
        />
      )}

      <Box sx={{ display: "flex" }}>
        <Link to="/driver">
          <ArrowBackIosIcon
            fontSize="12px"
            sx={{ mt: "4px", mx: 1, scale: locale === "ar" && "-1" }}
          />
        </Link>
        <Typography variant="h2">
          {action === "editData" ? (
            <FormattedMessage id="warehouse.edit" />
          ) : action === "viewData" ? (
            <FormattedMessage id="driver.viewDetails" />
          ) : (
            <FormattedMessage id="warehouse.create" />
          )}
          <FormattedMessage id="driver.drivers" />
        </Typography>
      </Box>

      <Box
        sx={{
          border: 1,
          p: 2,
          mt: 2,
          borderRadius: 1,
          borderColor: "#646866",
          borderStyle: "dashed"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            <FormattedMessage id="driver.driverInfo" />
            {loadingFetchedDriver && <CircularProgress />}
          </Typography>

          {action === "viewData" && (
            <Button
              sx={{ m: 1, px: 2 }}
              variant="contained"
              onClick={() =>
                navigate("/driverForm", {
                  state: { id: id, action: "editData" }
                })
              }
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            </Button>
          )}
        </Box>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DriverForm form={form} row={fetchedDriver?.data?.user} action={action} />

          {action !== "viewData" && (
            <Box sx={{ display: "flex" }}>
              <Button sx={{ m: 1, px: 2 }} variant="contained" type="submit">
                {action === "editData" ? (
                  <Typography variant="h3">
                    <FormattedMessage id="warehouse.save" />
                  </Typography>
                ) : (
                  <Typography variant="h3">
                    <FormattedMessage id="warehouse.create" />
                  </Typography>
                )}
              </Button>
              <Button
                sx={{ m: 1, px: 1 }}
                variant="outlined"
                onClick={() => navigate("/driver")}
              >
                <Typography variant="h3">
                  <FormattedMessage id="warehouse.cancel" />
                </Typography>
              </Button>
            </Box>
          )}
        </form>
      </Box>
    </Box>
  );
}
