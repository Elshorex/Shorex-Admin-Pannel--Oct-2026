import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  TextField,
  TextareaAutosize,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import Required from "../components/required";
import UploadFlag from "./UploadFlag";

export default function VehiclesFlow({ form, row, action }) {
  const { register, getValues, formState, watch, setValue } = form;
  const [imgLoading, setImgLoading] = useState();
  const disabledState = action == "viewData" ? true : false;

  useEffect(() => {
    if (row) {
      setValue("name", row.name || "");
      setValue("vehicleNumber", row.vehicleNumber || "");
      setValue("trademark", row.trademark || "");
      setValue("chassisNumber", row.chassisNumber || "");
      setValue("engineNumber", row.engineNumber || "");
      setValue("model", row.model || "");
      setValue("docs", row.docs || "");
      setValue("notes", row.notes || "");
    }
  }, [row, setValue]);

  return (
    <>
      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 3,
        }}
      >
        <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="vehicle.vehicleName" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("name", {
              required: true,
            })}
            value={watch("name") || ""}
            onChange={(e) => setValue("name", e.target.value)}
            error={formState.errors?.name?.type === "required"}
            helperText={
              formState.errors?.name?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="vehicle.vehicleNumber" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("vehicleNumber", {
              required: true,
            })}
            value={watch("vehicleNumber") || ""}
            onChange={(e) => setValue("vehicleNumber", e.target.value)}
            error={formState.errors?.vehicleNumber?.type === "required"}
            helperText={
              formState.errors?.vehicleNumber?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="vehicle.trademark" />
            {/* <Required /> */}
          </Typography>
          <TextField
            disabled={disabledState}
            {...register(
              "trademark"
              // , {
              //   required: true,
              // }
            )}
            value={watch("trademark") || ""}
            onChange={(e) => setValue("trademark", e.target.value)}
            error={formState.errors?.trademark?.type === "required"}
            helperText={
              formState.errors?.trademark?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          gap: 3,
        }}
      >
        <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="vehicle.chassisNumber" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("chassisNumber", {
              required: true,
            })}
            value={watch("chassisNumber") || ""}
            onChange={(e) => setValue("chassisNumber", e.target.value)}
            error={formState.errors?.chassisNumber?.type === "required"}
            helperText={
              formState.errors?.chassisNumber?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="vehicle.engineNumber" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("engineNumber", {
              required: true,
            })}
            value={watch("engineNumber") || ""}
            onChange={(e) => setValue("engineNumber", e.target.value)}
            error={formState.errors?.engineNumber?.type === "required"}
            helperText={
              formState.errors?.engineNumber?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="vehicle.model" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("model", {
              required: true,
            })}
            value={watch("model") || ""}
            onChange={(e) => setValue("model", e.target.value)}
            error={formState.errors?.model?.type === "required"}
            helperText={
              formState.errors?.model?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>
      </Box>

      <Box
        sx={{
          p: 2,
          display: "flex",
          // gap: 3,
        }}
      >
        {/* licenceImage */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="vehicle.registrationDocs" />
            {/* <Required /> */}
          </Typography>
          <UploadFlag
            {...{ imgLoading, setImgLoading, setValue }}
            param="docs"
            currentImg={getValues("docs")}
          />
        </FormControl>

        <div />
      </Box>

      {/** Notes Section **/}
      <Box sx={{ p: 2 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="vehicle.notes" />
          </Typography>
          <TextareaAutosize
            style={{
              borderRadius: "8px",
              borderColor: "rgba(0, 0, 0, 0.38)",
              padding: "12px 8px",
              outlineColor: "#8ECCE1",
              color: disabledState ? "rgb(170, 170, 170)" : "inherit",
            }}
            disabled={disabledState}
            {...register("notes")}
            value={watch("notes") || ""}
            onChange={(e) => setValue("notes", e.target.value)}
            rows={4}
          />
        </FormControl>
      </Box>
    </>
  );
}
