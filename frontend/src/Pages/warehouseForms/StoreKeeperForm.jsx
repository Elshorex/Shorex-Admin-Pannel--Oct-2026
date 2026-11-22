import React, { useEffect } from "react";
import {
  FormControl,
  Box,
  Typography,
  TextField,
  TextareaAutosize,
  Select,
  MenuItem,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import SingleDatePicker from "../../components/DatePicker/SingleDatePicker";
import Required from "../../components/required";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";

export default function StoreKeeperForm({ form, row, action }) {
  const { register, getValues, formState, watch, setValue } = form;
  const disabledState = action === "viewData" ? true : false;
    const [countryId, setCountryId] = useState(null);
    const [regionIds, setRegionIds] = useState([]);
    const [cityIds, setCityIds] = useState([]);
    const { locale } = useLanguage();

    const [fetchedCountry] = useFetchedData(
      "/country?removeLanguage=true"
    );
    const [fetchedState,, getDataState] = useFetchedData(
      `/region?country=${countryId ?? ""}&removeLanguage=true`
    );
  
    const [fetchedCity,,getDataCity] = useFetchedData(
     `/city?region=${regionIds.length ? regionIds.join(',') : ""}&removeLanguage=true`
    );
  
    const [fetchedArea,, getDataArea] = useFetchedData(
     `/area?city=${cityIds.length ? cityIds.join(',') : ""}&removeLanguage=true`
    );
   
        useEffect(() => {
            if (countryId) {
              getDataState();
            }
        }, [countryId]);
    
        useEffect(() => {
          if (regionIds.length) getDataCity();
          else {
            setValue("city", []);
            setCityIds([]);
          }
        }, [regionIds]);
    
    
        useEffect(() => {
          if (cityIds.length) getDataArea();
          else setValue("areas", []);
        }, [cityIds]);



  useEffect(() => {
    if (
      row?.data?.storeKeeper &&
      (action === "viewData" || action === "editData")
    ) {
      setValue("storeKeeperData.email", row.data.storeKeeper.email || "");
      setValue("storeKeeperData.name", row.data.storeKeeper.name || "");
      setValue(
        "storeKeeperData.contactPersonLandline",
        row.data.storeKeeper.contactPersonLandline || ""
      );
      setValue("storeKeeperData.phone", row.data.storeKeeper.phone || "");
      setValue("storeKeeperData.bankName", row.data.storeKeeper.bankName || "");
      setValue("storeKeeperData.iban", row.data.storeKeeper.iban || "");
      setValue(
        "storeKeeperData.managerId",
        row.data.storeKeeper.managerId || ""
      );
      setValue("storeKeeperData.startAt", row.data.storeKeeper.startAt || "");
      setValue("notes", row.data.notes || "");

      // location fields
      setValue("storeKeeperData.country", row?.data?.country?.id || "");
      setValue("storeKeeperData.region", row?.data?.storeKeeper?.region?.map(r => r) || []);
      setValue("storeKeeperData.city", row?.data?.storeKeeper?.city?.map(c => c) || []);
      setValue("storeKeeperData.areas",row?.data?.storeKeeper?.areas?.map((a) => a) || []);

      setCountryId(row?.data?.country?.id || null);
      setRegionIds(row?.data?.storeKeeper?.region?.map(r => r) || []);
      setCityIds(row?.data?.storeKeeper?.city?.map(c => c) || []);
    }
  }, [row?.data, setValue]);

  return (
    <Box>

       <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        {/* Country */}
      {/* {Object.keys(row) && ( */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="warehouse.country" />
            <Required />
          </Typography>
            <Select
                disabled={disabledState}
                {...register("storeKeeperData.country", { required: true })}
                value={watch("storeKeeperData.country") || ""}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  setValue("storeKeeperData.country", selectedId, { shouldValidate: true });
                  setValue("country", selectedId);
                  setCountryId(selectedId);
                  setRegionIds([]);
                  setCityIds([]);
                  setValue("storeKeeperData.region", []);
                  setValue("storeKeeperData.city", []);
                  setValue("storeKeeperData.areas", []);
                }}
                error={!!formState.errors?.storeKeeperData?.country}
              >
            {Object.keys(fetchedCountry).length !== 0 && (
              fetchedCountry?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))
            )}
          </Select>
          {formState.errors?.storeKeeperData?.country && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>
       

        {/* State */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="warehouse.state" />
            <Required />
          </Typography>
            <Select
              multiple
              disabled={disabledState}
              {...register("storeKeeperData.region", { required: true })}
              value={watch("storeKeeperData.region") || []}
              onChange={(e) => {
                  const ids = e.target.value.map(Number);
                setValue("storeKeeperData.region", ids, { shouldValidate: true });
                setRegionIds(ids);
                setCityIds([]);
                // setValue("region", ids,{ shouldValidate: true });
                  setValue("storeKeeperData.city", []);
                  setValue("storeKeeperData.areas", []);
              }}
            renderValue={(selected) => {
              return selected
                .map(id => {
                  const reg = fetchedState?.data?.data?.find(r => r.id === id);
                  return reg ? reg.name[locale] : id;
                })
                .join(", ");
            }}
              error={!!formState.errors?.storeKeeperData?.region}
            >
             {fetchedState?.data?.data?.map((item) => (
                           <MenuItem key={item.id} value={item.id}>
                             {item.name[locale]}
                           </MenuItem>
                         ))}
          </Select>
          {formState.errors?.storeKeeperData?.region && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        {/* City */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="warehouse.city" />
            <Required />
          </Typography>
            <Select
                multiple
                disabled={disabledState}
                {...register("storeKeeperData.city", { required: true })}
                value={watch("storeKeeperData.city") || []}
                onChange={(e) => {
                  const ids = e.target.value.map(Number);
                  setValue("storeKeeperData.city", ids, { shouldValidate: true });
                  setCityIds(ids);
                  // setValue("city", ids);
                  setValue("storeKeeperData.areas", []);
                }}
                renderValue={(selected) => {
                return selected
                  .map(id => {
                    const city = fetchedCity?.data?.data?.find(c => c.id === id);
                    return city ? city.name[locale] : id;
                  })
                  .join(", ");
                }}
                error={!!formState.errors?.storeKeeperData?.city}
              >
            {fetchedCity?.data?.data?.map((item) => (
                           <MenuItem key={item.id} value={item.id}>
                             {item.name[locale]}
                           </MenuItem>
                         ))}
          </Select>
          {formState.errors?.storeKeeperData?.city && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        {/* Area */}

          <FormControl variant="standard" fullWidth>
            <Typography sx={{ mb: 1 }} variant="h3">
              <FormattedMessage id="warehouse.area" />
              <Required />
            </Typography>
            <Select
                multiple
                disabled={disabledState}
                {...register("storeKeeperData.areas", { required: true })}
                value={watch("storeKeeperData.areas") || []}
                onChange={(e) => {
                  const selectedIds = e.target.value;
                  setValue("storeKeeperData.areas", selectedIds, { shouldValidate: true });
                  // setValue("areas", selectedIds);
                }}
              renderValue={(selected) => {
                if (!Array.isArray(selected)) return "";
                return selected
                  .map((id) => {
                    const area = fetchedArea?.data?.data?.find((a) => a.id === id);
                    return area ? area.name[locale] : id;
                  })
                  .join(", ");
                }}
                error={!!formState.errors?.storeKeeperData?.areas}
              >
              {fetchedArea?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
            </Select>

            {formState.errors?.storeKeeperData?.areas && (
              <Typography color="error" variant="body2">
                <FormattedMessage id="error.requiredField" />
              </Typography>
            )}
          </FormControl>
      </Box>

      {/** Name and Email Section **/}
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.name" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.name", { required: true })}
            value={watch("storeKeeperData.name") || ""}
            onChange={(e) => setValue("storeKeeperData.name", e.target.value)}
            error={formState.errors?.storeKeeperData?.name?.type === "required"}
            helperText={
              formState.errors?.storeKeeperData?.name?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.email" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.email", { required: true })}
            value={watch("storeKeeperData.email") || ""}
            onChange={(e) => setValue("storeKeeperData.email", e.target.value)}
            error={
              formState.errors?.storeKeeperData?.email?.type === "required"
            }
            helperText={
              formState.errors?.storeKeeperData?.email?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>
         {/* Password */}
             
      </Box>

      {/** Contact Information Section **/}
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.mobileNumber" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.phone", {
              required: true,
              maxLength: { value: 15, message: "Maximum 15 characters allowed" },
            })}
            inputProps={{ maxLength: 15 }}
            value={watch("storeKeeperData.phone") || ""}
            onChange={(e) => setValue("storeKeeperData.phone", e.target.value)}
            error={
              formState.errors?.storeKeeperData?.phone?.type === "required"
            }
            helperText={
                         formState.errors?.phone?.type === "required" ? (
                           <FormattedMessage id="error.requiredField" />
                         ) : formState.errors?.phone?.type === "maxLength" ? (
                           "Maximum 15 characters allowed"
                         ) : null
                       }
          />
        </FormControl>
           <FormControl variant="standard" fullWidth>
                  <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                    <FormattedMessage id="driver.password" />
                    <Required />
                  </Typography>
                 
                  <TextField
                      type="password"
                      disabled={disabledState}
                      {...register("storeKeeperData.password", {
                        required: action !== "editData",
                        minLength: action !== "editData" ? { value: 6, message: "Password must be at least 6 characters" } : undefined,
                        pattern: action !== "editData" ? {
                          value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                          message: "Password must contain at least one letter and one number",
                        } : undefined,
                      })}
                      onChange={(e) => setValue("storeKeeperData.password", e.target.value)}
                      error={!!formState.errors?.storeKeeperData?.password}
                      helperText={
                        formState.errors?.storeKeeperData?.password && (
                          <>
                            {formState.errors.storeKeeperData.password.type === "required" && (
                              <FormattedMessage id="error.requiredField" />
                            )}
                            {formState.errors.storeKeeperData.password.type === "minLength" && (
                              <Typography color="error" variant="body2">
                                Password must be at least 6 characters
                              </Typography>
                            )}
                            {formState.errors.storeKeeperData.password.type === "pattern" && (
                              <Typography color="error" variant="body2">
                                Must contain at least one letter and one number
                              </Typography>
                            )}
                          </>
                        )
                      }
                    />
                </FormControl>       
      </Box>

      {/** Bank Information Section **/}
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.bankName" />
            {/* <Required /> */}
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.bankName")}
            value={watch("storeKeeperData.bankName") || ""}
            onChange={(e) =>
              setValue("storeKeeperData.bankName", e.target.value)
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.iBAN" />
            {/* <Required /> */}
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.iban")}
            value={watch("storeKeeperData.iban") || ""}
            onChange={(e) => setValue("storeKeeperData.iban", e.target.value)}
          />
        </FormControl>
      </Box>

      {/** Manager Information Section **/}
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.managerID" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("storeKeeperData.managerId", { 
              required: true,
                maxLength: { value: 32, message: "Maximum 32 characters allowed" }
            }
            )}
            inputProps={{ maxLength: 32 }}
            value={watch("storeKeeperData.managerId") || ""}
            onChange={(e) =>
              setValue("storeKeeperData.managerId", e.target.value)
            }
            error={
              formState.errors?.storeKeeperData?.managerId?.type === "required"
            }
            helperText={
              formState.errors?.storeKeeperData?.managerId?.type ===
                "required" ? <FormattedMessage id="error.requiredField" /> : formState.errors?.storeKeeperData?.managerId?.type === "maxLength" ? "Maximum 32 characters allowed" : null
            }
          />
        </FormControl>

          <FormControl variant="standard" fullWidth>
          <Typography sx={{ display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.joiningDate" />
            <Required />
          </Typography>
          <SingleDatePicker
            setValue={setValue}
            disabledState={disabledState}
            watch={watch}
            param="storeKeeperData.startAt"
            {...register("storeKeeperData.startAt", { required: true })}
          />
          {formState.errors?.storeKeeperData?.startAt && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>
      </Box>

      {/** Notes Section **/}
      <Box sx={{ p: 2 ,display: "flex", gap: 3}}>
        

      <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.landlineNumber" />
            {/* <Required /> */}
          </Typography>
          <TextField
            disabled={disabledState}
            {...register(
              "storeKeeperData.contactPersonLandline"
             
            )}
            value={watch("storeKeeperData.contactPersonLandline") || ""}
            onChange={(e) =>
              setValue("storeKeeperData.contactPersonLandline", e.target.value)
            }
          />
        </FormControl>
        <FormControl variant="standard" fullWidth >
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="warehouse.notes" />
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
            maxRows={4}
            minRows={2}
          />
        </FormControl>

      </Box>
    </Box>
  );
}
