$(function(){

    $('#keyword').text('arbit');
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
});
