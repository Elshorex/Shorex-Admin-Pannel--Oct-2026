import express from 'express';
const router = express.Router();





// import ruleRoute from './rule.route/rule.route';
// import assignRuleRoute from './assignRule.route/assignRule.route';
import adminRoute from './admin.route/admin.route.js';
import countryRouter from './country.route/country.route.js';
import cityRouter from './city.route/city.route.js';
import regionRouter from './region.route/region.route.js';
import areaRouter from './area.route/area.route.js';
import languageRouter from './language.route/language.route.js';
import currencyRouter from './currency.route/currency.route.js';
import statusRouter from './status.route/status.route.js';
import adminSiteMapRouter from './admin-site-map.route/admin-site-map.route.js';
import userRoleRouter from './user-roles.route/user-roles.route.js';
import providerRouter from './provider.route/provider.route.js';
import holidayRouter from './holiday.route/holiday.route.js';
import userRoute from './user.route/user.route.js';
// import contactUsRoute from './contactUs.route/contactUs.route';
import categoryRouter from './category.route/category.route.js';
// import subcategoryRouter from './sub-category.route/sub-category.route';
// import productCategoryRouter from './product-category.route/product-category.route';
import productRouter from './product.route/product.route.js';
import rewardedProductsRouter from './rewarded-product.route/rewarded-product.route.js';
import rewardPointRouter from './reward-point.route/reward-point.route.js';
import warehouseRouter from './warehouse.route/warehouse.route.js';
import storeKeeperHistoryRouter from './storekeeper-history.route/storekeeper-history.route.js';
import storeKeeperRouter from './storekeeper.route/storekeeper.route.js';
import trademarkRouter from './trademark.route/trademark.route.js';
import vehicleRouter from './vehicle.route/vehicle.route.js';
import driverRouter from './driver.route/driver.route.js';
import vehicleHistoryRouter from './vehicle-history.route/vehicle-history.route.js';
import stockRouter from './stock.route/stock.route.js';
import requestRouter from './request.route/request.route.js';
import customerRouter from './customer.route/customer.route.js';
import companyRoute from './company.route/company.route.js';
import promotionRoute from './promotion.route/promotion.route.js';
import privacyRoute from './privacy-conditions.route/privacy-conditions.route.js';
import contactusRoute from './contact-us.route/contact-us.route.js';
import recycleRoute from './recycle.route/recycle.route.js';
import claimRequestRouter from './claim-request.route/claim-request.route.js';
import returnableRouter from './returnable.route/returnable.route.js';
import pdfRoute from './pdf.route/pdf.route.js';

// import advertismentsRoute from './advertisment.route/advertisment.route';
// import appadvertismentsRoute from './app-advertisment.route/app-advertisment.route';
// import issueRoute from './issue.route/issue.route';
// import favoriteRoute from './favorites.route/favorites.route';
// import creditRouter from './credit.route/credit.route';
// import orderRouter from './order.route/order.route'
// import addressRoute from './address.route/address.route';
// import shippingRoute from './shipping-card.route/shipping-card.route';
import notificationRouter from './notification.route/notification.route.js';
// import promocodeRoute from './promocode.route/promocode.route';
// import chatRouter from './message.route/message.route';
// import complaintRouter from './complaint.route/complaint.route';
import dashBoardRouter from './dashboard.route/dashboard.route.js';
// import requestMoneyRouter from './requestMoneyHistory.route/requestMoneyHistory.route';
// import zoneRouter from './zone.route/zone.route';
// import paymentRouter from './payment.route/payment.route';
// import paymentRouter from './payment-transaction.route/payment-transaction.route';
// import sliderRoute from './slider.route/slider.route';
// import chairyRoute from './charity.route/charity.route';
// import reasoneRouter from './reasone.route/reasone.route';
// import fastOrderRouter from './order.route/fast-order.route';
// import reportsRouter from './report.route/report.route';
// import introRouter from './intro.route/intro.route';
// import walletTransactionsRouter from './wallet-transactions.route/wallet-transactions.route';
// import branchProductRouter from './branch-product.route/branch-product.route';

router.use('/admin',adminRoute);
router.use('/country',countryRouter);
router.use('/city',cityRouter);
router.use('/region',regionRouter);
router.use('/area',areaRouter);
// router.use('/rules',ruleRoute);
// router.use('/assigRule',assignRuleRoute);
router.use('/language',languageRouter);
router.use('/currency',currencyRouter);
router.use('/status',statusRouter);
router.use('/site-map',adminSiteMapRouter);
router.use('/user-role',userRoleRouter);
router.use('/provider',providerRouter);
router.use('/holiday',holidayRouter);
router.use('/',userRoute);
// router.use('/intro',introRouter);
// router.use('/slider',sliderRoute);
// router.use('/reasone',reasoneRouter)
router.use('/category',categoryRouter);
// router.use('/sub-category',subcategoryRouter)
// router.use('/favorites',favoriteRoute);
// router.use('/credit', creditRouter)
// router.use('/shipping-card',shippingRoute )
// router.use('/address',addressRoute);
// router.use('/charity',chairyRoute);
// router.use('/promocode',promocodeRoute)
router.use('/notification',notificationRouter);
// router.use('/product-category',productCategoryRouter);
router.use('/product',productRouter);
router.use('/reward-products',rewardedProductsRouter);
router.use('/reward-point',rewardPointRouter);
router.use('/warehouse',warehouseRouter);
router.use('/storekeeper-history',storeKeeperHistoryRouter);
router.use('/storekeeper',storeKeeperRouter);
router.use('/trademark',trademarkRouter);
router.use('/vehicle',vehicleRouter);
router.use('/driver',driverRouter);
router.use('/vehicle-history',vehicleHistoryRouter);
router.use('/stock',stockRouter);
router.use('/request',requestRouter);
router.use('/customer',customerRouter);
router.use('/shorex-config',companyRoute);
router.use('/promotion',promotionRoute);
router.use('/privacy-conditions',privacyRoute);
router.use('/contact-us',contactusRoute);
router.use('/recycle',recycleRoute);
router.use('/claim-request',claimRequestRouter);
router.use('/returnables',returnableRouter);
router.use('/returnables',returnableRouter);
router.use('/pdf',pdfRoute);
// router.use('/zone',zoneRouter);
// // router.use('/advertisments',advertismentsRoute);
// // router.use('/app-advertisments',appadvertismentsRoute);
// // router.use('/issue',issueRoute);
// router.use('/contactUs',contactUsRoute);
// router.use('/order', orderRouter);
// router.use('/chat', chatRouter);
// router.use('/complaint', complaintRouter)
// router.use('/fast-order', fastOrderRouter)
router.use('/dashboard',dashBoardRouter);
// // router.use('/requestMoney',requestMoneyRouter);
// router.use('/payment',paymentRouter);
// router.use('/reports',reportsRouter);
// router.use('/points',walletTransactionsRouter);
// router.use('/branch-products',branchProductRouter);


export default router;