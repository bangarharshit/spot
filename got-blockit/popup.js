document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['gos_keyword', 'numOfBlocked', 'disabled'],function(response){
        if (response.gos_keyword) {
            document.getElementById("keyword_input").value = response.gos_keyword;
        }
        if (response.numOfBlocked) {
            remoteNumOfBlocked = response.numOfBlocked;
            blockedTextFunc(0, remoteNumOfBlocked);
        }
        if (response.disabled) {
            $('#div_resume_gos').show();
            $('#div_pause_gos').hide();
        }
    });
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.id === "fetched_count") {
                const numBlockedCountForTab = request.numBlockedCountForTab;
                blockedTextFunc(numBlockedCountForTab, numBlockedCountForTab+remoteNumOfBlocked);
            } else if (request.id === "count_incremented") {
                chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
                    var currentTabId = arrayOfTabs[0].id;
                    if (currentTabId === request.tabId) {
                        var currentTabBlockedCount = request.currentTabBlockedCount;
                        blockedTextFunc(currentTabBlockedCount, currentTabBlockedCount + remoteNumOfBlocked);
                    }
                })
            } else if (request.id === 'paused') {
                $('#div_resume_gos').show();
                $('#div_pause_gos').hide();
                refreshFeed();
            } else if (request.id === 'resumed') {
                $('#div_pause_gos').show();
                $('#div_resume_gos').hide();
                refreshFeed();
            } else if (request.id === 'keyword_saved') {
                refreshFeed();
            }
        });

    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.runtime.sendMessage({id: 'fetchNumOfBlocked', tabId: arrayOfTabs[0].id});
    });



    $("#keyword_submit_button").on('click', function(event){
        var newKeyWord = $('#keyword_input').val();
        if (newKeyWord){
            chrome.runtime.sendMessage({'id': 'save_keyword', keyword: newKeyWord.toLowerCase()})
        }
    });

    $('#div_pause_gos').on('click', function (event) {
        chrome.runtime.sendMessage({'id': 'pause'});
    });

    $('#div_resume_gos').on('click', function (event) {
        chrome.runtime.sendMessage({'id': 'resume'});
    });
});

const refreshFeed = function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.tabs.reload(arrayOfTabs[0].id);
    });
};

const blockedTextFunc = function (localNum, numTotal) {
    $('#page_blocked_count').text(localNum);
    $('#total_blocked_count').text(numTotal);
};

var remoteNumOfBlocked = 0;
