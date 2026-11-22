import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  TextField,
  TextareaAutosize,
  MenuItem,
  Select,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useFetchedData } from "../hooks/useFetchedData";
import Required from "../components/required";
import UploadFlag from "./UploadFlag";
import SingleDatePicker from "./DatePicker/SingleDatePicker";
import { useLanguage } from "../hooks/useLanguage";

export default function DriverForm({ form, row, action }) {
  // keep your destructuring as-is
  const { register, getValues, formState, setValue, watch } = form;
  const [imgLoading, setImgLoading] = useState();
  const [countryId, setCountryId] = useState(null);
  const [regionIds, setRegionIds] = useState([]);
  const [cityIds, setCityIds] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);

  // const [areaId, setAreaId] = useState(null);
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

    const handleOpenPreview = (img) => {
    setPreviewImage(img);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
    setPreviewImage(null);
  };

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
    try {
      register && register("licenceImage");
      register && register("idImage");
       register("country", { required: true });
      register("region", { required: true });
      register("city", { required: true });
      register("areas", { required: true });
      register("startAt", { required: true });
    } catch (e) {
     
    }
  }, [register]);

  useEffect(() => {
    if (row) {
      // console.log(row);
      setValue("name", row.name || "");
      setValue("email", row.email || "");
      setValue("contactPersonLandline", row.contactPersonLandline || "");
      setValue("phone", row.phone || "");
      setValue("driverId", row.driverId || "");
      setValue("licenceNumber", row.licenceNumber || "");
      setValue("bankName", row.bankName || "");
      setValue("startAt", row.startAt || "");
      setValue("iban", row.iban || "");
      // set image fields as well (so existing row passes validation if present)
      setValue("licenceImage", row.licenceImage || "");
      setValue("idImage", row.idImage || "");
      setValue("notes", row.notes || "");

      // location fields
      // setValue("region", row?.region?.id || "");
      // setValue("city", row?.city?.id || "");
      // setValue("country", row?.country?.id || "");
      setValue("country", row?.country?.id || "");
      setValue("region", row?.region?.map(r => r.id) || []);
      setValue("city", row?.city?.map(c => c.id) || []);
      setValue("areas", row?.areas?.map(a => a.id) || []);

      setCountryId(row?.country?.id || null);
      setRegionIds(row?.region?.map(r => r.id) || []);
      setCityIds(row?.city?.map(c => c.id) || []);
    }
  }, [row, setValue]);

  const disabledState = action === "viewData";


  return (
    <>
      {/* Existing Fields */}
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        {/* Country */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="driver.driverCountry" />
            <Required />
          </Typography>
          <Select
            disabled={disabledState}
            // {...register("country", { required: true })}
            value={watch("country") || ""}
            defaultValue={row?.row?.original?.country?.id || ""}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              setCountryId(selectedId);
              setRegionIds([]);
              setCityIds([]);
              setValue("region", []);
              setValue("city", []);
              setValue("areas", []);
              setValue("country", selectedId, { shouldValidate: true });
            }}
            error={!!formState.errors?.country}
          >
            {Object.keys(fetchedCountry).length !== 0 &&
              fetchedCountry?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
          </Select>
          {formState.errors?.country && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        {/* State */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="driver.driverState" />
            <Required />
          </Typography>
          <Select
            multiple
            disabled={disabledState}
            value={watch("region") || []}
            onChange={(e) => {
              const ids = e.target.value.map(Number);
              setRegionIds(ids);
              setValue("region", ids, { shouldValidate: true });
              setCityIds([]);
              setValue("city", []);
              setValue("areas", []);
            }}
            renderValue={(selected) => {
              return selected
                .map(id => {
                  const reg = fetchedState?.data?.data?.find(r => r.id === id);
                  return reg ? reg.name[locale] : id;
                })
                .join(", ");
            }}
          >
            {fetchedState?.data?.data?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name[locale]}
              </MenuItem>
            ))}
          </Select>

          {formState.errors?.region && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        {/* City */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="driver.driverCity" />
            <Required />
          </Typography>
          <Select
              multiple
              disabled={disabledState}
              value={watch("city") || []}
              onChange={(e) => {
                const ids = e.target.value.map(Number);
                setCityIds(ids);
                setValue("city", ids, { shouldValidate: true });
                setValue("areas", []);
              }}
              renderValue={(selected) => {
                return selected
                  .map(id => {
                    const city = fetchedCity?.data?.data?.find(c => c.id === id);
                    return city ? city.name[locale] : id;
                  })
                  .join(", ");
              }}
            >
              {fetchedCity?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
            </Select>

          {formState.errors?.city && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        {/* Area */}
        
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="driver.driverArea" defaultMessage="Driver Areas" />
            <Required />
          </Typography>
          <Select
            multiple
            disabled={disabledState}
            value={watch("areas") || []}
            onChange={(e) => {
              const selectedIds = e.target.value.map(Number);
              setValue("areas", selectedIds, { shouldValidate: true });
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
            error={!!formState.errors?.areas}
          >
            {fetchedArea?.data?.data?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name[locale]}
              </MenuItem>
            ))}
          </Select>
          {formState.errors?.areas && (
            <Typography color="error" variant="body2">
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.driverName" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("name", {
              required: true,
            })}
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
            <FormattedMessage id="driver.email" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("email", {
              required: true,
            })}
            onChange={(e) => setValue("email", e.target.value)}
            error={formState.errors?.email?.type === "required"}
            helperText={
              formState.errors?.email?.type === "required" && (
                <FormattedMessage id="error.requiredField" />
              )
            }
          />
        </FormControl>

        {/* Password */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.password" />
            <Required />
          </Typography>
          <TextField
            type="password"
            disabled={disabledState}
            {...register("password", {
              required: action !== "editData", // Only required in create mode
              minLength: action === "editData" && watch("password") 
                ? { value: 6, message: "Password must be at least 6 characters long" }
                : undefined,
              pattern: action === "editData" && watch("password") 
                ? {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                    message: "Password must contain at least one letter and one number",
                  }
                : undefined,
            })}
            onChange={(e) => setValue("password", e.target.value)}
            error={!!formState.errors?.password}
            helperText={
              formState.errors?.password && (
                <>
                  {formState.errors.password.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )}
                  {formState.errors.password.type === "minLength" && (
                    <Typography color="error" variant="body2">
                      Password must be at least 6 characters
                    </Typography>
                  )}
                  {formState.errors.password.type === "pattern" && (
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

  
      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.mobileNumber" />
            {/* {action == ""}  */}
            <Required />
          </Typography>
         <TextField
            disabled={disabledState}
            {...register("phone", {
              required: true,
              maxLength: { value: 15, message: "Maximum 15 characters allowed" },
            })}
            inputProps={{ maxLength: 15 }}
            onChange={(e) => setValue("phone", e.target.value)}
            error={!!formState.errors?.phone}
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
            <FormattedMessage id="driver.driverID" />
            <Required />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("driverId", {
              required: true,
              maxLength: { value: 32, message: "Maximum 32 characters allowed" },
            })}
            inputProps={{ maxLength: 32 }}
            onChange={(e) => setValue("driverId", e.target.value)}
            error={!!formState.errors?.driverId}
            helperText={
              formState.errors?.driverId?.type === "required" ? (
                <FormattedMessage id="error.requiredField" />
              ) : formState.errors?.driverId?.type === "maxLength" ? (
                "Maximum 32 characters allowed"
              ) : null
            }
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="driver.licenseNumber" />
            <Required />
          </Typography>
          <TextField
              disabled={disabledState}
              {...register("licenceNumber", {
                required: true,
                maxLength: { value: 32, message: "Maximum 32 characters allowed" },
              })}
              inputProps={{ maxLength: 32 }}
              value={watch ? watch("licenceNumber") : getValues("licenceNumber") || ""}
              onChange={(e) => setValue("licenceNumber", e.target.value)}
              error={!!formState.errors?.licenceNumber}
              helperText={
                formState.errors?.licenceNumber?.type === "required" ? (
                  <FormattedMessage id="error.requiredField" />
                ) : formState.errors?.licenceNumber?.type === "maxLength" ? (
                  "Maximum 32 characters allowed"
                ) : null
              }
            />
        </FormControl>
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ display: "flex" }} variant="h3">
            <FormattedMessage id="warehouse.joiningDate" />
            <Required />
          </Typography>

          <SingleDatePicker
            setValue={setValue}
            disabledState={disabledState && disabledState}
            watch={watch}
            param="startAt"
          />

          {formState.errors?.startAt && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              <FormattedMessage id="error.requiredField" />
            </Typography>
          )}
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="driver.bankName" />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("bankName")}
            onChange={(e) => setValue("bankName", e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.iBAN" />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("iban")}
            onChange={(e) => setValue("iban", e.target.value)}
          />
        </FormControl>
      </Box>

      <Box sx={{ p: 2, display: "flex", gap: 3 }}>
         <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="driver.landLineNumber" />
          </Typography>
          <TextField
            disabled={disabledState}
            {...register("contactPersonLandline")}
            onChange={(e) => setValue("contactPersonLandline", e.target.value)}
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.drivingLicenseImage" />
          </Typography>
          <UploadFlag
            {...{ imgLoading, setImgLoading, setValue }}
            param="licenceImage"
            currentImg={getValues("licenceImage")}
            onChange={(value) => {
              setValue("licenceImage", value);
            }}
          />

          {/* Preview Image */}
          {getValues("licenceImage") && (
            <img
              src={getValues("licenceImage")}
              alt="License_Image"
              style={{ 
                marginTop: "8px",
                width: "120px",
                height: "120px",
                objectFit: "cover",
                cursor: "pointer",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
              onClick={() => handleOpenPreview(getValues("licenceImage"))}
            />
          )}
        </FormControl>

        {/* idImage */}
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
            <FormattedMessage id="driver.drivingIDImage" />
            {/* <Required /> */}
          </Typography>
         <UploadFlag
              {...{ imgLoading, setImgLoading, setValue }}
              param="idImage"
              currentImg={getValues("idImage")}
              onChange={(value) => {
                setValue("idImage", value);
              }}
            />

            {/* Preview Image */}
            {getValues("idImage") && (
              <img
                src={getValues("idImage")}
                alt="ID_Image"
                style={{ 
                  marginTop: "8px",
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "1px solid #ccc"
                }}
                onClick={() => handleOpenPreview(getValues("idImage"))}
              />
            )}
        </FormControl>
      </Box>

      {/** Notes Section **/}
      <Box sx={{ p: 2 }}>
        <FormControl variant="standard" fullWidth>
          <Typography sx={{ mb: 1 }} variant="h3">
            <FormattedMessage id="driver.notes" />
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
            onChange={(e) => setValue("notes", e.target.value)}
            rows={4}
          />
        </FormControl>
      </Box>

      {previewImage && (
          <div
            onClick={handleClosePreview}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
              }}
            />
          </div>
        )}
    </>
  );
}
