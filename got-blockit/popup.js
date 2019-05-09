document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            id: 'fetch_url'
        });
    });

    chrome.storage.sync.get(['keyword', 'numOfBlocked'],function(response){
        if (response.keyword) {
            document.getElementById("keyword").value = response.keyword;
        }
        if (response.numOfBlocked) {
            numOfBlocked = response.numOfBlocked;
            blockedTextFunc(0, numOfBlocked);
        }
    });


    $('#keywordsubmit').click(function(){
        var newKeyWord = $('#keyword').val();
        if (newKeyWord){
            chrome.storage.sync.set({'keyword': newKeyWord.toLowerCase()}, function(){
                chrome.tabs.query({active:true,currentWindow: true}, function(tabs){
                    chrome.tabs.reload(tabs[0].id);
                });
            });
        }
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.id === "count_increment") {
                localNumOfBlocked ++;
                numOfBlocked++;
                blockedTextFunc(localNumOfBlocked, numOfBlocked);
            } else if (request.id === "site_not_supported") {
                $('#enable_plugin_text').text(request.url + ' is not supported.');
            } else if (request.id === 'url_fetched') {
                $('#disabled_plugin').hide();

                $('#enable_plugin_text').text("Enable Game of spoils on " + request.host + ".");
                $('#enable_plugin_button').show();
            }
        });
});

const blockedTextFunc = function (localNum, numTotal) {
    $('#num_terms_blocked').text("Blocked on this page: " + localNum + ". Total blocked: " + numTotal);
};

var numOfBlocked = 0;
var localNumOfBlocked = 0;