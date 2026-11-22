import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";

import MainTable from "../components/table";
import BasicBreadcrumbs from "../components/BasicBreadcrumbs";
import ExportButton from "../components/ExportButton";
import AddNewCity from "../components/modals/addNewCityModal";
import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

const Cities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLanguage();
  const intl = useIntl();
  // const countryId = location?.state?.countryId;
  const stateId = location?.state?.stateId;
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [search, setSearch] = useState("");

  const columns = useMemo(
    () => [
      {
        accessorKey: "cityName",
        header: intl.formatMessage({ id: "cities.cityName" }),
      },
       {
        accessorKey: "stateName",
        header: intl.formatMessage({ id: "regions.stateName" }),
      },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "cities.countryName" }),
      },
      
     
      {
        id: "action",
        cell: (row) => (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditCity();
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
        ),
      },
    ],
    []
  );

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [excelData, setExcelData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [openAddCity, setOpenAddCity] = useState(false);
  const [openEditCity, setOpenEditCity] = useState(false);

  const handleOpenAddCity = () => setOpenAddCity(true);
  const handleCloseAddCity = () => setOpenAddCity(false);
  const handleOpenEditCity = () => setOpenEditCity(true);
  const handleCloseEditCity = () => setOpenEditCity(false);


 let url = stateId
  ? `/city?region=${stateId}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  : `/city?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
  const [fetchedData, loading, getNewData] = useFetchedData(url);


  const excelUrl = stateId
  ? `/city?region=${stateId}&removeLanguage=true&all=true`
  : `/city?removeLanguage=true&all=true`;

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(excelUrl);

  const getData = (url) => {
    getNewData(url);
    search === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      cityName: item.name[locale],
      countryName: item.country.name[locale],
      stateName: item.region.name[locale]
    }));
  };

  const handleRowClick = (row) => {
    navigate(`/regions/${row.original.id}`, {
      state: { cityId: row.original.id },
    });
  };

  useEffect(() => {
    setData([]);
   let listUrl;
    if (search.length > 0) {
      listUrl = stateId
        ? `/city?name=${search}&region=${stateId}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
        : `/city?name=${search}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    } else {
      listUrl = stateId
        ? `/city?region=${stateId}&removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
        : `/city?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    }
    getData(listUrl);

  }, [pageIndex, search, pageSize]);

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
        p: "32px",
      }}
    >
      <AddNewCity
        open={openAddCity}
        handleClose={handleCloseAddCity}
        getData={getData}
        flag="add"
      />

      <AddNewCity
        open={openEditCity}
        handleClose={handleCloseEditCity}
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
          <BasicBreadcrumbs />
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddCity}
          >
            <Typography variant="h3">
              <FormattedMessage id="cities.addNewCity" />
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

          <ExportButton
            loadingExcelData={loadingExcelData}
            data={excelData ? excelData : []}
            columns={columns ? columns : []}
            noLastUselessColumns={1}
          />
        </Box>
      </Box>
      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          handleRowClick,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
};

export default Cities;
