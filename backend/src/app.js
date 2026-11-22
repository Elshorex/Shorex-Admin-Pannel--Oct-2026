import express from 'express';
//import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyparser from 'body-parser';
import cors from 'cors';
import expressValidator from 'express-validator';
import helmet from 'helmet';
import mongoose from 'mongoose';
import url from 'url';
import compression from 'compression' ;
import router from './routes/index.js';
import ApiError from './helpers/ApiError.js';
import logger from 'morgan';               // FIXED
import config from './config.js';

import advertismentsController from '../src/controllers/advertisments.controller/advertisments.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import i18n from 'i18n';   
i18n.configure({
    locales: config.locals,
    directory: path.join(__dirname, 'locales'),
    register: global,
    defaultLocale: 'en'
});
const PORT = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
});

mongoose.connection.once('connected', () => {
  console.log('\x1b[32m%s\x1b[0m', '[DB] Connected...');
  advertismentsController.advertismentJob();
});
mongoose.connection.on('error', err => console.log('\x1b[31m%s\x1b[0m', '[DB] Error : ' + err));
mongoose.connection.on('disconnected', () => console.log('\x1b[31m%s\x1b[0m', '[DB] Disconnected...'));

const app = express();
app.use(compression())
app.use(cors());
app.use(helmet());
app.disable('x-powered-by')
app.use(logger('dev'));
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*")
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
   next();
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/otherImage.png', express.static(path.join(__dirname, '..','./other.png')));
app.use('/assets', express.static(path.join(__dirname, '..','assets')));

app.use((req, res, next)=> {
    i18n.setLocale(req.headers['accept-language'] || 'en');
    return next();
});

// Ensure Content Type
app.use('/', (req, res, next) => {
    // check content type
    let contype = req.headers['content-type'];
    if (contype && !((contype.includes('application/json') || contype.includes('multipart/form-data'))))
        return res.status(415).send({ error: 'Unsupported Media Type (' + contype + ')' });
    // set current host url
    config.appUrl = url.format({
        protocol: req.protocol,
        host: req.get('host')
    });
    next();
});

app.use(bodyparser.json({ limit: '1000mb' }));
app.use(bodyparser.urlencoded({ limit: '1000mb', extended: true, parameterLimit: 50000 }));
// app.use(expressValidator());

// Health check (before 404 handler)
app.get("/welcome", async (req, res) => {
  const { isPostmarkConfigured } = await import("./services/postmarkClient.js");
  res.json({
    status: "ok",
    message: "Backend is running 🚀",
    postmarkConfigured: isPostmarkConfigured(),
    postmarkFrom: config.postmarkFromEmail || null,
  });
});

//Routes
app.use('/', router);
app.use('/.well-known/assetlinks.json',express.static('./assetlinks.json'))

//Not Found Handler
app.use((req, res, next) => {
    next(new ApiError(404, 'Not Found...'));
});

//ERROR Handler
app.use((err, req, res, next) => {
    if (err instanceof mongoose.CastError)
        err = new ApiError.NotFound(err) ||  new ApiError.NotFound(err.model.modelName);
    res.status(err.status || 500).json({
        errors: err.message
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
