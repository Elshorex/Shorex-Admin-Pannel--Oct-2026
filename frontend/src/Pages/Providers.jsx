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
import MainTable from "../components/table";
import AddEditViewProvider from "../components/modals/Add_Edit_ViewProvider";
import ExportButton from "../components/ExportButton";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import ProviderMenuCell from "../components/menuCells/providerMenuCell";
import ProviderFilter from "../components/Filters/providerFilter";

export default function Providers() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [excelData, setExcelData] = useState([]);

  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [filterData, setFilterData] = useState({});
  const [pageSize, setPageSize] = useState(storedPageSize);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);
  const handleOpenView = () => setOpenView(true);
  const handleCloseView = () => setOpenView(false);
  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const [countriesData, loadingCountriesData, getDataCountriesData] =
    useFetchedData(`/country?removeLanguage=true&all=true`);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/provider?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [fetchedStatus, loadingState, getStatus] = useFetchedData(
    `/status?removeLanguage=true`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/provider?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  useEffect(() => {
    setData([]);
    let url = `/provider?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    search.length > 0 && (url += `&name=${search}`);
    filterData?.country && (url += `&country=${filterData?.country}`);
    filterData?.status && (url += `&status=${filterData?.status}`);
    getData(url);
  }, [pageIndex, search, filterData?.country, filterData?.status, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      countryName: item.country?.name,
      statusName: item.status?.name,
    }));
  };

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data?.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: intl.formatMessage({ id: "providers.providerName" }),
      },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "countries.countryName" }),
      },
      {
        accessorKey: "contactPersonName",
        header: intl.formatMessage({ id: "providers.contactPerson" }),
      },
      {
        accessorKey: "contactPersonLandline",
        header: intl.formatMessage({ id: "providers.contactPersonMobile" }),
      },
      // {
      //   accessorKey: "statusName",
      //   header: intl.formatMessage({ id: "providers.Status" }),
      //   cell: (row) => {
      //     return (
      //       <>
      //         <Typography
      //           color={
      //             row?.row?.original?.status.id === 1 ? "#00B887" : "error"
      //           }
      //         >
      //           {row?.row?.original?.status.name}
      //         </Typography>
      //       </>
      //     );
      //   },
      // },
      {
        accessorKey: "statusName",
        header: intl.formatMessage({ id: "providers.Status" }),
        cell: (row) => {
          return (
            <>
              <Typography
                color={
                  row?.row?.original?.status === 1 ? "#00B887" : "error"
                }
              >
                {row?.row?.original?.status}
              </Typography>
            </>
          );
        },
      },
      {
        accessorKey: "nif",
        header: intl.formatMessage({ id: "providers.registrationNumber" }),
      },
      {
        cell: (row) => {
          return (
            <Box
              onClick={() => {
                setRowData(row);
              }}
            >
              <ProviderMenuCell
                row={row}
                handleOpenView={handleOpenView}
                handleOpenEdit={handleOpenEdit}
                getData={getData}
              />
            </Box>
          );
        },
        id: "action",
      },
    ],
    []
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <AddEditViewProvider
        open={openAdd}
        handleClose={handleCloseAdd}
        getData={getData}
        flag="add"
      />
      <AddEditViewProvider
        open={openEdit}
        handleClose={handleCloseEdit}
        getData={getData}
        flag="edit"
        row={rowData}
      />
      <AddEditViewProvider
        open={openView}
        handleClose={handleCloseView}
        getData={getData}
        flag="view"
        row={rowData}
      />

      <ProviderFilter
        open={openFilter}
        handleClose={handleCloseFilter}
        countriesData={countriesData && countriesData}
        fetchedStatus={fetchedStatus && fetchedStatus}
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
            <FormattedMessage id="providers.addProvider" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ ml: "16px" }} />}
            onClick={handleOpenAdd}
          >
            <Typography variant="h3">
              <FormattedMessage id="providers.addProvider" />
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
              noLastUselessColumns={1}
              // getDataExcelData={() => getDataExcelData()}
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
          {filterData?.status && (
            <Chip
              label={
                <Typography variant="label">
                  {
                    fetchedStatus?.data?.data?.find(
                      (status) => status?.id === filterData?.status
                    ).name[locale]
                  }
                </Typography>
              }
              color="primary"
              onDelete={() => setFilterData({ ...filterData, status: "" })}
            />
          )}
        </Box>
        {(filterData?.status || filterData?.country) && (
          <Chip
            label={
              <>
                <Typography variant="label">
                  <FormattedMessage id="weekends.clearAll" />
                </Typography>
              </>
            }
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
        {...{ columns, pageIndex, setPageIndex, pageSize, setPageSize }}
      />
    </Box>
  );
}
