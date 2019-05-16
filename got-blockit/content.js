$document = $(document);

const feedSelectorFunc = function(url, domRegexp, domArray) {
    var host = url.match(domRegexp);
    if (host) {
        return {
            "identifier": domArray[host],
            "host": host
        };
    }
};

const cleanFeed = function(feedSelector, regex) {
    $(feedSelector.identifier).each(function (index) {
        if (this.classList.contains('glamoured')) {
            return;
        }
        let divHeight = $(this).height();
        let matchedSpoiler = this.textContent.match(regex);
        if (matchedSpoiler) {
            chrome.runtime.sendMessage({id: "countIncrement"});
            exileTraitorousSpoiler($(this), matchedSpoiler[0], isBigDom(divHeight));
        }
    });
};



const exileTraitorousSpoiler = function($traitor, dark_words_of_spoilage, isBigDom) {
    var $glamour, capitalized_spoiler_words, glamour_string;
    capitalized_spoiler_words = dark_words_of_spoilage.capitalizeFirstLetter();
    $traitor.addClass('glamoured');
    if (isBigDom) {
        glamour_string = "<div class='spoiler-glamour'> <h3 class='spoiler-obituary'> A potential spoiler here is detected as the post mentions<b> " + capitalized_spoiler_words + "</b>.</h3> <h3 class='reveal-button'>REVEAL</h3> </div>";
    } else {
        glamour_string = "<div class='spoiler-glamour'> <h3 class='spoiler-obituary-small'> A potential spoiler here is detected as the post mentions<b> " + capitalized_spoiler_words + "</b>. <u class='reveal-button-small'>REVEAL</u> </h3></div>";
    }
    $(glamour_string).appendTo($traitor);
    $glamour = $traitor.find('.spoiler-glamour');
    var $revealButton;
    if(isBigDom) {
        $revealButton = $traitor.find('.reveal-button');
    } else {
        $revealButton = $traitor.find('.reveal-button-small');
    }
    return $revealButton.on('click', function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        if (!confirm("Are you sure you want to view this potentially spoiler-ific " + capitalized_spoiler_words + "?")) {
            return;
        }
        $glamour.addClass('revealed');
        return setTimeout((function() {
            return $glamour.remove();
        }), 3500);
    });
};

const isBigDom = function(divHeight) {
  return divHeight > 200;
};

$document.ready(function() {
    chrome.runtime.onMessage.addListener(function(msg) {
        if (msg.id === "fetchedKeywordAndPreferences") {
            var url = window.location.toString().toLowerCase();
            const domData = msg.domData;
            const spoilerData = msg.spoilerData;
            const domRegex = new RegExp(Object.keys(domData).join('|'), 'i');
            const regExp = new RegExp(spoilerData.join('|'), 'i');
            const feedSelector = feedSelectorFunc(url, domRegex, domData);
            if (feedSelector) {
                cleanFeed(feedSelector, regExp);
                if (eventListener) {
                    document.removeEventListener("DOMNodeInserted", eventListener);
                }
                eventListener = eventListenerFunc(feedSelector, regExp);
                document.addEventListener("DOMNodeInserted", eventListener);
            }
        }
    });
    chrome.runtime.sendMessage({id: "fetchKeywordAndPreference"});
});

const eventListenerFunc = function(feedSelector, regex) {
  return throttle(function (e) {
      cleanFeed(feedSelector, regex);
  }, 2000);
};

var eventListener;


const GOT_RELATED_SUBREDDITS = ['gameofthrones', 'asoiaf', 'iceandfire', 'agotboardgame', 'gamesofthrones', 'westeros', 'thronescomics', 'asongofmemesandrage', 'earthoficeandfire'];

const GOT_SUBREDDITS_REGEX = new RegExp('(\/r\/)' + GOT_RELATED_SUBREDDITS.join('|'), 'i');