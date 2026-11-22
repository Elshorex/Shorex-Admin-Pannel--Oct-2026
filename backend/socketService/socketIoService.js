import NotificationController from '../src/controllers/notif.controller/notif.controller.js';
import messageController from '../src/controllers/message.controller/message.controller.js';
import User from '../src/models/user.model/user.model.js'
import socketEvents from '../src/socketEvents.js'
import contactUsController from '../src/controllers/contactUs.controller/contactUs.controller.js'
import Company from '../src/models/company.model/company.model.js'
import advertismentController from '../src/controllers/advertisments.controller/advertisments.controller.js';
import issueController from "../src/controllers/issue.controller/issue.controller.js";
import adminController from "../src/controllers/admin.controller/admin.controller.js";
import orderController from '../src/controllers/order.controller/order.controller.js';
import Order from "../src/models/order.model/order.model.js";
import requestMoneyHistoryController from "../src/controllers/requestMoneyHistory.controller/requestMoneyHistory.controller.js"
import userController from '../src/controllers/user.controller/user.controller.js';
import { isNumeric } from '../src/helpers/CheckMethods.js';
import Zone from '../src/models/zone.model/zone.model.js';
import orderHelper from '../src/controllers/order.controller/helpers.js'

let orderPopulateQuery = [
    { path: 'user', model: 'user' },
    { path: 'driver', model: 'user' },
    { path: 'trader', model: 'user' },
    { path: 'products.product', model: 'product', populate: [{ path: 'trader', model: 'user' }, { path: 'productCategory', model: 'productCategory' }] },
    { path: 'address', model: 'address', populate: [{ path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] }] },
    { path: 'promoCode', model: 'promocode' },
];
module.exports = {

    startNotification: function (io) {
        global.notificationNSP = io.of('/utils');
        notificationNSP.on('connection', async function (socket) {
            let id = socket.handshake.query.id;
            let user;
            if (isNumeric(id)) {
                console.log('util id ', id);
                user = await User.findById(id);
            }

            let company = await Company.findOne({ deleted: false });
            if (user) {
                let roomName = 'room-' + id;
                socket.join(roomName);
                console.log('clientttttttt ' + id + ' connected on notification.');
                userController.updateUserSocket(id, user);
                notificationNSP.to(roomName).emit(socketEvents.Company, { company: company });
                await NotificationController.getCountNotification(id);
                // let date = new Date().getTime() - 3600000;
                // let rateQuery = {deleted: false,createdAt:{ $lte: new Date(date) },status: { $in: ['DELIVERED'] }}
                
                // if (user.type == 'INSTITUTION'){
                //     rateQuery.trader = id;
                //     rateQuery.traderRateDriverEmotion = null;
                //     rateQuery.orderType = 'DELIVERY';
                //     await orderHelper.traderOrdersCount(id);
                // } 
                // else if (user.type == 'DRIVER') {

                //     let waitingOrders = await Order.find({type:{$ne:'FAST'} , deleted: false, driver: user.id, status: 'ACCEPTED' }).populate(orderController.populateQuery);
                //     waitingOrders.forEach((o) => {
                //         notificationNSP.to('room-' + id).emit(socketEvents.NewOrder, { order: o });
                //     });

                //     let waitingFastOrders = await Order.find({
                //         type:'FAST' , 
                //         deleted: false, 
                //         driver: null, 
                //         status: 'WAITING' ,
                //         sendedTo:id,
                //         rejectedUsers:{$ne:id},
                //         offers:{ $not: {$elemMatch: {driver: id } } }
                //     }).populate(orderController.populateQuery);
                    
                //     console.log('waitingFastOrderswaitingFastOrders ',id,waitingFastOrders.length)
                //     waitingFastOrders.forEach((o) => {
                //         notificationNSP.to('room-' + id).emit(socketEvents.NewFastOrder, { order: o });
                //     });

                //     rateQuery.driver = id;
                //     rateQuery.$or = [{ driverTraderRateEmotion: null }, { driverClientRateEmotion: null }];

                //     await orderHelper.driverOrdersCount(id);
                //     // let waitingOrder = await Order.findOne({ deleted: false, driver: id, status: 'ACCEPTED' });
                //     // if (waitingOrder) {
                //     //     waitingOrder = await Order.populate(waitingOrder, orderPopulateQuery)
                //     //     notificationNSP.to('room-' + id).emit(socketEvents.NewOrder, { order: waitingOrder });
                //     // }
                // }
                // else if (user.type == 'CLIENT') {
                //     rateQuery.user = id;
                //     rateQuery.$or = [
                //         {type:'NORMAL',traderRateEmotion: null},
                //         {type:'NORMAL',driver:{$ne:null},$or:[{ traderRateEmotion: null }, { driverRateEmotion: null }]},
                //         {type:'FAST',driverRateEmotion: null}
                //     ];
                //     // rateQuery.$or = [{ traderRateEmotion: null }, {driver:{$ne:null}, driverRateEmotion: null }];
                // }
                // let mustRateOrders = await Order.find(rateQuery);

                // mustRateOrders.forEach((o) => {
                //     notificationNSP.to('room-' + id).emit(socketEvents.MustRateOrder, { order: o });
                // })

            } else {
                notificationNSP.emit(socketEvents.Company, { company: company });
            }

        })
    },

    chat: function (io) {
        global.chatNSP = io.of('/chat');
        chatNSP.on('connection', async function (socket) {
            let id = socket.handshake.query.id;
            let roomName = 'room-admin';

            let user;
            if (isNumeric(id)) {
                console.log('chat id ', id);
                user = await User.findById(id);
            }

            // if (user && (user.type != 'ADMIN') &&  (user.type != 'SUB_ADMIN') ) roomName = 'room-' + id;
            if (user) {
                if (['ADMIN','SUB_ADMIN'].includes(user.type)) {
                    socket.join(roomName);
                }
                roomName = 'room-' + id;
                socket.join(roomName);
                console.log('New User Connected ' + id + ' on chat ');
                await messageController.countUnseen(id)
                socket.on(socketEvents.Typing, async function (data) {
                    // data =  { to }
                    if (data.to) {
                        chatNSP.to('room-' + data.to).emit(socketEvents.Typing, { user: user });
                    } else {
                        chatNSP.to('room-admin').emit(socketEvents.Typing, { user: user });
                    }
                })
                socket.on(socketEvents.StopTyping, async function (data) {
                    // data =  { to }
                    if (data.to) {
                        chatNSP.to('room-' + data.to).emit(socketEvents.Typing, { user: user });
                    } else {
                        chatNSP.to('room-admin').emit(socketEvents.Typing, { user: user });
                    }
                })
                socket.on(socketEvents.UpdateSeen, async function (data) {
                    console.log('update seeeeeen ')
                    await messageController.updateSeen(id);
                })
            }
        })
    },

    admin: function (io) {
        global.adminNSP = io.of('/admin');
        adminNSP.on('connection', async function (socket) {
            let id = socket.handshake.query.id;

            let user;
            if (isNumeric(id)) {
                console.log('admin id ', id);
                user = await User.findById(id);
            }


            let roomName = 'room-admin';
            socket.join(roomName);
            if (user && user.type == 'SUB_ADMIN') {
                socket.join('room-' + id);
                adminNSP.to('room-' + id).emit(socketEvents.NewUser, { user, user });
            }
            if (user) {
                console.log('New admin Connected ' + id + ' on admin nsp ');
                // await NotificationController.getCountNotification(id, true);
                await messageController.countUnseenForAdmin();
                await messageController.countUnseenSupportChatForAdmin('CLIENT');
                // await messageController.countUnseenSupportChatForAdmin('INSTITUTION');
                // await messageController.countUnseenSupportChatForAdmin('DRIVER');
                // await messageController.countUnseenSupportChatForAdmin('VISITOR');

                await contactUsController.countNotReplied();
                // await advertismentController.countNew();
                // await issueController.countNew();
                // await adminController.count('INSTITUTION');
                // await adminController.count('DRIVER');
                // await orderHelper.TraderNotResponseCount()
                // await orderHelper.notAssignCount()
                // await requestMoneyHistoryController.countNew();
            }
        })
    },

    startTracking: function (io) {

        global.trackingNSP = io.of('/track');
        trackingNSP.on('connection', async function (socket) {
            let id = socket.handshake.query.id;
            let user;
            if (isNumeric(id)) {
                console.log('track id ', id);
                user = await User.findById(id);
            }
            if (user) {
                let roomName = 'room-' + id;
                socket.join(roomName);
                console.log('clientttttttt ' + id + ' connected on tracking.');
                socket.on(socketEvents.NewLocation, async function (data) {
                    if (data && data.long && data.lat) {
                        let newLoc = { type: 'Point', coordinates: [data.long, data.lat] };
                        await User.findByIdAndUpdate(id, { $set: { geoLocation: newLoc } });
                        await Zone.findOneAndUpdate({ driver: id, deleted: false }, { $set: { currentDriverLocation: newLoc } });
                        if (data.order) {
                            let order = await Order.findById(data.order).populate([{ path: 'driver', model: 'user' }]);
                            if (order) {
                                if (order.driver) {
                                    trackingNSP.to('room-' + order.user).emit(socketEvents.NewLocation, { order: order });
                                    trackingNSP.to('room-' + order.trader).emit(socketEvents.NewLocation, { order: order });

                                }
                            }
                        }
                    }
                })
            }
        })
    }
}