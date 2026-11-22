// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Button,
//   FormControl,
//   InputAdornment,
//   OutlinedInput,
//   Box,
//   CircularProgress,
//   Typography,
//   Chip,
// } from "@mui/material";
// import { FormattedMessage, useIntl } from "react-intl";
// import { useLocation } from "react-router-dom";
// import SearchIcon from "@mui/icons-material/Search";

// import { useAuthState } from "../context";
// import { useLanguage } from "../hooks/useLanguage";
// import { useFetchedData } from "../hooks/useFetchedData";

// import MainTable from "../components/table";
// import ExportButton from "../components/ExportButton";
// import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
// import StockMenuCell from "../components/menuCells/StockMenuCell";
// import StockFilter from "../components/Filters/stockFilter";

// import { adminOptionsFilter, stockOptions } from "../constants/constant";

// export default function Stock() {
//   const { locale } = useLanguage();
//   const intl = useIntl();
//   const user = useAuthState()?.userData || {};
//   const providerType = user.type === "PROVIDER";

//   const location = useLocation();
//   const warehouseId = location?.state?.warehouseId || "";

//   const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

//   // -------------------------------------------------------------------
//   // STATES
//   // -------------------------------------------------------------------
//   const [data, setData] = useState([]);
//   const [excelData, setExcelData] = useState([]);
//   const [totalCount, setTotalCount] = useState(1);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [pageSize, setPageSize] = useState(storedPageSize);
//   const [search, setSearch] = useState("");
//   const [filterData, setFilterData] = useState(
//     warehouseId
//       ? { warehouse: warehouseId }
//       : !providerType
//       ? { adminFilter: "myData" }
//       : {}
//   );
//   const [openFilter, setOpenFilter] = useState(false);
//   const [openSKHistory, setOpenSKHistory] = useState(false);
//   const [rowData, setRowData] = useState({});

//   // -------------------------------------------------------------------
//   // STATIC DATA FETCH
//   // -------------------------------------------------------------------
//   const [fetchedProducts] = useFetchedData(`/product?removeLanguage=true`);
//   const [warehouseList] = useFetchedData(`/warehouse?removeLanguage=true&all=true`);
//   const [providersData] = useFetchedData(`/provider?removeLanguage=true&all=true`);

//   const warehouseBaseId = filterData?.warehouse || warehouseId;

//   // -------------------------------------------------------------------
//   // MAIN PAGINATED FETCH
//   // -------------------------------------------------------------------
//   const [fetchedData, loading, getNewData] = useFetchedData(
//     warehouseBaseId
//       ? `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&page=${
//           pageIndex + 1
//         }&limit=${pageSize}`
//       : null
//   );

//   const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
//     warehouseBaseId
//       ? `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&all=true`
//       : null
//   );

//   console.log(fetchedData,'fetchedData')

//   // -------------------------------------------------------------------
//   // DATA MAPPER
//   // -------------------------------------------------------------------
//   const mapRequests = (warehouse, locale) =>
//     warehouse?.requests?.map((item) => ({
//       ...item,
//       storeKeeperName: item?.storeKeeper?.name,
//       productsList: item?.product?.name?.[locale],
//       availableStockList: item?.products?.stock,
//     })) || [];

//   // -------------------------------------------------------------------
//   // GET DATA FUNCTION
//   // -------------------------------------------------------------------
//   const getData = (url) => {
//     getNewData(url);

//     if (!search && pageIndex === 0) {
//       getDataExcelData(
//         `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&all=true`
//       );
//     }
//   };

//   // -------------------------------------------------------------------
//   // WATCH FETCHED DATA
//   // -------------------------------------------------------------------
//   useEffect(() => {
//     if (fetchedData?.data?.warehouse) {
//       setData(mapRequests(fetchedData.data.warehouse, locale));
//       setTotalCount(fetchedData.data.totalCount || 1);
//     }
//   }, [fetchedData, locale]);

//   useEffect(() => {
//     if (allData?.data?.warehouse) {
//       setExcelData(mapRequests(allData.data.warehouse, locale));
//     }
//   }, [allData, locale]);

//   // -------------------------------------------------------------------
//   // WATCH FILTERS + SEARCH + PAGINATION
//   // -------------------------------------------------------------------
//   useEffect(() => {
//     if (!warehouseBaseId) return;

//     let url = `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&page=${
//       pageIndex + 1
//     }&limit=${pageSize}`;

//     if (search) url += `&name=${search}`;
//     if (filterData?.stock === "hasStock") url += `&hasStock=true`;
//     if (filterData?.stock === "emptyStock") url += `&emptyStock=true`;
//     if (filterData?.product) url += `&product=${filterData?.product}`;
//     if (filterData?.adminFilter === "allProviders") url += `&hasProvider=true`;
//     if (filterData?.adminFilter === "myData") url += `&hasNoProvider=true`;
//     if (filterData?.adminFilter === "allData") url += `&allData=true`;
//     if (filterData?.certainProvider) url += `&provider=${filterData?.certainProvider}`;

//     getData(url);
//   }, [
//     warehouseBaseId,
//     pageIndex,
//     pageSize,
//     search,
//     filterData?.stock,
//     filterData?.product,
//     filterData?.adminFilter,
//     filterData?.certainProvider,
//   ]);

//   // -------------------------------------------------------------------
//   // FILTER CHIPS
//   // -------------------------------------------------------------------
//   const filterChips = [
//     {
//       key: "product",
//       label: fetchedProducts?.data?.data?.find(
//         (product) => product?.id === filterData?.product
//       )?.name?.[locale],
//     },
//     {
//       key: "stock",
//       label: stockOptions?.find((stock) => stock?.id === filterData?.stock)?.label,
//     },
//     {
//       key: "warehouse",
//       label: warehouseList?.data?.data?.find(
//         (warehouse) => warehouse.id === filterData?.warehouse
//       )?.name,
//     },
//     {
//       key: "adminFilter",
//       label: adminOptionsFilter?.find(
//         (item) => item?.id === filterData?.adminFilter
//       )?.name,
//     },
//     {
//       key: "certainProvider",
//       label: providersData?.data?.data?.find(
//         (provider) => provider.id === filterData?.certainProvider
//       )?.name,
//     },
//   ];

//   // -------------------------------------------------------------------
//   // TABLE COLUMNS
//   // -------------------------------------------------------------------
//   const columns = useMemo(
//     () =>
//       [
//         (filterData?.adminFilter === "allProviders" || filterData?.adminFilter === "allData") && {
//           header: intl.formatMessage({ id: "warehouse.provider" }),
//           cell: (row) => (
//             <Typography>{row?.row?.original?.provider?.name || "Shorex"}</Typography>
//           ),
//           id: "providerName",
//         },
//         {
//           accessorKey: "name",
//           header: intl.formatMessage({ id: "stock.warehouse" }),
//         },
//         {
//           accessorKey: "storeKeeperName",
//           header: intl.formatMessage({ id: "stock.storekeeper" }),
//         },
//         {
//           accessorKey: "productsList",
//           header: intl.formatMessage({ id: "stock.product" }),
//         },
//         {
//           accessorKey: "availableStockList",
//           header: intl.formatMessage({ id: "stock.availableStock" }),
//         },
//         {
//           cell: (row) => (
//             <Box onClick={() => setRowData(row)}>
//               <StockMenuCell row={row} getData={getData} />
//             </Box>
//           ),
//           id: "action",
//         },
//       ].filter(Boolean),
//     [filterData?.adminFilter, intl]
//   );

//   // -------------------------------------------------------------------
//   // RENDER
//   // -------------------------------------------------------------------
//   return (
//     <Box sx={{ width: "100%", p: "24px" }}>
//       <StockFilter
//         open={openFilter}
//         handleClose={() => setOpenFilter(false)}
//         fetchedProducts={fetchedProducts}
//         warehouseData={warehouseList}
//         setFilterData={setFilterData}
//         filterData={filterData}
//         providersData={providersData}
//       />

//       <StoreKeeperHistory
//         open={openSKHistory}
//         handleClose={() => setOpenSKHistory(false)}
//         row={rowData}
//         flag="StoreKeeperHistory"
//       />

//       {/* HEADER + SEARCH */}
//       <Box sx={{ display: "flex", flexDirection: "column", pb: "24px" }}>
//         <Box sx={{ display: "flex", justifyContent: "space-between", pb: "24px" }}>
//           <Typography variant="h2">
//             <FormattedMessage id="stock.stock" />
//           </Typography>

//           <FormControl variant="standard">
//             <OutlinedInput
//               placeholder={intl.formatMessage({ id: "countries.search" })}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPageIndex(0);
//               }}
//               startAdornment={
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               }
//             />
//           </FormControl>

//           {loading && <CircularProgress />}

//           <Box>
//             <Button
//               sx={{ mx: 3, px: 2, py: 1 }}
//               variant="contained"
//               onClick={() => setOpenFilter(true)}
//             >
//               <Typography variant="h3">
//                 <FormattedMessage id="weekends.filter" />
//               </Typography>
//             </Button>

//             <ExportButton
//               loadingExcelData={loadingExcelData}
//               data={excelData}
//               columns={columns}
//               noLastUselessColumns={1}
//             />
//           </Box>
//         </Box>
//       </Box>

//       {/* FILTER CHIPS */}
//       <Box sx={{ mx: 2, display: "flex", justifyContent: "space-between" }}>
//         <Box sx={{ display: "flex", gap: "12px", mb: 2 }}>
//           {filterChips.map(
//             ({ key, label }) =>
//               label && (
//                 <Chip
//                   key={key}
//                   label={<Typography variant="label">{label}</Typography>}
//                   color="primary"
//                   onDelete={() => setFilterData({ ...filterData, [key]: "" })}
//                 />
//               )
//           )}
//         </Box>

//         {(filterData?.product || filterData?.warehouse || filterData?.stock) && (
//           <Chip
//             label={<Typography variant="label"><FormattedMessage id="weekends.clearAll" /></Typography>}
//             variant="outlined"
//             color="error"
//             onClick={() =>
//               setFilterData({ stock: "", product: "", warehouse: "" })
//             }
//           />
//         )}
//       </Box>

//       {/* TABLE */}
//       <MainTable
//         data={data}
//         totalCount={totalCount}
//         columns={columns}
//         pageIndex={pageIndex}
//         setPageIndex={setPageIndex}
//         pageSize={pageSize}
//         setPageSize={setPageSize}
//       />
//     </Box>
//   );
// }


import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

import { useAuthState } from "../context";
import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";

import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import StockFilter from "../components/Filters/stockFilter";
import StoreKeeperHistory from "../components/modals/storeKeeperHistory";
import StockMenuCell from "../components/menuCells/StockMenuCell";

import { adminOptionsFilter, stockOptions } from "../constants/constant";

export default function Stock() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const user = useAuthState()?.userData;
  const providerType = user?.type === "PROVIDER";
  const location = useLocation();
  const warehouseId = location?.state?.warehouseId || "";

  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [openSKHistory, setOpenSKHistory] = useState(false);
  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(storedPageSize);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");

  const [filterData, setFilterData] = useState(
    warehouseId
      ? { warehouse: warehouseId }
      : !providerType
      ? { adminFilter: "myData" }
      : {}
  );

  // -------------------------------------------------------------------
  // STATIC DATA FETCH
  // -------------------------------------------------------------------
  const [fetchedProducts] = useFetchedData(`/product?removeLanguage=true`);
  const [warehouseList] = useFetchedData(`/warehouse?removeLanguage=true&all=true`);
  const [providersData] = useFetchedData(`/provider?removeLanguage=true&all=true`);

  const warehouseBaseId = filterData?.warehouse || warehouseId;

  // -------------------------------------------------------------------
  // MAIN PAGINATED FETCH
  // -------------------------------------------------------------------
  const [fetchedData, loading, getNewData] = useFetchedData(
    warehouseBaseId
      ? `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
      : null
  );

  // -------------------------------------------------------------------
  // EXCEL FETCH (ALL)
  // -------------------------------------------------------------------
  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    warehouseBaseId ? `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&all=true` : null
  );

  // -------------------------------------------------------------------
  // TABLE COLUMN DEFINITIONS
  // -------------------------------------------------------------------
  const columns = useMemo(() => [
    {
      accessorKey: "requestId",
      header: intl.formatMessage({ id: "stock.requestID" }),
    },
    {
      accessorKey: "customerName",
      header: intl.formatMessage({ id: "stock.customerName" }),
    },
    {
      accessorKey: "driverName",
      header: intl.formatMessage({ id: "driver.name" }),
    },
    {
      accessorKey: "quantity",
      header: intl.formatMessage({ id: "stock.quantity" }),
    },
    {
      accessorKey: "storeKeeperName",
      header: intl.formatMessage({ id: "warehouse.storekeeper" }),
    },
    {
      accessorKey: "productName",
      header: intl.formatMessage({ id: "stock.product" }),
    },
    {
      cell: (row) => (
        <Box onClick={() => setRowData(row)}>
          {/* Assuming StockMenuCell works for request row */}
          {console.log(row,'row')}
          <StockMenuCell row={row} getData={() => refreshData()} />
        </Box>
      ),
      id: "action",
    },
  ], [intl]);

  // -------------------------------------------------------------------
  // DATA MAPPER
  // -------------------------------------------------------------------
const mapData = (response, locale) => {
  if (!response?.data) return [];
  return response.data.map(req => ({
    requestId: req.requestId,
    customerName: req.customer?.name || "N/A",
    driverName: req.driver?.name || "N/A",
    quantity: req.quantity,
    storeKeeperName: req.storeKeeper?.name || "N/A",
    productName: req.product?.name?.[locale] || "N/A",
    warehouseId: req.warehouse || "N/A",
  }));
};

  // -------------------------------------------------------------------
  // FETCH MAIN DATA
  // -------------------------------------------------------------------
  const refreshData = (url) => {
    getNewData(url || `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`);
    if (!search && pageIndex === 0) {
      getDataExcelData(`/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&all=true`);
    }
  };

  // -------------------------------------------------------------------
  // WATCH FILTERS + REFRESH TABLE
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!warehouseBaseId) return;

    let url = `/warehouse/warehouse-stock/${warehouseBaseId}?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`;
    if (search) url += `&name=${search}`;
    if (filterData?.stock === "hasStock") url += `&hasStock=true`;
    if (filterData?.stock === "emptyStock") url += `&emptyStock=true`;
    if (filterData?.product) url += `&product=${filterData?.product}`;
    if (filterData?.adminFilter === "allProviders") url += `&hasProvider=true`;
    if (filterData?.adminFilter === "myData") url += `&hasNoProvider=true`;
    if (filterData?.adminFilter === "allData") url += `&allData=true`;
    if (filterData?.certainProvider) url += `&provider=${filterData?.certainProvider}`;

    refreshData(url);
  }, [warehouseBaseId, pageIndex, pageSize, search, filterData]);

  // -------------------------------------------------------------------
  // HANDLE RESPONSES
  // -------------------------------------------------------------------
  useEffect(() => {
    if (fetchedData?.data) {
      setData(mapData(fetchedData.data, locale));
      setTotalCount(fetchedData.data.totalCount || fetchedData.data.requests?.length || 0);
    }
  }, [fetchedData, locale]);

  useEffect(() => {
    if (allData?.data) {
      setExcelData(mapData(allData.data, locale));
    }
  }, [allData, locale]);

  // -------------------------------------------------------------------
  // FILTER CHIPS
  // -------------------------------------------------------------------
  const filterChips = [
    {
      key: "product",
      label: fetchedProducts?.data?.data?.find(p => p.id === filterData?.product)?.name?.[locale],
    },
    {
      key: "stock",
      label: stockOptions?.find(s => s.id === filterData?.stock)?.label,
    },
    {
      key: "warehouse",
      label: warehouseList?.data?.data?.find(w => w.id === filterData?.warehouse)?.name,
    },
    {
      key: "adminFilter",
      label: adminOptionsFilter?.find(f => f.id === filterData?.adminFilter)?.name,
    },
    {
      key: "certainProvider",
      label: providersData?.data?.data?.find(p => p.id === filterData?.certainProvider)?.name,
    },
  ];

  return (
    <Box sx={{ width: "100%", p: "24px" }}>
      <StockFilter
        open={openFilter}
        handleClose={() => setOpenFilter(false)}
        fetchedProducts={fetchedProducts}
        warehouseData={warehouseList}
        setFilterData={setFilterData}
        filterData={filterData}
        providersData={providersData}
      />

      <StoreKeeperHistory
        open={openSKHistory}
        handleClose={() => setOpenSKHistory(false)}
        row={rowData}
        flag="StoreKeeperHistory"
      />

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", pb: "24px" }}>
          <Typography variant="h2">
            <FormattedMessage id="stock.stock" />
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}>
          <FormControl variant="standard">
            <OutlinedInput
              placeholder={intl.formatMessage({ id: "countries.search" })}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
              startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
            />
          </FormControl>

          {loading && <CircularProgress />}

          <Box>
            <Button sx={{ mx: 3, px: 2, py: 1 }} variant="contained" onClick={() => setOpenFilter(true)}>
              <Typography variant="h3"><FormattedMessage id="weekends.filter" /></Typography>
            </Button>

            <ExportButton loadingExcelData={loadingExcelData} data={excelData} columns={columns} noLastUselessColumns={1} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ mx: 2, display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: "12px" }}>
          {filterChips.map(({ key, label }) => label && (
            <Chip
              key={key}
              label={<Typography variant="label">{label}</Typography>}
              color="primary"
              onDelete={() => setFilterData({ ...filterData, [key]: "" })}
            />
          ))}
        </Box>

        {(filterData?.product || filterData?.warehouse || filterData?.stock) && (
          <Chip
            label={<Typography variant="label"><FormattedMessage id="weekends.clearAll" /></Typography>}
            variant="outlined"
            color="error"
            onClick={() => setFilterData({ stock: "", product: "", warehouse: "" })}
          />
        )}
      </Box>

      <MainTable
        data={data}
        totalCount={totalCount}
        columns={columns}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </Box>
  );
}
