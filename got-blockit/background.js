chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "gost");
    var disconnected;
    port.onDisconnect.addListener(function (port) {
        disconnected = true;
    });
    port.onMessage.addListener(function(msg) {
        if (msg.request === "fetchkeywordAndPreference") {
            chrome.storage.sync.get(['keyword', 'disabled'],function(result){
                var keyword = result.keyword;
                if (!keyword) {
                    keyword = '';
                }
                if (!disconnected) {
                    port.postMessage({'keyword': keyword.toLowerCase(), 'disabled': false, 'remoteData': domData, 'spoilerData': spoilerData});
                }
                db.collection("config").doc('dom_structure').get().then((doc) => {
                    domData = doc.data();
                    if (!disconnected && domData) {
                        port.postMessage({'keyword': keyword.toLowerCase(), 'disabled': false, 'remoteData': domData, 'spoilerData': spoilerData});
                    }
                });
                db.collection("config").doc("spoilers").get().then((doc) => {
                    spoilerData = doc.data();
                    if (!disconnected && spoilerData) {
                        port.postMessage({'keyword': keyword.toLowerCase(), 'disabled': false, 'remoteData': domData, 'spoilerData': spoilerData});
                    }
                });

            });
        }
    });
});

var domData;
var spoilerData;
var firebaseConfig = {
    apiKey: "AIzaSyCbCH7CdQJZ0_YIfrtY1EH2Kla_m8zpOj8",
    authDomain: "clean-it-8e8b2.firebaseapp.com",
    databaseURL: "https://clean-it-8e8b2.firebaseio.com",
    projectId: "clean-it-8e8b2",
    storageBucket: "clean-it-8e8b2.appspot.com",
    messagingSenderId: "1077692435214",
    appId: "1:1077692435214:web:b76605e5992c7474"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();





