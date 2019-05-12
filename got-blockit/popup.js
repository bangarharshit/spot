document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            id: 'fetchNumOfBlocked'
        });
    });

    chrome.storage.sync.get(['gos_keyword', 'numOfBlocked'],function(response){
        if (response.gos_keyword) {
            document.getElementById("keyword_input").value = response.gos_keyword;
        }
        if (response.numOfBlocked) {
            remoteNumOfBlocked = response.numOfBlocked;
            blockedTextFunc(0, remoteNumOfBlocked);
        }
    });

    $("#keyword_submit_button").on('click', function(event){
        var newKeyWord = $('#keyword_input').val();
        if (newKeyWord){
            chrome.storage.sync.set({'gos_keyword': newKeyWord.toLowerCase()}, function() {
                refreshFeed();
            });
        }
    });

    $('#div_pause_gos').on('click', function (event) {
        chrome.storage.sync.set({'disabled': true}, function() {
            $('#div_domain_paused_gos').show();
            $('#div_pause_gos').hide();
            refreshFeed();
        });
    });

    $('#div_domain_paused_gos').on('click', function (event) {
        chrome.storage.sync.set({'disabled': false}, function() {
            $('#div_pause_gos').show();
            $('#div_domain_paused_gos').hide();
            refreshFeed();
        });
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.id === "fetched_count") {
                const numBlockedCountForTab = request.numBlockedCountForTab;
                blockedTextFunc(numBlockedCountForTab, numBlockedCountForTab+remoteNumOfBlocked);
            }
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
