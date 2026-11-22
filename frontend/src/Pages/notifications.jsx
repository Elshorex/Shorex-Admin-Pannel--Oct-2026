import { useEffect } from "react";
import React, { useState } from "react";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Box,
  Typography,
  Card,
  Chip,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import WarningMessage from "../components/modals/warning_message";
import Add_edit_notification from "../components/modals/add_edit_notifications";
import PromotionsFilter from "../components/Filters/promotionsFIlter";
import ResponsiveDateRangePickers from "../components/DatePicker/DatePicker";
import { useDeleteData } from "../hooks/useDeleteData";
import { isValidDate } from "../components/utils/Helper";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import emptyStatus from "../assets/svgs/emptyStatus.svg";
import { baseURL } from "../constants/api";

export default function Notifications() {
  const intl = useIntl();
  const { locale } = useLanguage();

  const [filterData, setFilterData] = useState({});
  const [search, setSearch] = useState("");
  const [rowData, setRowData] = useState({});
  const [openFilter, setOpenFilter] = useState(false);
  const [OpenWarningDeleteNotif, setOpenWarningDeleteNotif] = useState(false);

  const [openAddNotif, setOpenAddNotif] = useState(false);
  const [openEditNotif, setOpenEditNotif] = useState(false);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [countriesData, loadingCountries, getDataCountries] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const [deleteData, loadingDelete, deleteRow] = useDeleteData(
    `/notification/${rowData?.id}`
  );

  const [notificationData, loadingNotification, getDataNotification] =
    useFetchedData(`/notification?removeLanguage=true&all=true`);

  const onSubmitDelete = () => {
    deleteRow();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        await getData();
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  const filterChips = [
    // {
    //   key: "product",
    //   label: categoryData?.data?.data?.find(
    //     (category) => category.id === filterData?.category
    //   )?.name[locale],
    // },
    { key: "fromDate", label: filterData?.fromDate },
  ];

  const getData = (url) => {
    getDataNotification(url);
  };

  useEffect(() => {
    let url = `/notification?removeLanguage=true&all=true`;
    search?.length > 0 && (url += `&name=${search}`);
    getData(url);
  }, [search]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <Add_edit_notification
        open={openAddNotif}
        handleClose={() => setOpenAddNotif(false)}
        getData={getData}
        flag="add"
      />
      <Add_edit_notification
        open={openEditNotif}
        handleClose={() => setOpenEditNotif(false)}
        getData={getData}
        flag="edit"
        row={rowData}
      />

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
            <FormattedMessage id="notifications.notifications" />
          </Typography>
          {loadingNotification && <CircularProgress />}

          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={() => setOpenAddNotif(true)}
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.addNew" />
            </Typography>
          </Button>
        </Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}
        >
          <FormControl variant="standard">
            <OutlinedInput
              id="input-with-icon-adornment"
              placeholder={intl.formatMessage({ id: "countries.search" })}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <Box>
            {/* <Button
              sx={{ mx: 3, px: 2, py: 1 }}
              variant="contained"
              onClick={() => handleOpenFilter()}
            >
              <Typography variant="h3">
                <FormattedMessage id="weekends.filter" />
              </Typography>
            </Button> */}
            {/* <FormControl variant="standard" sx={{ display: "flex" }}>
              <Typography sx={{ mb: 2 }} variant="h3">
                <FormattedMessage id="warehouse.date" />{" "}
                <ResponsiveDateRangePickers setValue={setValue} />
              </Typography>
            </FormControl> */}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: "12px", mb: 2 }}>
          {filterChips?.map(
            ({ key, label }) =>
              label && (
                <Chip
                  key={key}
                  label={<Typography variant="label">{label}</Typography>}
                  color="primary"
                  onDelete={() => setFilterData({ ...filterData, [key]: "" })}
                />
              )
          )}
        </Box>
        {(filterData?.status ||
          filterData?.category ||
          filterData?.adminFilter ||
          filterData?.certainProvider ||
          filterData?.fromDate ||
          filterData?.toDate) && (
          <Chip
            label={
              <Typography variant="label">
                <FormattedMessage id="weekends.clearAll" />
              </Typography>
            }
            variant="outlined"
            color="error"
            onClick={() =>
              setFilterData({
                fromDate: "",
                toDate: "",
                category: "",
                status: "",
                adminFilter: "",
                certainProvider: "",
              })
            }
          />
        )}
      </Box>

      {notificationData?.data?.data.map((item, idx) => {
        return (
          <>
            <Card
              sx={{
                mb: 3,
              }}
            >
              <CardHeader
                avatar={
                  <img
                    src={item?.image && item?.image}
                    width={70}
                    height={70}
                    style={{ objectFit: "cover" , margin:"0px 8px"}}
                  />
                }
                title={
                  <Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        color="primary"
                      >
                        {item?.title[locale]}
                      </Typography>
                      <Box>
                        <Button
                          //   sx={{ mb: 2, width: "70%" }}
                          variant="outlined"
                          onClick={() => {
                            setOpenEditNotif(true);
                            setRowData(item);
                          }}
                        >
                          <Typography variant="h3">
                            <FormattedMessage id="providers.edit" />
                          </Typography>
                        </Button>
                        <Button
                          disabled={loadingDelete}
                          variant="contained"
                          color="error"
                          sx={{ mx: 2 }}
                          onClick={() => {
                            setOpenWarningDeleteNotif(true);
                            setRowData(item);
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item?.description[locale]}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {isValidDate(item?.updatedAt) &&
                        moment(item?.updatedAt).format("YYYY-MM-DD")}
                    </Typography>
                  </Box>
                }
              />
            </Card>
          </>
        );
      })}

      {notificationData?.data?.data.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img alt="logo" src={emptyStatus} width={300} />
            <Typography sx={{ mb: 1, mx: 1 }} variant="h2">
              <FormattedMessage id="error.noData" />
            </Typography>
            {/* <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, width: "50%" }}
            >
              Reload
            </Button> */}
          </Box>
        </Box>
      )}

      <WarningMessage
        open={OpenWarningDeleteNotif}
        handleClose={() => setOpenWarningDeleteNotif(false)}
        message={intl.formatMessage({
          id: "notifications.confirmationDeleteNotification",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={onSubmitDelete}
      />
    </Box>
  );
}
