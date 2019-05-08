$(function(){

    chrome.storage.sync.get('keyword',function(keyword){
        $('#keyword').text(keyword);
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
            }
        });
});

var numOfBlocked = 0;