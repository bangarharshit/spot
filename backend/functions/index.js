const functions = require('firebase-functions');
// [START firestore_quickstart]
const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore();


exports.getContent = functions.https.onRequest(async (request, response) => {

        const dom_structure = await firestore.collection('config').doc("dom_structure").get();
        const spoilers = await firestore.collection('config').doc('spoilers').get();
        response.send({'dom_structure': dom_structure.data(), spoilers: spoilers.data()});
    }
);


