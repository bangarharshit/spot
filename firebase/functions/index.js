const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.getSpoilers = functions.https.onRequest(((request, response) => {
     var db = admin.firestore();

     db.collection('config').doc("spoilers").get()
         .then((doc) => {
          response.send(doc.data());
          return null;
         })
         .catch((err) => {
          console.log('Error getting documents', err);
         });
    })
);