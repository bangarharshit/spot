chrome.storage.sync.get('numOfBlocked', function (response) {
    if (response.numOfBlocked) {
        numOfBlocked = numOfBlocked + response.numOfBlocked;
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var senderTabId = sender.tab ? sender.tab.id : request.tabId;
        if (request.id === "count_increment") {
            numOfBlocked++;
            var currentTabBlockedCount = numBlockedObject[senderTabId];
            if (!currentTabBlockedCount) {
                currentTabBlockedCount = 0;
            }
            currentTabBlockedCount++;
            numBlockedObject[senderTabId] = currentTabBlockedCount;
            chrome.runtime.sendMessage({id: "count_incremented", tabId: senderTabId, currentTabBlockedCount: currentTabBlockedCount});
            if (currentTabBlockedCount > 0) {
                chrome.browserAction.setBadgeText({text: currentTabBlockedCount.toString(), tabId: senderTabId});
            }
            if (numOfBlocked % 50 === 0) { // rate limiting - find a better way.
                chrome.storage.sync.set({'numOfBlocked': numOfBlocked});
            }
        } else if (request.id === "fetchKeywordAndPreference") {
            chrome.storage.sync.get(['gos_keyword', 'disabled'],function(result){
                if (result.disabled) {
                    return;
                }
                var extra_keyword = result.gos_keyword;
                if (!extra_keyword) {
                    extra_keyword = '';
                }
                sendMessageToContent( 'fetchedKeywordAndPreferences', extra_keyword.toLowerCase(), senderTabId);
                db.collection("config").get().then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        if (doc.id === "dom_structure") {
                            domData = doc.data();
                        } else if (doc.id === "spoilers") {
                            spoilerData = doc.data();
                        }
                    });
                    sendMessageToContent( 'fetchedKeywordAndPreferences', extra_keyword.toLowerCase(), senderTabId);
                });
            })
        } else if (request.id === 'fetchNumOfBlocked'){
            var numBlockedCountForTab = numBlockedObject[senderTabId];
            if (!numBlockedCountForTab) {
                numBlockedCountForTab = 0;
            }
            sendResponse({'numBlockedCountForTab': numBlockedCountForTab});
        } else if (request.id === 'pause') {
            chrome.storage.sync.set({'disabled': true}, function() {
                sendResponse({'id': 'paused'});
            });
            return true;
        } else if (request.id === 'resume') {
            chrome.storage.sync.set({'disabled': false}, function() {
                sendResponse({'id': 'resumed'});
            });
            return true;
        } else if (request.id === 'save_keyword') {
            chrome.storage.sync.set({'gos_keyword': request.keyword}, function() {
                sendResponse({'id': 'keyword_saved'});
            });
            return true;
        }
    });


const sendMessageToContent = function (id, keyword, tabId) {
    chrome.tabs.sendMessage(tabId, {
        'id': id,
        'keyword': keyword,
        'remoteData': domData,
        'spoilerData': spoilerData
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




