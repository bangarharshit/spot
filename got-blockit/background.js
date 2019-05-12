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
                var currentTabBlockedCount = numBlockedObject[tabId];
                if (!currentTabBlockedCount) {
                    currentTabBlockedCount = 0;
                }
                currentTabBlockedCount++;
                numBlockedObject[tabId] = currentTabBlockedCount;
                chrome.runtime.sendMessage({id: "count_incremented", tabId: tabId, currentTabBlockedCount: currentTabBlockedCount});
                if (currentTabBlockedCount > 0) {
                    chrome.browserAction.setBadgeText({text: currentTabBlockedCount.toString(), tabId: tabId});
                }
            });
            if (numOfBlocked % 50 === 0) { // rate limiting - find a better way.
                chrome.storage.sync.set({'numOfBlocked': numOfBlocked});
            }
        } else if (request.id === "fetchkeywordAndPreference") {
            chrome.storage.sync.get(['gos_keyword', 'disabled'],function(result){
                if (result.disabled) {
                    return;
                }
                var extra_keyword = result.gos_keyword;
                if (!extra_keyword) {
                    extra_keyword = '';
                }
                sendMessageToContent( 'fetchedkeywordAndPreferences', extra_keyword.toLowerCase());
                db.collection("config").doc('dom_structure').get().then((doc) => {
                    domData = doc.data();
                    if (domData) {
                        sendMessageToContent( 'fetchedkeywordAndPreferences', extra_keyword.toLowerCase());
                    }
                });
                db.collection("config").doc("spoilers").get().then((doc) => {
                    spoilerData = doc.data();
                    if (spoilerData) {
                        sendMessageToContent( 'fetchedkeywordAndPreferences', extra_keyword.toLowerCase());
                    }
                });
            })
        } else if (request.id === 'fetchNumOfBlocked'){
            var tabId = request.tabId;
            var numBlockedCountForTab = numBlockedObject[tabId];
            if (!numBlockedCountForTab) {
                numBlockedCountForTab = 0;
            }
            chrome.runtime.sendMessage({'id': 'fetched_count', 'numBlockedCountForTab': numBlockedCountForTab});
        } else if (request.id === 'pause') {
            chrome.storage.sync.set({'disabled': true}, function() {
                chrome.runtime.sendMessage({'id': 'paused'});
            });
        } else if (request.id === 'resume') {
            chrome.storage.sync.set({'disabled': false}, function() {
                chrome.runtime.sendMessage({'id': 'resumed'});
            });
        } else if (request.id === 'save_keyword') {
            chrome.storage.sync.set({'gos_keyword': request.keyword}, function() {
                chrome.runtime.sendMessage({'id': 'keyword_saved'});
            });
        }
    });


const sendMessageToContent = function (id, keyword) {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        if (arrayOfTabs[0]) {
            chrome.tabs.sendMessage(arrayOfTabs[0].id, {
                'id': id,
                'keyword': keyword,
                'remoteData': domData,
                'spoilerData': spoilerData
            });
        }
    });
};

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




