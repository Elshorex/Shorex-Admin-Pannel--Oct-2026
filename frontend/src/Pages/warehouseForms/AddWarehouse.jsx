import React, { useEffect } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import WarehouseForm from "./WarehouseForm";
import StoreKeeperForm from "./StoreKeeperForm";
import ExistStorekeeper from "./ExistStorekeeper";
import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { usePutData } from "../../hooks/usePutData";
import { removeProperty } from "../../components/utils/Helper";
import { LoadingButton } from "@mui/lab";
import { useLanguage } from "../../hooks/useLanguage";
import WarningMessage from "../../components/modals/warning_message";

export default function AddWarehouse() {
  const location = useLocation();
  const navigate = useNavigate();
  const { useId, id, action } = location?.state || {};
  const [value, setValue] = React.useState("NewStorekeeper");
  const form = useForm();
  const { locale } = useLanguage();

  const [conflictMessage, setConflictMessage] = React.useState(null);
  const [openConflictModal, setOpenConflictModal] = React.useState(false);

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "/warehouse/new",
    {},
    null,
    "error"
  );

  const [warehouseAddExist, loadingAddExist, SetAddWarehouseExist] =
    usePostData("/warehouse/exist", {}, null, "error");

  const [fetchedStorekeeper, loadingStorekeeper, getDataStorekeeper] =
    useFetchedData("/storekeeper?removeLanguage=true");

  const [fetchedWarehouse, loadingWarehouse, getDataWarehouse] = useFetchedData(
    `/warehouse/${id}`,
    false //for no in first render
  );

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    `/warehouse/${id}`,
    {},
    null,
    "error"
  ); 

  const [
    resultChangeNewStorekeeper,
    loadingChangeNewStorekeeper,
    setChangeNewStorekeeper,
  ] = usePostData(`/warehouse/${id}/store-keeper/new`, {}, null, "error");

  const [
    resultChangeExistStorekeeper,
    loadingChangeExistStorekeeper,
    setChangeExistStorekeeper,
  ] = usePostData(`/warehouse/${id}/store-keeper/exist`, {}, null, "error");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const removeEmptyParameters = (obj) => {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        if (typeof value === "object" && !Array.isArray(value)) {
          newObj[key] = removeEmptyParameters(value); // Recursive call for nested objects
        } else {
          newObj[key] = value;
        }
      }
    }
    return newObj;
  };

  const onSubmit = async (data) => {
    const status = 1;

    // Remove empty parameters from the data
    let newData = removeEmptyParameters(data);

    console.log(newData,'newData')

    // Extract relevant fields from the data
    let { name, notes, address, storeKeeper, storeKeeperData, products } = newData;
  if (action === "editData") {
        products = products?.map((item) => ({
          product: typeof item === "number" ? item : item.product.id,
          stock: item.stock,
        }));
        if (!storeKeeperData.password || storeKeeperData.password.trim() === "") {
          delete storeKeeperData.password;
        }
        storeKeeperData = { ...storeKeeperData, userId: useId };
        newData = { ...newData, products, storeKeeperData };
   }else {
      products = products?.map((item) => ({
        product: item,
        stock: 0,
      }));
      newData = { ...newData, products };
    }
    // Prepare data for existing storekeeper
    const addExistData = removeEmptyParameters({
      name,
      notes,
      address,
      storeKeeper,
    });

    if (action === "editData") {
      await setEditRequest({ ...newData, products });
    } else if (action === "changeStoreKeeper" && value === "NewStorekeeper") {
      await setChangeNewStorekeeper({ ...removeProperty(newData, "products") });
    } else if (action === "changeStoreKeeper" && value === "ExistStorekeeper") {
      await setChangeExistStorekeeper({
        ...removeProperty(newData, "products"),
      });
    } else if (value === "NewStorekeeper" && action === "addWarehouse") {
      await SetAddRequest({ ...newData, status, products });
    } else {
      await SetAddWarehouseExist({ ...addExistData, status, products });
    }
  };

  useEffect(() => {
    if (id) {
      getDataWarehouse();
    }
  }, [id]);

  useEffect(() => {
    if (
      warehouseAddExist?.id ||
      resultAdd?.id ||
      resultEdit?.id ||
      resultChangeNewStorekeeper?.id ||
      resultChangeExistStorekeeper?.id
    ) 
      if(resultAdd.message !== null){
        setConflictMessage(resultAdd.message);
        setOpenConflictModal(true);
       navigate("/warehouse");

      }
    
      if (resultAdd?.warehouse?.id) {
      navigate("/warehouse");
    }
  }, [
    warehouseAddExist,
    resultAdd,
    navigate,
    resultEdit,
    resultChangeNewStorekeeper,
    resultChangeExistStorekeeper,
  ]);

  return (
    <Box
      sx={{
        p: 2,
      }}
    >

      {openConflictModal && (
              <WarningMessage
                open={openConflictModal}
                handleClose={ () => {
                   setOpenConflictModal(false);
                }}
                message={conflictMessage}
                buttonName="Yes"
                secondButtonName="No"
                
              />
            )}

      <Box sx={{ display: "flex" }}>
        <Link to="/warehouse/">
          <ArrowBackIosIcon
            fontSize="12px"
            sx={{ mt: "4px", mx: 1, scale: locale === "ar" && "-1" }}
          />
        </Link>
        <Typography variant="h2">
          {action === "viewData" && (
            <>
              <FormattedMessage id="warehouse.viewDetails" />
              <FormattedMessage id="warehouse.warehouse" />
            </>
          )}
          {action === "addWarehouse" && (
            <FormattedMessage id="warehouse.addWarehouse" />
          )}
          {action === "editData" && (
            <FormattedMessage id="warehouse.editWarehouse" />
          )}
          {action === "changeStoreKeeper" && (
            <FormattedMessage id="warehouse.changeStorekeeper" />
          )}
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
        <Typography variant="h2" sx={{ mb: 1 }}>
          <FormattedMessage id="warehouse.warehouse" />
          {loadingWarehouse && <CircularProgress />}
        </Typography>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <WarehouseForm form={form} row={fetchedWarehouse} action={action} />
          <Typography variant="h2">
            <FormattedMessage id="warehouse.storekeeper" />
          </Typography>
          {(action === "changeStoreKeeper" || action === "addWarehouse") && (
            <FormControl>
              <RadioGroup row value={value} onChange={handleChange}>
                <FormControlLabel
                  value="NewStorekeeper"
                  control={<Radio />}
                  label="NewStorekeeper"
                />
                <FormControlLabel
                  value="ExistStorekeeper"
                  control={<Radio />}
                  label="ExistStorekeeper"
                />
              </RadioGroup>
            </FormControl>
          )}

          {value === "NewStorekeeper" ? (
            <StoreKeeperForm
              form={form}
              row={fetchedWarehouse}
              action={action}
            />
          ) : (
            <>
              <ExistStorekeeper
                form={form}
                fetchedStorekeeper={fetchedStorekeeper}
                action={"viewData"}
              />
            </>
          )}

          {action !== "viewData" && (
            <Box sx={{ display: "flex", flex: "col" }}>
              <LoadingButton
                loading={
                  loadingChangeNewStorekeeper || loadingChangeExistStorekeeper
                }
                sx={{ m: 1, px: 2 }}
                variant="contained"
                // startIcon={<PublicIcon sx={{ mx: "4px" }} />}
                // onClick={handleOpen}
                type="submit"
              >
                {action === "editData" || action === "changeStoreKeeper" ? (
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
                // startIcon={<PublicIcon sx={{ mx: "4px" }} />}
                onClick={() => navigate("/warehouse/")}
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
