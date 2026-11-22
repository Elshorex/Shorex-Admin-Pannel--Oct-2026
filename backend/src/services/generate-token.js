import config from '../config.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const generateEmailToken = (email) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const resetToken = jwt.sign({ token, email }, config.SECRET_KEY, { expiresIn: '1h' });
        return resetToken;
    } catch (error) {
        return '';
    }
};