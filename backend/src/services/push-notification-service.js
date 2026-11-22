// import * as admin from 'firebase-admin';

// import fs from 'fs';
// import path from 'path';

// const serviceAccountPath = path.resolve('./serviceAccount.json');
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://fcm-tests-d7344.firebaseio.com'
// });


// For PRODUCTION

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname workaround in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your service account JSON
const serviceAccountPath = path.join(__dirname, '../../serviceAccount.json');

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Firebase service account JSON not found at ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fcm-tests-d7344.firebaseio.com'
});



export async function sendPushNotification(notifi) {

    try {
        
        for (let index = 0; index < notifi.targetUser.tokens.length; index++) {
		//   console.log('hi ',notifi)
            let userToken = notifi.targetUser.tokens[index].token;
            if (notifi.targetUser.tokens[index].type == 'android') {
                let payload = { token: userToken};
                payload.data = {
                    title: notifi.title.toString(),
                    message: notifi.text,
                    subjectId: notifi.subjectId.toString(),
                    subjectType: notifi.subjectType,
                    priority: "max",
                    visibility: "public",
                    importance: "max",

                }
                payload.notification = {
                    title: notifi.title.toString(),
                    body: notifi.text,
                }
                if(notifi.image && notifi.image != ''){
                    payload.data.image = notifi.image;
                    payload.data.badge = notifi.image;
                    payload.notification.image = notifi.image;
                }
                // console.log(payload)
                admin.messaging().send(payload)
                    .then(response => {
                        console.log('Successfully sent a message');
                    })
                    .catch(error => {
                        console.log('Error sending a message:', error.message);
                    });
            } else {

                let payload = {
                    notification: {
                        title: notifi.title.toString(),
			
                        body: notifi.text,
                        sound: 'default',
                        badge: '1'
                    },
                    data: {
                        message: notifi.text,
                        subjectId: notifi.subjectId.toString(),
                        subjectType: notifi.subjectType,
                    }
                };
                if(notifi.image && notifi.image != ''){
                    payload.data.image = notifi.image;
                    payload.data.badge = notifi.image;
                    payload.notification.image = notifi.image;
                }
                admin.messaging().sendToDevice(userToken, payload)
                    .then(response => {
                        console.log('Successfully sent a message');
                    })
                    .catch(error => {
                        console.log('Error sending a message:', error);
                    });
            }
        }
    } catch (error) {
        console.log('fire base error -->  ', error.message);
    }
}

export async function sendPushNotificationToGuests(notifi) {
    let payload = {
        data: {
            message: notifi.text,
            subjectId: notifi.subjectId.toString(),
            subjectType: notifi.subjectType
        },
        token: notifi.targetUser
    }
    admin.messaging().send(payload)
        .then(response => {
            console.log('Successfully sent a message');
        })
        .catch(error => {
            console.log('Error sending a message:', error.message);
        });
}

export async function testDifferentPayLoad(payload) {
    let c = await User.find({ deleted: false });
    for (let index = 0; index < c.length; index++) {
        for (let i = 0; i < c[index].token.length; i++) {
            payload.token = c[index].token[i];
            admin.messaging().send(payload)
                .then(response => {
                    console.log('Successfully sent a message');
                })
                .catch(error => {
                    console.log('Error sending a message:', error.message);
                });

        }

    }

}