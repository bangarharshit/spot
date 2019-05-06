chrome.runtime.sendMessage({todo: "fetchkeywordAndPreference"}, function (response) {
    if (response.keyword && !response.disabled) {
        var keyword = response.keyword;
        var parentListElement = document.getElementsByClassName('msg-conversations-container__conversations-list')[0];
        parentListElement.addEventListener("DOMNodeInserted", throttle(function (e) {
            $('.msg-conversation-listitem').each(function (index) {
                if (!this.innerText.toLowerCase().includes(keyword)) {
                    this.parentElement.removeChild(this)
                }
            });
            // document.getElementsByClassName('msg-conversation-card')[0].click();
        }, 1500));

    }
});


const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
    }
};