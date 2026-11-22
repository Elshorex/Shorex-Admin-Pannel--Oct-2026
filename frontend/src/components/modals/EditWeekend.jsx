import React, { useEffect, useState } from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";
import { week } from "../utils/Constant";
import { LoadingButton } from "@mui/lab";
import { toast } from "react-toastify";

export default function EditWeekend({
  open,
  handleClose,
  getData,
  flag,
  row = {},
}) {
  const { register, handleSubmit, reset, formState } = useForm();
  const [selectedCheckboxes, setSelectedCheckboxes] = useState({}); // State to store selected checkboxes
  const intl = useIntl();

  function convertArrayToObject(array) {
    let result = {};
    array?.forEach((item) => {
      result[item] = true;
    });
    return result;
  }

  useEffect(() => {
    row?.row?.original?.weekend?.length != 0 &&
      setSelectedCheckboxes(convertArrayToObject(row?.row?.original?.weekend));
  }, [
    row?.row?.original?.weekend?.length,
    row?.row?.original?.id,
    row?.row?.original?.updatedAt,
  ]);

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "category",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `country/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    if (Object.keys(selectedCheckboxes) != 0) {
      const selectedValues = week
        .filter((day) => selectedCheckboxes[day.value])
        .map((day) => day.value); // Get selected values
      const body = {
        weekend: selectedValues, // Include selected values in the body
      };
      await SetEditRequest(body);
      onCancel();
    } else {
      toast.error(intl.formatMessage({ id: "error.requiredOneDay" }));
    }
  };

  const handleCheckboxChange = (value) => {
    setSelectedCheckboxes((prev) => ({
      ...prev,
      [value]: !prev[value], // Toggle checkbox state
    }));
  };

  const onCancel = () => {
    setSelectedCheckboxes({});
    handleClose();
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultAdd, resultEdit]);

  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.row?.original?.updatedAt]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onCancel}
        title={
          <Typography variant="h3">
            <FormattedMessage id="weekends.editWeekends" />
          </Typography>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            {week.map((day) => {
              return (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      // defaultChecked={row?.row?.original?.weekend?.includes(
                      //   day.value
                      // )}
                      checked={selectedCheckboxes[day.value] || false} // Set checked state
                      onChange={() => handleCheckboxChange(day.value)} // Toggle checkbox
                    />
                  }
                  label={day.name}
                  // {...register("point")}
                />
              );
            })}
          </FormGroup>
          <LoadingButton
            loading={loadingEdit}
            sx={{ m: 3, width: "80%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }}/>}
            type="submit"
          >
            <Typography variant="h3">
              <FormattedMessage id="weekends.editWeekends" />
            </Typography>
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
