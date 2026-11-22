import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import moment from "moment";
import { Dialog, DialogContent } from "@mui/material";

import { useDeleteData } from "../hooks/useDeleteData";
import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import { baseURL } from "../constants/api";
import PromotionsFilter from "../components/Filters/promotionsFIlter";
import WarningMessage from "../components/modals/warning_message";
import AddEditPromotions from "../components/modals/AddEditPromotions";
import { isValidDate } from "../components/utils/Helper";

import emptyStatus from "../assets/svgs/emptyStatus.svg";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Promotions() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const [filterData, setFilterData] = useState({});
  const [search, setSearch] = useState("");
  const [rowData, setRowData] = useState({});
  const [openFilter, setOpenFilter] = useState(false);
  const [OpenWarningDeleteProm, setOpenWarningDeleteProm] = useState(false);

  const [openAddProm, setOpenAddProm] = useState(false);
  const [openEditProm, setOpenEditProm] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState({});


  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => {
    setData(promotionData);
    setOpenFilter(false);
  };

      const handleOpenMediaModal = (item) => {
      setSelectedMedia(item);
      setMediaModalOpen(true);
    };

    const handleCloseMediaModal = () => {
      setMediaModalOpen(false);
      setSelectedMedia({});
    };


  const [countriesData, loadingCountries, getDataCountries] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const [promotionData, loadingPromotion, getDataPromotion] = useFetchedData(
    `/promotion?removeLanguage=true&all=true`
  );
  const [data, setData] = useState(promotionData && promotionData);

  const [deleteData, loadingDeleteWarehouse, deleteRow] = useDeleteData(
    `/promotion/${rowData?.id}`
  );

  useEffect(() => {
    setData(promotionData || []);
  }, [
    promotionData?.data?.data?.length,
    filterData?.country,
    filterData?.fromDate,
    filterData?.toDate,
    loadingPromotion,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        setOpenWarningDeleteProm(false);
        await getDataPromotion();
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  const filterChips = [
    {
      key: "country",
      label: countriesData?.data?.data?.find(
        (country) => country.id === filterData?.country
      )?.name[locale],
    },
    { key: "fromDate", label: filterData?.fromDate },
    {
      key: "toDate",
      label:
        filterData?.toDate &&
        isValidDate(filterData?.toDate) &&
        filterData?.toDate,
    },
  ];

  const getData = async (url) => {
    try {
      url ? await getDataPromotion(url) : await getDataPromotion(); // Wait for the data to be fetched
      setData(promotionData); // Set the data only after the fetch is completed
    } catch (error) {
      console.error("Error fetching promotion data:", error); // Handle any potential errors
    }
  };

  useEffect(() => {
    let url = `promotion?removeLanguage=true`;
    search?.length > 0 && (url += `&name=${search}`);
    filterData?.country && (url += `&country=${filterData?.country}`);
    ((filterData?.fromDate && isValidDate(filterData?.fromDate)) ||
      (filterData?.toDate && isValidDate(filterData?.toDate))) &&
      (url += `&filterDateKey=promotionFromDate`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&fromDateValue=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&toDateValue=${filterData?.toDate}`);
    getData(url);
  }, [search, filterData?.country, filterData?.fromDate, filterData?.toDate]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <PromotionsFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        setFilterData={setFilterData}
        filterData={filterData}
        countriesData={countriesData && countriesData}
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
            <FormattedMessage id="promotion.promotions" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={() => setOpenAddProm(true)}
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
          {(loadingPromotion || loadingDeleteWarehouse) && <CircularProgress />}
          <Box>
            <Button
              sx={{ mx: 3, px: 2, py: 1 }}
              variant="contained"
              onClick={() => handleOpenFilter()}
            >
              <Typography variant="h3">
                <FormattedMessage id="weekends.filter" />
              </Typography>
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: "12px", mb: 2 }}>
          {filterChips.map(
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
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {data?.data?.data.map((item, idx) => {
          return (
            <>
              <Card sx={{ minWidth: 0, flexBasis: "calc(33.333% - 10.67px)" }}>
              {item.mediaType === "IMAGE" ? (
                <CardMedia
                  sx={{ height: 70, backgroundColor: "black", cursor: "pointer" }}
                  image={item.media}
                  title="Promotion Image"
                  onClick={() => handleOpenMediaModal(item)}
                />
              ) : (
                <Box
                  sx={{
                    height: 70,
                    backgroundColor: "black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenMediaModal(item)}
                >
                  <video
                    key={item.id}
                    src={item.media}
                    style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                </Box>
              )}

              <CardContent>
                <Typography gutterBottom variant="h5" component="div" color="primary">
                  {item?.name} ({item?.country?.name[locale]})
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {item?.description}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ height:"15px"}}>
                  {isValidDate(item?.promotionFromDate)
                    ? moment(item?.promotionFromDate).format("Do MMM YY")
                    : ""}
                </Typography>
              </CardContent>

              <CardActions sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  sx={{ mb: 2, width: "70%" }}
                  variant="outlined"
                  onClick={() => {
                    setRowData(item);
                    setOpenEditProm(true);
                  }}
                >
                  <Typography variant="h3">
                    <FormattedMessage id="providers.edit" />
                  </Typography>
                </Button>

                <Button
                  variant="contained"
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
        {data?.data?.data.length == 0 && !loadingPromotion && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              width: "100%",
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
            </Box>
          </Box>
        )}
      </Box>
      <WarningMessage
        open={OpenWarningDeleteProm}
        handleClose={() => setOpenWarningDeleteProm(false)}
        message={intl.formatMessage({
          id: "promotion.warningDeleteProm",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={deleteRow}
      />

      <AddEditPromotions
        open={openAddProm}
        handleClose={() => setOpenAddProm(false)}
        getData={getData}
        flag="add"
        countriesData={countriesData}
      />

      <AddEditPromotions
        open={openEditProm}
        handleClose={() => setOpenEditProm(false)}
        getData={getData}
        flag="edit"
        row={rowData}
        countriesData={countriesData}
      />

      <Dialog
          open={mediaModalOpen}
          onClose={handleCloseMediaModal}
          maxWidth="lg"
        >
          <DialogContent
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 0,
            }}
          >
            {selectedMedia.mediaType === "IMAGE" ? (
              <img
                src={selectedMedia.media}
                alt={selectedMedia.name}
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            ) : (
              <video
                src={selectedMedia.media}
                controls
                autoPlay
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}
          </DialogContent>
        </Dialog>

    </Box>
  );
}
