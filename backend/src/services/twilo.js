import { generateToken } from '../../src/utils/token.js';
import ApiError from '../helpers/ApiError.js';
import i18n from 'i18n';
import Config from '../config.js';
import ConfirmationCode from '../models/confirmationsCodes.model/confirmationscodes.model.js';
import twilio from 'twilio';

const accountSid = Config.twilioAccountSID;
const authToken = Config.twilioAuthToken;
const verifyServiceId = Config.twilioServiceSID;

const client = twilio(accountSid, authToken);


let twilioSend = (number, ar = 'ar') => {
    try {
        client.verify.services(verifyServiceId)
            .verifications
            // .create({ to: number, channel: 'sms', locale: ar })
            .create({ to: '+923197463499', channel: 'sms', locale: ar })
            .then(verification => {
                console.log('Twilio verification Sent');
            }).catch(error => console.log(error));
    } catch (error) {
        console.log('error in twilio ==> ', error)
    }
}

let twilioVerify = async (phone, code, user, res, next,originPhone) => {
    try {
        client.verify.services(verifyServiceId)
            .verificationChecks
            .create({ to: phone, code: code })
            .then(async (verification_check) => {
                if (verification_check.valid == true) {
                    if (user) {
                        user.verify = true;
                        await user.save();
                        res.status(200).send({
                            user: user,
                            token: generateToken(user.id)
                        });
                    } else {
                        let confirmCode = await ConfirmationCode.findOne({ phone: originPhone, type: 'PHONE' });
                        if (confirmCode) {
                            confirmCode.verified = true;
                            await confirmCode.save();
                            res.status(200).send(i18n.__('CodeSuccess'));
                        }else{
                            let confirmCode = new ConfirmationCode({ phone: originPhone, type: 'PHONE',verified:true });
                            await confirmCode.save();
                            res.status(200).send(i18n.__('CodeSuccess'));
                        }
                    }
                } else {
                    next(new ApiError(400, i18n.__('invalid_code')));
                }
            }).catch(error => {
                next(new ApiError(400, i18n.__('expired_code')));
            })
    } catch (error) {
        next(error)
    }
}

export { twilioVerify, twilioSend };


