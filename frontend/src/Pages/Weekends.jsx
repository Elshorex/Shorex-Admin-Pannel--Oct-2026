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

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
// import { week } from "../components/utils/Constant";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import EditWeekend from "../components/modals/EditWeekend";
import WeekendFilter from "../components/Filters/weekendFIlter";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

export default function Weekends() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const week = [
    {
      value: 0,
      name: intl.formatMessage({ id: "weekends.Sunday" }),
      symbol: "Sun.",
    },
    {
      value: 1,
      name: intl.formatMessage({ id: "weekends.Monday" }),
      symbol: "Mon.",
    },
    {
      value: 2,
      name: intl.formatMessage({ id: "weekends.Tuesday" }),
      symbol: "Tue.",
    },
    {
      value: 3,
      name: intl.formatMessage({ id: "weekends.Wednesday" }),
      symbol: "Wed.",
    },
    {
      value: 4,
      name: intl.formatMessage({ id: "weekends.Thursday" }),
      symbol: "Thu.",
    },
    {
      value: 5,
      name: intl.formatMessage({ id: "weekends.Friday" }),
      symbol: "Fri.",
    },
    {
      value: 6,
      name: intl.formatMessage({ id: "weekends.Saturday" }),
      symbol: "Sat.",
    },
  ];

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "countries.countryName" }),
      },
      {
        accessorKey: "weekendDayStr",
        header: intl.formatMessage({ id: "weekends.weekends" }),
        cell: (row) => (
          <>
            {row.row.original?.weekendDays &&
              row.row.original?.weekendDays.map((item, index) => (
                <span key={index}>
                  {item}
                  {index !== row.row.original.weekendDays.length - 1 && " - "}
                </span>
              ))}
          </>
        ),
      },
      {
        cell: (row) => {
          return (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditCountry();
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
  const [rowData, setRowData] = useState({});
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState({});

  const [openEditCountry, setOpenEditCountry] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenEditCountry = () => setOpenEditCountry(true);
  const handleCloseEditCountry = () => setOpenEditCountry(false);

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/country?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      countryName: item.name[locale],
      weekendDays: item.weekend.map((day) => week[day].name),
      weekendDayStr: item.weekend.map((day) => week[day].name).join(" - "),
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `/country?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    search.length > 0 && (url += `&name=${search}`);
    (filterData?.id || filterData?.id == 0) && (url += `&id=${filterData?.id}`);
    (filterData?.weekend || filterData?.weekend == 0) &&
      (url += `&weekend=${filterData?.weekend}`);
    getData(url);
  }, [pageIndex, search, pageSize, filterData?.weekend, filterData?.id]);

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
      <EditWeekend
        open={openEditCountry}
        handleClose={handleCloseEditCountry}
        getData={getData}
        flag="edit"
        row={rowData}
      />
      <WeekendFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        countries={excelData && excelData}
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
          <Typography variant="h2" sx={{ mb: 1 }}>
            <FormattedMessage id="weekends.weekends" />
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
              noLastUselessColumns={1}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "12px",
            mb: 2,
            mt: 2,
            justifyContent: "space-between",
          }}
        >
          <Box>
            {filterData?.id && (
              <Chip
                label=<Typography variant="label">
                  {
                    excelData.find((country) => country.id === filterData?.id)
                      .countryName
                  }
                </Typography>
                color="primary"
                onDelete={() => setFilterData({ ...filterData, id: "" })}
              />
            )}
            {filterData?.weekend && (
              <Chip
                label=<Typography variant="label">
                  {week[filterData?.weekend].name}
                </Typography>
                // variant="outlined"
                color="primary"
                onDelete={() => setFilterData({ ...filterData, weekend: "" })}
              />
            )}
          </Box>
          {(filterData?.weekend || filterData?.id) && (
            <Chip
              label=<Typography variant="label">
                <FormattedMessage id="weekends.clearAll" />
              </Typography>
              variant="outlined"
              color="error"
              onClick={() => setFilterData({ id: "", weekend: "" })}
            />
          )}
        </Box>
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
