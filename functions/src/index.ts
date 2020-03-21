import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp();

exports.getVineyards = functions.https.onRequest(async(req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        res.status(500).send({ error: 'no userid provided'});
    } else {
        res.status(200).send({ vineyards: []});
    }
});