chrome.storage.sync.get(['numOfBlocked','disabledChannels', 'userAddedKeywords', 'disabled'], function (response) {
    if (response.numOfBlocked) {
        numOfBlocked = numOfBlocked + response.numOfBlocked;
    }
    if (response.disabledChannels) {
        disabledChannels = response.disabledChannels;
    }
    if (response.userAddedKeywords) {
        userAddedKeywords = response.userAddedKeywords.split(',');
    }
    if (response.disabled) {
        disabled = response.disabled;
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var senderTabId = sender.tab ? sender.tab.id : request.tabId;
        if (request.id === "countIncrement") {
            numOfBlocked++;
            var currentTabBlockedCount = numBlockedObject[senderTabId];
            if (!currentTabBlockedCount) {
                currentTabBlockedCount = 0;
            }
            currentTabBlockedCount++;
            numBlockedObject[senderTabId] = currentTabBlockedCount;
            chrome.runtime.sendMessage({id: "countIncremented", tabId: senderTabId, currentTabBlockedCount: currentTabBlockedCount});
            if (currentTabBlockedCount > 0) {
                chrome.browserAction.setBadgeText({text: currentTabBlockedCount.toString(), tabId: senderTabId});
            }
            if (numOfBlocked % 10 === 0) { // rate limiting - find a better way.
                chrome.storage.sync.set({'numOfBlocked': numOfBlocked});
            }
        } else if (request.id === "fetchKeywordAndPreference") {
            if (disabled) {
                return;
            }
            sendMessageToContent( 'fetchedKeywordAndPreferences', senderTabId);
        } else if (request.id === 'fetchNumOfBlockedAndTopics'){
            var numBlockedCountForTab = numBlockedObject[senderTabId];
            if (!numBlockedCountForTab) {
                numBlockedCountForTab = 0;
            }
            sendResponse({'numBlockedCountForTab': numBlockedCountForTab, spoilerData: spoilerData});
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
        } else if (request.id === 'saveKeyword') {
            var keyword = request.keyword;
            userAddedKeywords = keyword.split(',');
            chrome.storage.sync.set({'userAddedKeywords': keyword}, function() {
                sendResponse({'id': 'keywordSaved'});
            });
            return true;
        } else if (request.id === 'disableChannel') {
            disabledChannels.push(request.disabledChannel);
            spoilerData = spoilerData.map(recomputeLocalSpoilerData);
            computeSpoilerData();
            chrome.storage.sync.set({'disabledChannels': disabledChannels}, function () {
                sendResponse({'id': 'channelDisabled'});
            });
            return true;
        } else if (request.id === "enableChannel") {

            var enableChannel = request.enabledChannel;
            disabledChannels = disabledChannels.filter(function(value, index, arr){
                return value !== enableChannel;
            });
            spoilerData = spoilerData.map(recomputeLocalSpoilerData);
            computeSpoilerData();
            chrome.storage.sync.set({'disabledChannels': disabledChannels}, function () {
                sendResponse({'id': 'channelEnabled'});
            });
            return true;
        }
    });


const sendMessageToContent = function (id, tabId) {
    chrome.tabs.sendMessage(tabId, {
        'id': id,
        'domData': domData,
        'spoilerData': spoilerDataArray
    });
};

const convertToLocalSpoilerData = function (spoilerDataRemote) {
    return {
        "id": spoilerDataRemote.id,
        "title": spoilerDataRemote.title,
        "disabled": disabledChannels.includes(spoilerDataRemote.id),
        "keywords": JSON.parse(spoilerDataRemote.keywords)
    }
};

const recomputeLocalSpoilerData = function (spoilerData) {
    return {
        "id": spoilerData.id,
        "title": spoilerData.title,
        "disabled": disabledChannels.includes(spoilerData.id),
        "keywords": spoilerData.keywords
    }
};

var numBlockedObject = {};
var numOfBlocked = 0;

const HOST_LIST_DOM = {
    "facebook.com": 'div[data-testid="fbfeed_story"], div[role="article"], #pagelet_trending_tags_and_topics ul > li',
    "news.google": 'a[target="_blank"]',
    "reddit.com": '.scrollerItem',
    "slack.com": 'ts-message',
    "twitter.com": "[data-item-type='tweet'], .trend-item",
    "youtube.com": '.yt-lockup, .related-list-item, .comment-renderer-text, ytd-grid-video-renderer, .ytd-video-renderer',
    "quora.com": '.feed_item, .QueryResult ',
    "instagram.com": 'article',
    "linkedin.com": '.feed-shared-update-v2, .feed-shared-update-v2--e2e, .feed-shared-update--chat-ui, .feed-shared-update-v2--minimal-padding'
};
var domData = HOST_LIST_DOM;


const SPOILER_WORDS_LIST = ['#got', 'ady stonehea', 'aidan gillen', 'alfie allen', 'arya stark', 'asoiaf', 'azor ahai', 'baelish', 'baratheon', 'ben crompton', 'bloodraven', 'braavos', 'bran stark', 'briene of tarth', 'brienne of tarth', 'carice van houten', 'casterly rock', 'cersei ', 'conleth hill', 'd.b. weiss', 'daenerys', 'daniel portman', 'david benioff', 'davos seaworth', 'dornish', 'dothraki', 'dreadfort', 'emilia clarke', 'game of thrones', 'gameofthrone', 'gameofthone', 'gamesofthrone', 'greyjoy', 'gwendoline christie', 'highgarden', 'hodor', 'house bolton', 'house stark', 'house tyrell', 'howland reed', 'iain glen', 'ian mcelhinney', 'iron throne', 'isaac hempstead wright', 'jerome flynn', 'john bradley', 'jojen reed', 'jon snow', 'julian glover', 'khaleesi', "king's landing", 'kit harington', 'kit harrington', 'kristian nairn', 'lanister', 'lannisport', 'lannister', 'lena headey', 'liam cunningham', 'littlefinger', 'maisie williams', 'meereen', 'melisandre', 'michele fairley', 'michelle fairley', 'myrcella', 'natalie dormer', 'nathalie emmanue', 'ned stark', 'nikolaj coster-waldau', 'olenna tyrell', 'peter dinklage', 'podrick payne', 'queen of thorns', 'ramsay bolton', 'roose bolton', 'rory mccann', 'sandor clegane', 'sansa stark', 'sophie turner', 'sothoryos', 'stephen dillane', 'targaryen', 'three eyed raven', 'tower of joy', 'tyrion', 'vaes dothrak', 'viserys', 'walder frey', 'westeros', 'white walker', 'whitewalker', 'wildling', 'winterfell'];

var spoilerData = [
    {
        "id": "got",
        "title": "Game of Thrones",
        "keywords": SPOILER_WORDS_LIST,
        "disabled": false
    }
];
var userAddedKeywords = [];
var disabledChannels = [];
var spoilerDataArray = SPOILER_WORDS_LIST;
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
var disabled;

const computeSpoilerData = function() {
    var spoilerDataArrayLocal = userAddedKeywords;
    spoilerData.forEach( data => {
            if (!data.disabled) {
                spoilerDataArrayLocal = spoilerDataArrayLocal.concat(data.keywords);
            }
        }
    );
    spoilerDataArray = spoilerDataArrayLocal.slice();
};

db.collection("config").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        if (doc.id === "dom_structure") {
            domData = doc.data();
        } else if (doc.id === "spoilers") {
            var spoilerDataWithoutDisabledInfo = doc.data().sources;
            spoilerData = spoilerDataWithoutDisabledInfo.map(convertToLocalSpoilerData);
            computeSpoilerData();
        }
    });
});




