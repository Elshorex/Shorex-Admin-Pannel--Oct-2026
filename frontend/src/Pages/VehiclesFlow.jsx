import React, { useEffect } from "react";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import { FormattedMessage } from "react-intl";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePostData } from "../hooks/usePostData";
import { useFetchedData } from "../hooks/useFetchedData";
import { usePutData } from "../hooks/usePutData";
import VehiclesFlow from "../components/VehicleForm";
import { removeEmptyParameters } from "../components/utils/Helper";
import { LoadingButton } from "@mui/lab";
import { useLanguage } from "../hooks/useLanguage";

export default function VehicleFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, action } = location?.state || {};
  const form = useForm();
  const { locale } = useLanguage();

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "/vehicle",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/vehicle/${id}`,
    {},
    null,
    "error"
  );

  const [fetchedVehicle, loadingFetchedVehicle, getDataVehicle] =
    useFetchedData(
      `/vehicle/${id}`,
      false //for no in first render
    );

  useEffect(() => {
    if (id) {
      getDataVehicle();
    }
  }, [id]);

  const onSubmit = async (data) => {
    data = removeEmptyParameters(data);
    action === "editData"
      ? await SetEditRequest({ ...data })
      : await SetAddRequest({ ...data, status: 1, docs: [data.docs] });
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      navigate("/vehicle");
    }
  }, [resultAdd, navigate, resultEdit]);

  return (
    <Box
      sx={{
        p: 2,
      }}
    >
      <Box sx={{ display: "flex" }}>
        <Link to="/vehicle">
          <ArrowBackIosIcon
            fontSize="12px"
            sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
          />
        </Link>
        <Typography variant="h2">
          {action === "editData" ? (
            <FormattedMessage id="warehouse.edit" />
          ) : action == "viewData" ? (
            <FormattedMessage id="driver.viewDetails" />
          ) : (
            <FormattedMessage id="vehicle.addNew" />
          )}{" "}
          <FormattedMessage id="driver.vehicles" />
        </Typography>
      </Box>

      <Box
        sx={{
          border: 1,
          p: 2,
          mt: 2,
          borderRadius: 1,
          borderColor: "#646866",
          borderStyle: "dashed",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            <FormattedMessage id="vehicle.vehicleInfo" />
            {loadingFetchedVehicle && <CircularProgress />}
          </Typography>

          <Button
            sx={{ m: 1, px: 2 }}
            variant="contained"
            onClick={() =>
              navigate("/VehiclesFlow", {
              state: { id: id, action: "editData" },
            })
            }
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.edit" />
            </Typography>
          </Button>
        </Box>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <VehiclesFlow
            form={form}
            row={fetchedVehicle?.data}
            action={action}
          />

          {action !== "viewData" && (
            <Box sx={{ display: "flex", flex: "col" }}>
              <LoadingButton
                loading={loadingAdd || loadingEdit}
                sx={{ m: 1, px: 2 }}
                variant="contained"
                type="submit"
              >
                {action === "editData" ? (
                  <Typography variant="h3">
                    <FormattedMessage id="warehouse.save" />
                  </Typography>
                ) : (
                  <Typography variant="h3">
                    <FormattedMessage id="warehouse.create" />
                  </Typography>
                )}
              </LoadingButton>
              <Button
                sx={{ m: 1, px: 1 }}
                variant="outlined"
                onClick={() => navigate("/vehicle")}
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
