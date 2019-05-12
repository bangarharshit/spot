$document = $(document);

const SPOILER_WORDS_LIST = ['#got', 'ady stonehea', 'aidan gillen', 'alfie allen', 'arya stark', 'asoiaf', 'azor ahai', 'baelish', 'baratheon', 'ben crompton', 'bloodraven', 'braavos', 'bran stark', 'briene of tarth', 'brienne of tarth', 'carice van houten', 'casterly rock', 'cersei ', 'conleth hill', 'd.b. weiss', 'daenerys', 'daniel portman', 'david benioff', 'davos seaworth', 'dornish', 'dothraki', 'dreadfort', 'emilia clarke', 'game of thrones', 'gameofthrone', 'gameofthone', 'gamesofthrone', 'greyjoy', 'gwendoline christie', 'highgarden', 'hodor', 'house bolton', 'house stark', 'house tyrell', 'howland reed', 'iain glen', 'ian mcelhinney', 'iron throne', 'isaac hempstead wright', 'jerome flynn', 'john bradley', 'jojen reed', 'jon snow', 'julian glover', 'khaleesi', "king's landing", 'kit harington', 'kit harrington', 'kristian nairn', 'lanister', 'lannisport', 'lannister', 'lena headey', 'liam cunningham', 'littlefinger', 'maisie williams', 'meereen', 'melisandre', 'michele fairley', 'michelle fairley', 'myrcella', 'natalie dormer', 'nathalie emmanue', 'ned stark', 'nikolaj coster-waldau', 'olenna tyrell', 'peter dinklage', 'podrick payne', 'queen of thorns', 'ramsay bolton', 'roose bolton', 'rory mccann', 'sandor clegane', 'sansa stark', 'sophie turner', 'sothoryos', 'stephen dillane', 'targaryen', 'three eyed raven', 'tower of joy', 'tyrion', 'vaes dothrak', 'viserys', 'walder frey', 'westeros', 'white walker', 'whitewalker', 'wildling', 'winterfell'];
const SPOILER_WORDS_REGEX = new RegExp(SPOILER_WORDS_LIST.join('|'), 'i');
const SPOILER_WORDS_REDDIT = SPOILER_WORDS_LIST.slice();
SPOILER_WORDS_REDDIT.push("spoiler", "spoilers");
const SPOILER_WORDS_REDDIT_REGEX = new RegExp(SPOILER_WORDS_REDDIT.join('|'), 'i');

const HOST_LIST_DOM = {
    "facebook.com": 'div[data-testid="fbfeed_story"], div[role="article"], #pagelet_trending_tags_and_topics ul > li',
    "news.google": 'a[target="_blank"]',
    "reddit.com": '.scrollerItem',
    "slack.com": 'ts-message',
    "twitter.com": "[data-item-type='tweet'], .trend-item",
    "youtube.com": '.yt-lockup, .related-list-item, .comment-renderer-text',
    "quora.com": '.feed_item, .QueryResult ',
    "instagram.com": 'article',
    "linkedin.com": '.feed-shared-update-v2, .feed-shared-update-v2--e2e, .feed-shared-update--chat-ui, .feed-shared-update-v2--minimal-padding'
};

const HOST_LIST_REGEX = new RegExp(Object.keys(HOST_LIST_DOM).join('|'), 'i');

const feedSelectorFunc = function(url, remoteDom) {
    if (remoteDom) {
        var remoteDomRegexp = new RegExp(Object.keys(remoteDom).join('|'), 'i');
        var host;
        host = url.match(remoteDomRegexp);
        if (host) {
            return {
                "identifier": remoteDom[host],
                "host": host
            };
        }
    }
    host = url.match(HOST_LIST_REGEX);
    if (host) {
        return {
            "identifier": HOST_LIST_DOM[host],
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
            chrome.runtime.sendMessage({id: "count_increment"});
            exileTraitorousSpoiler($(this), matchedSpoiler[0], isBigDom(divHeight));
        }
    });
};

const regexFunc = function (url, keyword) {
    if (keyword) {
        return  new RegExp(SPOILER_WORDS_LIST.slice().concat(keyword.split(',')).join('|'), 'i');
    } else {
        return  SPOILER_WORDS_REGEX;
    }
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
        if (msg.id === 'fetchedkeywordAndPreferences') {
            if (!msg.disabled) {
                var url = window.location.toString().toLowerCase();
                var regExp = regexFunc(url, msg.keyword);
                var feedSelector = feedSelectorFunc(url, msg.remoteData);
                if (feedSelector) {
                    cleanFeed(feedSelector, regExp);
                    if (eventListener) {
                        document.removeEventListener("DOMNodeInserted", eventListener);
                    }
                    eventListener = eventListenerFunc(feedSelector, regExp);
                    document.addEventListener("DOMNodeInserted", eventListener);
                }
            }
        }
    });
    chrome.runtime.sendMessage({id: "fetchkeywordAndPreference"});
});

const eventListenerFunc = function(feedSelector, regex) {
  return throttle(function (e) {
      cleanFeed(feedSelector, regex);
  }, 2000);
};

var eventListener;


const GOT_RELATED_SUBREDDITS = ['gameofthrones', 'asoiaf', 'iceandfire', 'agotboardgame', 'gamesofthrones', 'westeros', 'thronescomics', 'asongofmemesandrage', 'earthoficeandfire'];

const GOT_SUBREDDITS_REGEX = new RegExp('(\/r\/)' + GOT_RELATED_SUBREDDITS.join('|'), 'i');