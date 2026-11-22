import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CircularProgress,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";

import { useDeleteData } from "../hooks/useDeleteData";
import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import { baseURL } from "../constants/api";
import PromotionsFilter from "../components/Filters/promotionsFIlter";
import WarningMessage from "../components/modals/warning_message";
import AddEditPromotions from "../components/modals/AddEditPromotions";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';

export default function RecycleSteps() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const navigate = useNavigate();
  const [rowData, setRowData] = useState({});
  const [OpenWarningDeleteProm, setOpenWarningDeleteProm] = useState(false);

  const [recycleData, loadingRecycleData, getRecycleData] = useFetchedData(
    `/recycle?removeLanguage=true&all=true`
  );

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/recycle/${rowData?.id}`
  );

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        setOpenWarningDeleteProm(false);
        await getRecycleData();
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pb: "24px",
          }}
        >
          <Typography variant="h2">
            <FormattedMessage id="requestsManagement.recycleSteps" />
            {loadingRecycleData && <CircularProgress />}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/addStepRecycle")}
          >
            <Typography variant="h3" sx={{ display:"flex"}}>
              <AddIcon />
              <FormattedMessage id="createStep.addStep" />
            </Typography>
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {recycleData?.data?.data.map((item, idx) => {
          return (
            <>
              <Card sx={{ minWidth: 0, flexBasis: "calc(33.333% - 10.67px)" }}>
                <CardMedia
                  sx={{ height: 70, backgroundColor: "black" }}
                  image={baseURL + item.image}
                  title="card media"
                />
                <CardContent sx={{ height: "50px" }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    color="primary"
                  >
                    {item?.name[locale]}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    sx={{ mb: 2, width: "70%" }}
                    variant="outlined"
                    onClick={() => {
                      setRowData(item);
                      navigate("/addStepRecycle", {
                        state: { id: item?.id },
                      });
                    }}
                  >
                    <Typography variant="h3">
                      <FormattedMessage id="providers.edit" />
                    </Typography>
                  </Button>
                  <Button
                    variant="contained"
                    disabled={loadingDeleteWarehouse}
                    color="error"
                    sx={{ mb: 2, width: "20%" }}
                    onClick={() => {
                      setRowData(item);
                      setOpenWarningDeleteProm(true);
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </CardActions>
              </Card>
            </>
          );
        })}
      </Box>
      <WarningMessage
        open={OpenWarningDeleteProm}
        handleClose={() => setOpenWarningDeleteProm(false)}
        message={intl.formatMessage({
          id: "requestsManagement.recycleStepsConfirm",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={deleteRow}
      />

    </Box>
  );
}
