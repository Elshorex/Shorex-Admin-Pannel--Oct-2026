import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import moment from "moment/moment";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import AddEditHoliday from "../components/modals/Add_Edit_holiday";
import ExportButton from "../components/ExportButton";
import HolidayFilter from "../components/Filters/holidayFilter";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { isValidDate } from "../components/utils/Helper";

export default function Holidays() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "holidayName",
        header: intl.formatMessage({ id: "holidays.description" }),
      },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "countries.countryName" }),
      },
      {
        accessorKey: "type",
        header: intl.formatMessage({ id: "holidays.type" }),
      },
      {
        accessorKey: "from",
        header: intl.formatMessage({ id: "holidays.from" }),
      },
      {
        accessorKey: "to",
        header: intl.formatMessage({ id: "holidays.to" }),
      },
      {
        accessorKey: "duration",
        header: intl.formatMessage({ id: "holidays.duration" }),
      },
      {
        cell: (row) => {
          return (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditHoliday();
                  setRowData(row);
                }}
              >
                <EditIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </Button>
            </>
          );
        },
        id: "action",
      },
    ],
    []
  );

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);
  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [filterData, setFilterData] = useState({});
  const [search, setSearch] = useState("");

  const [openAddHoliday, setOpenAddHoliday] = useState(false);
  const [openEditHoliday, setOpenEditHoliday] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenAddHoliday = () => setOpenAddHoliday(true);
  const handleCloseAddHoliday = () => setOpenAddHoliday(false);
  const handleOpenEditHoliday = () => setOpenEditHoliday(true);
  const handleCloseEditHoliday = () => setOpenEditHoliday(false);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [countriesData, loadingCountriesData, getDataCountriesData] =
    useFetchedData(`/country?removeLanguage=true&all=true`);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/holiday?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/holiday?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    // search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      countryName: item.country?.name[locale],
      from: moment(item.ranges[0].fromDate).format("Do MMM YY"),
      to: moment(item.ranges[0].toDate).format("Do MMM YY"),
      duration: item.ranges[0].duration,
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `/holiday?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    (search.length > 0 || filterData?.holidayName) &&
      (url += `&holidayName=${search || filterData?.holidayName}`);
    filterData?.country && (url += `&country=${filterData?.country}`);
    filterData?.fromDate &&
      isValidDate(filterData?.fromDate) &&
      (url += `&from=${filterData?.fromDate}`);
    filterData?.toDate &&
      isValidDate(filterData?.toDate) &&
      (url += `&to=${filterData?.toDate}`);
    getData(url);
  }, [
    pageIndex,
    search,
    pageSize,
    filterData?.fromDate,
    filterData?.toDate,
    filterData?.holidayName,
    filterData?.country,
  ]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <AddEditHoliday
        open={openAddHoliday}
        handleClose={handleCloseAddHoliday}
        getData={getData}
        flag="add"
        countriesData={countriesData}
      />

      <AddEditHoliday
        open={openEditHoliday}
        handleClose={handleCloseEditHoliday}
        getData={getData}
        flag="edit"
        row={rowData}
        countriesData={countriesData}
      />

      <HolidayFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        countriesData={countriesData && countriesData}
        setFilterData={setFilterData}
        filterData={filterData}
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
            <FormattedMessage id="holidays.holidays" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddHoliday}
          >
            <Typography variant="h3">
              <FormattedMessage id="holidays.addHoliday" />
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
                setPageIndex(0);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          {loading && <CircularProgress />}
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
            <ExportButton
              loadingExcelData={loadingExcelData}
              data={excelData ? excelData : []}
              columns={columns ? columns : []}
              noLastUselessColumns={2}
              getDataExcelData={() => getDataExcelData()}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mx: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: "12px", mb: 2 }}>
          {filterData?.fromDate && isValidDate(filterData?.fromDate) && (
            <Chip
              label=<Typography variant="label">
                {filterData?.fromDate}
              </Typography>
              color="primary"
              onDelete={() => setFilterData({ ...filterData, fromDate: "" })}
            />
          )}

          {filterData?.toDate && isValidDate(filterData?.toDate) && (
            <Chip
              label=<Typography variant="label">
                {filterData?.toDate}
              </Typography>
              color="primary"
              onDelete={() => setFilterData({ ...filterData, toDate: "" })}
            />
          )}
          {filterData?.country && (
            <Chip
              label=<Typography variant="label">
                {
                  countriesData?.data?.data?.find(
                    (country) => country.id === filterData?.country
                  ).name[locale]
                }
              </Typography>
              color="primary"
              onDelete={() => setFilterData({ ...filterData, country: "" })}
            />
          )}
          {filterData?.holidayName && (
            <Chip
              label=<Typography variant="label">
                {filterData?.holidayName}
              </Typography>
              color="primary"
              onDelete={() => setFilterData({ ...filterData, holidayName: "" })}
            />
          )}
        </Box>
        {(filterData?.toDate ||
          filterData?.fromDate ||
          filterData?.holidayName ||
          filterData?.country) && (
          <Chip
            label=<Typography variant="label">
              <FormattedMessage id="weekends.clearAll" />
            </Typography>
            variant="outlined"
            color="error"
            onClick={() =>
              setFilterData({ fromDate: "", toDate: "", country: "" })
            }
          />
        )}
      </Box>

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}
