import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import BusinessCategories from "../Pages/BusinessCategories";
import Providers from "../Pages/Providers";
import Rewards from "../Pages/Rewards";
import Weekends from "../Pages/Weekends";
import Products from "../Pages/Products";
import RewardedProducts from "../Pages/RewardedProducts";
import Holidays from "../Pages/Holidays";
import Areas from "../Pages/Areas";

const User = lazy(() => import("../components/User"));
const Login = lazy(() => import("../Pages/Login"));
const Layout = lazy(() => import("../components/Layout"));
const Error = lazy(() => import("../components/Error"));
const Cities = lazy(() => import("../Pages/Cities"));
const Countries = lazy(() => import("../Pages/Countries"));
const Regions = lazy(() => import("../Pages/Regions"));
const Drivers = lazy(() => import("../Pages/Drivers"));
const Vehicles = lazy(() => import("../Pages/Vehicles"));
const VehiclesFlow = lazy(() => import("../Pages/VehiclesFlow"));
const Stock = lazy(() => import("../Pages/Stock"));
const Warehouse = lazy(() => import("../Pages/warehouse"));
const DriverFlow = lazy(() => import("../Pages/DriverFlow"));
const AddWarehouse = lazy(() => import("../Pages/warehouseForms/AddWarehouse"));
const UpdatePassword = lazy(() => import("../Pages/UpdatePassword"));
const ForgetPassword = lazy(() => import("../Pages/ForgetPassword"));
const DeleteAccountRequest = lazy(() => import("../Pages/DeleteAccountRequest"));
const StockRequests = lazy(() => import("../Pages/StockRequests"));
const Customer = lazy(() => import("../Pages/Customer"));
const CustomerForm = lazy(() => import("../Pages/customerForm"));
const ViewCustomerDetails = lazy(() => import("../Pages/viewCustomer"));
const ViewRequestDetails = lazy(() => import("../Pages/RequestDetails"));
const PrivacyPolicy = lazy(() => {
  const promise = import("../Pages/policy_terms");
  promise.then((module) => console.log(module)); // Log the resolved module
  return promise;
});
const Promotions = lazy(() => import("../Pages/Promotions"));
const RequestsManagement = lazy(() => import("../Pages/RequestsManagement"));
const Returnables = lazy(() => import("../Pages/Returnables"));
const ViewContactUs = lazy(() => import("../Pages/viewContactUs"));
const ViewProfile = lazy(() => import("../Pages/profile"));
const Notifications = lazy(() => import("../Pages/notifications"));
const RewardsManagement = lazy(() => import("../Pages/RewardsManagement"));
const RecycleSteps = lazy(() => import("../Pages/RecycleSteps"));
const AddStepRecycle = lazy(() => import("../Pages/AddStepRecycle"));
const CreateRoute = lazy(() => import("../components/requests/createRoute"));
const Dashboard = lazy(() => import("../Pages/Dashboard"));
const ChangePassword = lazy(() => import("../Pages/ChangePassword"));

export const AppRoutes = () => {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/updatePassword" element={<UpdatePassword />} />
      <Route path="/forgetPassword" element={<ForgetPassword />} />
      <Route path="/delete-account" element={<DeleteAccountRequest />} />
      <Route path="changePassword" element={<ChangePassword />} />

      <Route path="*" element={<Error />} />

      {/* <Route element={<PrivateRoute allowedUserKeys={['admin' , 'provider']} />}> */}
      {/* private routes */}
      <Route element={<Layout />}>
        <Route
          path="/user"
          element={
            <>
              <PrivateRoute>
                <User />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="/Countries"
          element={
            <>
              <PrivateRoute>
                <Countries />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="/cities/:id"
          element={
            <>
              <PrivateRoute>
                <Cities />
              </PrivateRoute>
            </>
          }
        />
         <Route
          path="/cities"
          element={
            <>
              <PrivateRoute>
                <Cities />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="/regions/:id"
          element={
            <>
              <PrivateRoute>
                <Regions />
              </PrivateRoute>
            </>
          }
        />
         <Route
          path="/regions"
          element={
            <>
              <PrivateRoute>
                <Regions />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="/areas"
          element={
            <>
              <PrivateRoute>
                <Areas />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="/returnables"
          element={
            <>
              <PrivateRoute>
                <Returnables />
              </PrivateRoute>
            </>
          }
        />


        <Route
          path="/"
          element={
            <>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </>
          }
        />
        {/* <Route
          path="home"
          element={
            <>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </>
          }
        /> */}
        <Route
          path="rewards"
          element={
            <>
              <PrivateRoute>
                <Rewards />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="weekends"
          element={
            <>
              <PrivateRoute>
                <Weekends />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="holidays"
          element={
            <>
              <PrivateRoute>
                <Holidays />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="products"
          element={
            <>
              <PrivateRoute>
                <Products />
              </PrivateRoute>
            </>
          }
        />
          <Route
          path="rewardProducts"
          element={
            <>
              <PrivateRoute>
                <RewardedProducts />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="businessCategories"
          element={
            <>
              <PrivateRoute>
                <BusinessCategories />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="providers"
          element={
            <>
              <PrivateRoute>
                <Providers />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="warehouse"
          element={
            <>
              <PrivateRoute>
                <Warehouse />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="driver"
          element={
            <>
              <PrivateRoute>
                <Drivers />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="vehicle"
          element={
            <>
              <PrivateRoute>
                <Vehicles />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="stock"
          element={
            <>
              <PrivateRoute>
                <Stock />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="customer"
          element={
            <>
              <PrivateRoute>
                <Customer />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="dashboard"
          element={
            <>
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="editCustomer"
          element={
            <>
              <PrivateRoute>
                <CustomerForm />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="rewardsManagement"
          element={
            <>
              <PrivateRoute>
                <RewardsManagement />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="stockRequests"
          element={
            <>
              <PrivateRoute>
                <StockRequests />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="VehiclesFlow"
          element={
            <>
              <PrivateRoute>
                <VehiclesFlow />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="driverForm"
          element={
            <>
              <PrivateRoute>
                <DriverFlow />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="createRoute"
          element={
            <>
              <PrivateRoute>
                <CreateRoute />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="warehouse/addWarehouse"
          element={
            <>
              <PrivateRoute>
                <AddWarehouse />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="ViewCustomerDetails"
          element={
            <>
              <PrivateRoute>
                <ViewCustomerDetails />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="ViewRequestDetails"
          element={
            <>
              <PrivateRoute>
                <ViewRequestDetails />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="addStepRecycle"
          element={
            <>
              <PrivateRoute>
                <AddStepRecycle />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="recycleSteps"
          element={
            <>
              <PrivateRoute>
                <RecycleSteps />
              </PrivateRoute>
            </>
          }
        />

        <Route
          path="policy"
          element={
            <>
              <PrivateRoute>
                <PrivacyPolicy />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="terms"
          element={
            <>
              <PrivateRoute>
                <PrivacyPolicy />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="requestsManagement"
          element={
            <>
              <PrivateRoute>
                <RequestsManagement />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="contactUs"
          element={
            <>
              <PrivateRoute>
                <ViewContactUs />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="profile"
          element={
            <>
              <PrivateRoute>
                <ViewProfile />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="promotions"
          element={
            <>
              <PrivateRoute>
                <Promotions />
              </PrivateRoute>
            </>
          }
        />
        <Route
          path="notifications"
          element={
            <>
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            </>
          }
        />
      </Route>
    </Routes>
  );
};

export const Router = () => {
  return (
    <HashRouter>
      <Suspense fallback={<div />}>
        <AppRoutes />
      </Suspense>
    </HashRouter>
  );
};
