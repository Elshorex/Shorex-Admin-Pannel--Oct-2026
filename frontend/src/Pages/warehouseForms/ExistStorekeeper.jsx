import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import Required from "../../components/required";
import StoreKeeperForm from "./StoreKeeperForm";

export default function ExistStorekeeper({ form, action, fetchedStorekeeper }) {
  const { register, getValues, reset, formState, watch, setValue } = form;
  const [rowExist, setRowExist] = useState(null);

  useEffect(() => {
    let storeKeeperData = fetchedStorekeeper?.data?.data?.find(
      (item) => item?.id == watch("storeKeeper")
    );

    setRowExist({
      data: {
        storeKeeper: storeKeeperData,
      },
    });
  }, [watch("storeKeeper")]);

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        gap: 3,
        flexDirection: "column",
      }}
    >
      <FormControl fullWidth>
        <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
          <FormattedMessage id="warehouse.storekeeper" />
          <Required />
        </Typography>
        <Select
          sx={{
            color: "#049A77",
            backgroundColor: "#ffffff",
            p: 2,
            border: "0.1px solid #B0D9C3",
          }}
          {...register("storeKeeper")}
          defaultValue={getValues("storeKeeper")}
        >
          {Object.keys(fetchedStorekeeper)?.length !== 0 &&
            fetchedStorekeeper?.data?.data?.map((item) => (
              <MenuItem value={item.id} key={item.id}>
                <ListItemIcon
                  sx={{
                    color: "#049A77",
                    marginTop: "5px",
                  }}
                  key={item.id}
                >
                  {item.name}
                </ListItemIcon>
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {rowExist?.data?.storeKeeper && (
        <StoreKeeperForm form={form} row={rowExist} action={action} />
      )}
    </Box>
  );
}
