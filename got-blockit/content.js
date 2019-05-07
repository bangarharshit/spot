const FACEBOOK_FEED_ELEMENTS_SELECTOR    = 'div[data-testid="fbfeed_story"], div[role="article"], #pagelet_trending_tags_and_topics ul > li';
const GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR = 'a[target="_blank"]';
const REDDIT_FEED_ELEMENTS_SELECTOR      = '.scrollerItem';
const SLACK_FEED_ELEMENTS_SELECTOR       = 'ts-message';
const TWITTER_FEED_ELEMENTS_SELECTOR     = "[data-item-type='tweet'], .trend-item";
const YOUTUBE_ELEMENTS_SELECTOR          = '.yt-lockup, .related-list-item, .comment-renderer-text';
const QUORA_ELEMENTS_SELECTOR = '.feed_item, .QueryResult ';
const INSTAGRAM_ELEMENTS_SELECTOR = 'article';

$document = $(document);

const SPOILER_WORDS_LIST = ['arya', '#got', 'ady stonehea', 'aidan gillen', 'alfie allen', 'arya stark', 'asoiaf', 'azor ahai', 'baelish', 'baratheon', 'ben crompton', 'bloodraven', 'braavos', 'bran stark', 'briene of tarth', 'brienne of tarth', 'carice van houten', 'casterly rock', 'cersei ', 'conleth hill', 'd.b. weiss', 'daenerys', 'daniel portman', 'david benioff', 'davos seaworth', 'dornish', 'dothraki', 'dreadfort', 'emilia clarke', 'game of thrones', 'gameofthrone', 'gameofthone', 'gamesofthrone', 'greyjoy', 'gwendoline christie', 'highgarden', 'hodor', 'house bolton', 'house stark', 'house tyrell', 'howland reed', 'iain glen', 'ian mcelhinney', 'iron throne', 'isaac hempstead wright', 'jerome flynn', 'john bradley', 'jojen reed', 'jon snow', 'julian glover', 'khaleesi', "king's landing", 'kit harington', 'kit harrington', 'kristian nairn', 'lanister', 'lannisport', 'lannister', 'lena headey', 'liam cunningham', 'littlefinger', 'maisie williams', 'meereen', 'melisandre', 'michele fairley', 'michelle fairley', 'myrcella', 'natalie dormer', 'nathalie emmanue', 'ned stark', 'nikolaj coster-waldau', 'olenna tyrell', 'peter dinklage', 'podrick payne', 'queen of thorns', 'ramsay bolton', 'roose bolton', 'rory mccann', 'sandor clegane', 'sansa stark', 'sophie turner', 'sothoryos', 'stephen dillane', 'targaryen', 'three eyed raven', 'tower of joy', 'tyrion', 'vaes dothrak', 'viserys', 'walder frey', 'westeros', 'white walker', 'whitewalker', 'wildling', 'winterfell'];
const SPOILER_WORDS_REGEX = new RegExp(SPOILER_WORDS_LIST.join('|'), 'i');
const SPOILER_WORDS_REDDIT = SPOILER_WORDS_LIST.slice();
SPOILER_WORDS_REDDIT.push("spoiler", "spoilers");
const SPOILER_WORDS_REDDIT_REGEX = new RegExp(SPOILER_WORDS_REDDIT.join('|'), 'i');

const feedSelectorFunc = function(url, remoteDom) {
    if (!remoteDom) {
        remoteDom = {};
    }
    if (url.includes("facebook.com")) {
        if (remoteDom["facebook.com"]) {
            return remoteDom["facebook.com"]
        }
        return FACEBOOK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("news.google.com")) {
        if (remoteDom["news.google.com"]) {
            return remoteDom["news.google.com"]
        }
        return GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("reddit.com")) {
        if (remoteDom["reddit.com"]) {
            return remoteDom["reddit.com"]
        }
        return REDDIT_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("slack.com")) {
        if (remoteDom["slack.com"]) {
            return remoteDom["slack.com"]
        }
        return SLACK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("twitter.com")) {
        if (remoteDom["twitter.com"]) {
            return remoteDom["twitter.com"]
        }
        return TWITTER_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("youtube.com")) {
        if (remoteDom["youtube.com"]) {
            return remoteDom["youtube.com"]
        }
        return YOUTUBE_ELEMENTS_SELECTOR;
    } else if (url.includes("quora.com")) {
        if (remoteDom["quora.com"]) {
            return remoteDom["quora.com"]
        }
        return QUORA_ELEMENTS_SELECTOR;
    } else if (url.includes("instagram.com")) {
        if (remoteDom["instagram.com"]) {
            return remoteDom["instagram.com"]
        }
        return INSTAGRAM_ELEMENTS_SELECTOR;
    }
};

const cleanFeed = function(feedSelector, regex) {
    $(feedSelector).each(function (index) {
        if (this.classList.contains('glamoured')) {
            return;
        }
        var matchedSpoiler = this.textContent.match(regex);
        if (matchedSpoiler) {
            exileTraitorousSpoiler($(this), matchedSpoiler[0]);
        }
    });
};

const regexFunc = function (url) {
    if (url.includes("reddit.com")) {
        return SPOILER_WORDS_REDDIT_REGEX;
    } else {
        return SPOILER_WORDS_REGEX;
    }
};

const exileTraitorousSpoiler = function($traitor, dark_words_of_spoilage) {
    var $glamour, capitalized_spoiler_words, glamour_string;
    capitalized_spoiler_words = dark_words_of_spoilage.capitalizeFirstLetter();
    $traitor.addClass('glamoured');
    var textToShow = 'A potential spoiler here is detected as the post mentions ' + capitalized_spoiler_words;
    glamour_string = "<div class='spoiler-glamour' <h3 class='spoiler-obituary'>" + textToShow + ".</h3> <h3 class='click-to-view-spoiler' >Click to view spoiler (!!!)</h3> </div>";
    $(glamour_string).appendTo($traitor);
    $glamour = $traitor.find('.spoiler-glamour');
    return $glamour.on('click', function(ev) {
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

$document.ready(function() {
    var port = chrome.runtime.connect({name: "gost"});
    port.postMessage({request: "fetchkeywordAndPreference"});
    port.onMessage.addListener(function(msg) {
        if (!msg.disabled) {
            var url = window.location.toString().toLowerCase();
            var regExp = regexFunc(url);
            var feedSelector = feedSelectorFunc(url, msg.remoteData);
            if (feedSelector) {
                cleanFeed(feedSelector, regExp);
                if (eventListener) {
                    document.removeEventListener("DOMNodeInserted", eventListener);
                }
                eventListener = eventListenerFunc(feedSelector, regex);
                document.addEventListener("DOMNodeInserted", eventListener);
            }
        }
    });
});

const eventListenerFunc = function(feedSelector, regex) {
  return throttle(function (e) {
      cleanFeed(feedSelector, regex);
  }, 1000);
};

var eventListener;


const GOT_RELATED_SUBREDDITS = ['gameofthrones', 'asoiaf', 'iceandfire', 'agotboardgame', 'gamesofthrones', 'westeros', 'thronescomics', 'asongofmemesandrage', 'earthoficeandfire'];

const GOT_SUBREDDITS_REGEX = new RegExp('(\/r\/)' + GOT_RELATED_SUBREDDITS.join('|'), 'i');


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