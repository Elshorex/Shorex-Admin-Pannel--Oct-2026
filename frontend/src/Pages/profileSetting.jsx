import React, { useEffect } from "react";
import { FormControl, Box, Typography, TextField } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useFetchedData } from "../../hooks/useFetchedData";
import Required from "../../components/required";
import ChipMenu from "../../components/chipMeun";

export default function profileSetting({ form, row, action }) {
  const { register, getValues, reset, formState, watch, setValue } = form;
  const [fetchedProducts, loadingProducts, getDataProducts] = useFetchedData(
    "/product?removeLanguage=true"
  );

  useEffect(() => {
    if (row?.data) {
      setValue("name", row.data.name || "");
      setValue("address", row.data.address || "");
      setValue("products", row.data.products || []);
    }
  }, [row?.data, setValue]);

  const disabledState =
    action == "viewData" || action == "changeStoreKeeper" ? true : false;
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", width: "30%" }}>
        <FormControl variant="standard" sx={{ minWidth: "200px" }} fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="providers.productMS" />
          </Typography>
          <ChipMenu
            disabled={disabledState}
            options={
              fetchedProducts
                ? fetchedProducts?.data?.data?.map((item) => item.id)
                : []
            }
            defaultChips={
              getValues("products")?.length > 0
                ? getValues("products")
                : []
            }
            AllData={fetchedProducts ? fetchedProducts?.data?.data : []}
            tooltip={"Add"}
            onChipAdded={(option) => console.log("ADDED", option)}
            onChipRemoved={(option) => console.log("REMOVED", option)}
            onButtonShowHide={(isShown) => console.log("SHOWN", isShown)}
            maxSelect={0}
            alignLeft={false}
            sort={0}
            setValue={setValue}
          />
        </FormControl>
        {getValues("name") && getValues("products")?.length === 0 && (
          <Typography variant="h4" color="error">
            <FormattedMessage id={"error.requiredField"} />
          </Typography>
        )}
      </Box>

      <FormControl variant="standard" fullWidth>
        <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
          <FormattedMessage id="warehouse.warehouseName" />
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
        <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
          <FormattedMessage id="warehouse.address" />
          <Required />
        </Typography>
        <TextField
          disabled={disabledState}
          {...register("address", {
            required: true,
          })}
          value={watch("address") || ""}
          onChange={(e) => setValue("address", e.target.value)}
          error={formState.errors?.address?.type === "required"}
          helperText={
            formState.errors?.address?.type === "required" && (
              <FormattedMessage id="error.requiredField" />
            )
          }
        />
      </FormControl>
    </Box>
  );
}
