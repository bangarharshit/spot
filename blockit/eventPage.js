chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'www.linkedin.com', pathContains: 'messaging'}
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (request.todo === 'fetchkeywordAndPreference') {
        chrome.storage.sync.get(['keyword', 'disabled'],function(result){
            if (result.keyword) {
                sendResponse({'keyword': result.keyword.toLowerCase(), 'disabled': true});
            }
        });
    }
    return true
});






