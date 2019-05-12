chrome.runtime.onConnect.addListener(function(port) {
});
chrome.storage.sync.get('numOfBlocked', function (response) {
    if (response.numOfBlocked) {
        numOfBlocked = numOfBlocked + response.numOfBlocked;
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.id === "count_increment") {
            numOfBlocked++;
            chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
                var tabId = arrayOfTabs[0].id;
                var currentBlockedCount = numBlockedObject[tabId];
                if (currentBlockedCount) {
                    currentBlockedCount++;
                } else {
                    currentBlockedCount = 1;
                }
                numBlockedObject[tabId] = currentBlockedCount;
                chrome.runtime.sendMessage({id: "count_incremented", tabId: tabId, currentBlockedCount: currentBlockedCount});
                if (localNumOfBlocked > 0) {
                    chrome.browserAction.setBadgeText({text: currentBlockedCount.toString(), tab: arrayOfTabs[0].id});
                }
            });
            if (numOfBlocked % 50 === 0) { // rate limiting - find a better way.
                chrome.storage.sync.set({'numOfBlocked': numOfBlocked});
            }
        } else if (request.id === "fetchkeywordAndPreference") {
            chrome.storage.sync.get(['gos_keyword', 'disabled'],function(result){
                if (!result.disabled) {
                    result.disabled = false;
                }
                var extra_keyword = result.gos_keyword;
                if (!extra_keyword) {
                    extra_keyword = '';
                }
                chrome.runtime.sendMessage({'id': 'fetchedkeywordAndPreferences', 'keyword': extra_keyword.toLowerCase(), 'disabled': result.disabled, 'remoteData': domData, 'spoilerData': spoilerData});
                db.collection("config").doc('dom_structure').get().then((doc) => {
                    domData = doc.data();
                    if (domData) {
                        chrome.runtime.sendMessage({'id': 'fetchedkeywordAndPreferences','keyword': extra_keyword.toLowerCase(), 'disabled': result.disabled, 'remoteData': domData, 'spoilerData': spoilerData});
                    }
                });
                db.collection("config").doc("spoilers").get().then((doc) => {
                    spoilerData = doc.data();
                    if (spoilerData) {
                        chrome.runtime.sendMessage({'id': 'fetchedkeywordAndPreferences', 'keyword': extra_keyword.toLowerCase(), 'disabled': result.disabled, 'remoteData': domData, 'spoilerData': spoilerData});
                    }
                });
            })
        } else if (request.id === 'fetchNumOfBlocked'){
            var tabId = request.tabId;
            var numBlockedCountForTab = numBlockedObject[tabId];
            chrome.runtime.sendMessage({'id': 'fetched_count', 'numBlockedCountForTab': numBlockedCountForTab});
        }
    });

var numBlockedObject = {};
var numOfBlocked = 0;
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




