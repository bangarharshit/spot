document.addEventListener('DOMContentLoaded', function () {
    sendEvent("popup", "impression");
    chrome.storage.sync.get(['userAddedKeywords', 'numOfBlocked', 'disabled'],function(response){
        if (response.userAddedKeywords) {
            document.getElementById("keyword_input").value = response.userAddedKeywords;
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
            if (request.id === "countIncremented") {
                chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
                    var currentTabId = arrayOfTabs[0].id;
                    if (currentTabId === request.tabId) {
                        var currentTabBlockedCount = request.currentTabBlockedCount;
                        blockedTextFunc(currentTabBlockedCount, currentTabBlockedCount + remoteNumOfBlocked);
                    }
                })
            }
        });

    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.runtime.sendMessage({id: 'fetchNumOfBlockedAndTopics', tabId: arrayOfTabs[0].id}, function (response) {
            const numBlockedCountForTab = response.numBlockedCountForTab;
            const spoilerData = response.spoilerData;
            spoilerData.forEach(
                indSpoilerData => {
                    $('#spoiler_list').append(indSpoilerDiv(indSpoilerData.title, indSpoilerData.id, indSpoilerData.disabled));
                }
            );
            blockedTextFunc(numBlockedCountForTab, numBlockedCountForTab+remoteNumOfBlocked);
        });
    });


    $(document).on('change', 'input[type=checkbox]', function(e) {
        if($(this).is(':checked')) {
            sendEvent(this.id, 'enabled');
            chrome.runtime.sendMessage({'id': 'enableChannel', 'enabledChannel': $(this).attr('id')}, function (response) {
                refreshFeed();
            });
        } else {
            sendEvent(this.id, 'disabled');
            chrome.runtime.sendMessage({'id': 'disableChannel', 'disabledChannel': $(this).attr('id')}, function (response) {
                refreshFeed();
            });
        }
    });


    $("#keyword_submit_button").on('click', function(event){
        sendEvent(this.id, 'click');
        var newKeyWord = $('#keyword_input').val();
        chrome.runtime.sendMessage({'id': 'saveKeyword', keyword: newKeyWord.toLowerCase()}, function (response) {
            refreshFeed();
        })
    });

    $('#div_pause_gos').on('click', function (event) {
        sendEvent(this.id, 'click');
        chrome.runtime.sendMessage({'id': 'pause'}, function (response) {
            $('#div_resume_gos').show();
            $('#div_pause_gos').hide();
            refreshFeed();
        });
    });

    $('#bugreport').on('click', function (event) {
        sendEvent(this.id, 'click');
    });
    $('#div_resume_gos').on('click', function (event) {
        chrome.runtime.sendMessage({'id': 'resume'}, function (response) {
            $('#div_pause_gos').show();
            $('#div_resume_gos').hide();
            refreshFeed();
        });
        sendEvent(this.id, 'click');
    });
});

const sendEvent = function (elementId, eventName) {
    chrome.runtime.sendMessage({'id': 'event', elementId: elementId, eventName: eventName})
};

const refreshFeed = function () {
    chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
        chrome.tabs.reload(arrayOfTabs[0].id);
    });
};

const blockedTextFunc = function (localNum, numTotal) {
    $('#page_blocked_count').text(localNum);
    $('#total_blocked_count').text(numTotal);
};

const indSpoilerDiv = function (title, id, disabled) {
 return "<div class='menu-entry'>" + title + "<span class='right'><input name='checkbox' type='checkbox' id='"+ id + "'" + (!disabled ? "checked": "") + "></span></div>";
};

var remoteNumOfBlocked = 0;
