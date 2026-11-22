import Complaint from '../../models/complaint.model/complaint.model.js';
import { body } from 'express-validator';
import { checkValidations, handleImg } from '../shared.controller/shared.controller.js';
import { checkExistThenGet } from '../../helpers/CheckMethods.js';
import ApiResponse from '../../helpers/ApiResponse.js';
import ApiError from '../../helpers/ApiError.js';
import { generateVerifyCode } from '../../services/generator-code-service.js'
import i18n from 'i18n';
import moment from 'moment';
import Message from '../../models/message.model/message.model.js';
import User from '../../models/user.model/user.model.js';
import socketEvents from '../../socketEvents.js'
import reasoneModel from '../../models/reasone.model/reasone.model.js';
let populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'respondingBy', model: 'user' },
    { path: 'reasone', model: 'reasone' }
];


let countUnInformed = async () => {
    try {
        let count = await Complaint.count({ deleted: false, adminInformed:  false  });
        adminNSP.emit(socketEvents.ComplaintCount, { count: count });
    } catch (error) {
        throw error;
    }
}

export default {
    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { deleted: false };
            let { status, user, name,userType, title, number, month, year, archive,firebaseToken} = req.query;

            if (firebaseToken) {
                query.firebaseToken=firebaseToken
            }
            if (archive) query.deleted = true;
            if (userType) {
                query.userType = userType
            }
            if (status) query.status = status;
            if (user) query.user = user;
            if (number) query.number = number;
            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (title) {
                query.$or = [{ 'title.en': { '$regex': title, '$options': 'i' } }, { 'title.ar': { '$regex': title, '$options': 'i' } }]
            }
            if (month && year) {
                let date = new Date();
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (year && !month) {
                let date = new Date();
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            let allDocs = await Complaint.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            allDocs = Complaint.schema.methods.toJSONLocalizedOnly(allDocs, i18n.getLocale());

            let totalCount = await Complaint.count(query);
            let pageCount = Math.ceil(totalCount / limit);
            res.send(new ApiResponse(allDocs, page, pageCount, limit, totalCount, req));
            if ((req.user.type == 'ADMIN') || (req.user.type == 'SUB_ADMIN')) {
                await Complaint.updateMany({ deleted: false, adminInformed: false }, { $set: { adminInformed: true } });
                adminNSP.emit(socketEvents.ComplaintCount, { count: 0 });
            }
        } catch (error) {
            next(error)
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('title').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.en').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
                body('reasone').optional().not().isEmpty().withMessage(() => { return i18n.__('reasoneRequired') })
                .custom(async(reasone)=>{
                    await checkExistThenGet(reasone,reasoneModel,{deleted:false});
                    return true;
                })
            ];
        }
        else {
            validations = [
                body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('title').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
                body('reasone').optional().not().isEmpty().withMessage(() => { return i18n.__('reasoneRequired') })
                .custom(async(reasone)=>{
                    await checkExistThenGet(reasone,reasoneModel,{deleted:false});
                    return true;
                })
            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            validatedBody.user = user.id;
            validatedBody.userType = user.type;
            let createdComplaint = await Complaint.create(validatedBody);
            if (!validatedBody.number) {
                createdComplaint.number = '100' + createdComplaint.id;
                await createdComplaint.save();
            }
            res.status(200).send(createdComplaint);
            await countUnInformed();
        } catch (error) {
            next(error)
        }
    },
    async findById(req, res, next) {
        try {
            let { id } = req.params;
            let { removeLanguage } = req.query;
            let complaint = await checkExistThenGet(id, Complaint, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                complaint = await Complaint.schema.methods.toJSONLocalizedOnly(complaint, i18n.getLocale());
            }
            res.status(200).send(complaint);
        } catch (error) {
            next(error)
        }
    },
    async update(req, res, next) {
        try {
            let { id } = req.params;
            let { removeLanguage } = req.query;
            let complaint = await checkExistThenGet(id, Complaint, { deleted: false, user: req.user.id });
            let validatedBody = checkValidations(req);
            let updatedComplaint = await Complaint.findByIdAndUpdate(id, validatedBody, { new: true }).populate(populateQuery)
            if (!removeLanguage) {
                updatedComplaint = await Complaint.schema.methods.toJSONLocalizedOnly(updatedComplaint, i18n.getLocale());
            }
            res.status(200).send(updatedComplaint);
        } catch (error) {
            next(error)
        }
    },
    async delete(req, res, next) {
        try {
            let { id } = req.params;
            let complaint = await checkExistThenGet(id, Complaint, { deleted: false });
            complaint.deleted = true;
            await complaint.save();
            res.status(200).send('Deleted Successfully');
            await Message.updateMany({ deleted: false, complaint: id }, { deleted: true })
        } catch (error) {
            next(error)
        }
    },
    validateChangeStatus() {
        return [
            body('status').not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                .isIn(['RESPONDING', 'ANSWERED']).withMessage(() => { return i18n.__('wrongType') })
        ]
    },

    async changeStatus(req, res, next) {
        try {
            let user = req.user;
            if ((user.type != 'ADMIN') && (user.type != 'SUB_ADMIN')) {
                return next(new ApiError(403, i18n.__('unauth')));
            }
            let { id } = req.params;
            let complaint = await checkExistThenGet(id, Complaint, { deleted: false, status: { $in: ['WAITING', 'RESPONDING'] } });
            let validatedBody = checkValidations(req);
            validatedBody.respondingBy = user.id;
            complaint = await Complaint.findByIdAndUpdate(id, validatedBody, { new: true });
            res.status(200).send(complaint)
        } catch (error) {
            next(error);
        }
    },
    countUnInformed,


    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray().withMessage('must be array'),
        ];
    },
    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await Complaint.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },

    validateVisitor() {
        let  validations = [
                body('reasone').optional().not().isEmpty().withMessage(() => { return i18n.__('reasoneRequired') })
                .custom(async(reasone)=>{
                    await checkExistThenGet(reasone,reasoneModel,{deleted:false});
                    return true;
                }),
                body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('title').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.en').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
                body('firebaseToken').not().isEmpty().withMessage(() => { return i18n.__('firebaseTokenRequired') }),
            ];
        
        return validations;
    },

    async createVisitorComplain(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            validatedBody.userType = 'VISITOR'
            let createdComplaint = await Complaint.create(validatedBody);
            if (!validatedBody.number) {
                createdComplaint.number = '100' + createdComplaint.id;
                await createdComplaint.save();
            }
            res.status(200).send(createdComplaint);
            await countUnInformed();
        } catch (error) {
            next(error)
        }
    }, 
    
    async closeComplain(req, res, next){
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let { id } = req.params;
            let complaint = await checkExistThenGet(id, Complaint, { deleted: false });
            complaint.closed = true;
            await complaint.save();
            res.status(200).send({complaint});

            if (complaint.user) {
                notificationNSP.to('room-' + complaint.user).emit(socketEvents.CloseComplain, { complaint });
            }
        } catch (error) {
            next(error);
        }
    },

    async getCurrentUserComplain(req, res, next){
        try {
            let user = req.user;
            let complaint = await Complaint.findOne({ deleted: false ,user:user.id,closed:false}) ;
            res.status(200).send({complaint});
        } catch (error) {
            next(error);
        }
    },

    async getCurrentVisitorComplain(req, res, next){
        try {
            let {firebaseToken} = req.query;
            if (!firebaseToken) {
                return next(new ApiError(404,i18n.__('firebaseTokenRequired')))
            }
            let complaint = await Complaint.findOne({ deleted: false ,firebaseToken,closed:false}) ;
            res.status(200).send({complaint});
        } catch (error) {
            next(error);
        }
    }
}
