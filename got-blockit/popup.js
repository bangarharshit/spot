document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            id: 'fetch_url'
        });
    });

    chrome.storage.sync.get('keyword',function(response){
        document.getElementById("keyword").value = response.keyword;
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
                numOfBlocked ++;
                $('#num_terms_blocked').text("We have blocked " + numOfBlocked + " spoilers on " + request.host + ".")
            } else if (request.id === "site_not_supported") {
                $('#num_terms_blocked').text('site not supported');
            } else if (request.id === 'url_fetched') {
                $('#num_terms_blocked').text("We are blocking on " + request.host + ".")
            }
        });
});

var numOfBlocked = 0;