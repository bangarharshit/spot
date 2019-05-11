document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            id: 'fetch_url'
        });
    });

    chrome.storage.sync.get(['gos_keyword', 'numOfBlocked'],function(response){
        if (response.gos_keyword) {
            document.getElementById("keyword_input").value = response.gos_keyword;
        }
        if (response.numOfBlocked) {
            numOfBlocked = response.numOfBlocked;
            blockedTextFunc(0, numOfBlocked);
        }
    });

    $('#keyword_input').on("change keyword input", throttle(function(e){
        var newKeyWord = $('#keyword_input').val();
        if (newKeyWord){
            chrome.storage.sync.set({'gos_keyword': newKeyWord.toLowerCase()}, function() {

            });
        }
    }, 500));

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.id === "count_increment") {
                localNumOfBlocked ++;
                numOfBlocked++;
                blockedTextFunc(localNumOfBlocked, numOfBlocked);
            } else if (request.id === 'url_fetched') {
                $('#enable_plugin_text').text("Enable Game of spoils on <b>" + request.host + "</b>.");
            }
        });
});

const blockedTextFunc = function (localNum, numTotal) {
    $('#page_blocked_count').text(localNum);
    $('#total_blocked_count').text(numTotal);
};

var numOfBlocked = 0;
var localNumOfBlocked = 0;