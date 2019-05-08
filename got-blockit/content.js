const FACEBOOK_FEED_ELEMENTS_SELECTOR    = 'div[data-testid="fbfeed_story"], div[role="article"], #pagelet_trending_tags_and_topics ul > li';
const GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR = 'a[target="_blank"]';
const REDDIT_FEED_ELEMENTS_SELECTOR      = '.scrollerItem';
const SLACK_FEED_ELEMENTS_SELECTOR       = 'ts-message';
const TWITTER_FEED_ELEMENTS_SELECTOR     = "[data-item-type='tweet'], .trend-item";
const YOUTUBE_ELEMENTS_SELECTOR          = '.yt-lockup, .related-list-item, .comment-renderer-text';
const QUORA_ELEMENTS_SELECTOR = '.feed_item, .QueryResult ';
const INSTAGRAM_ELEMENTS_SELECTOR = 'article';
const LINKEDIN_ELEMENTS_SELECTOR = '.feed-shared-update-v2, .feed-shared-update-v2--e2e, .feed-shared-update--chat-ui, .feed-shared-update-v2--minimal-padding';

$document = $(document);

const SPOILER_WORDS_LIST = ['#got', 'ady stonehea', 'aidan gillen', 'alfie allen', 'arya stark', 'asoiaf', 'azor ahai', 'baelish', 'baratheon', 'ben crompton', 'bloodraven', 'braavos', 'bran stark', 'briene of tarth', 'brienne of tarth', 'carice van houten', 'casterly rock', 'cersei ', 'conleth hill', 'd.b. weiss', 'daenerys', 'daniel portman', 'david benioff', 'davos seaworth', 'dornish', 'dothraki', 'dreadfort', 'emilia clarke', 'game of thrones', 'gameofthrone', 'gameofthone', 'gamesofthrone', 'greyjoy', 'gwendoline christie', 'highgarden', 'hodor', 'house bolton', 'house stark', 'house tyrell', 'howland reed', 'iain glen', 'ian mcelhinney', 'iron throne', 'isaac hempstead wright', 'jerome flynn', 'john bradley', 'jojen reed', 'jon snow', 'julian glover', 'khaleesi', "king's landing", 'kit harington', 'kit harrington', 'kristian nairn', 'lanister', 'lannisport', 'lannister', 'lena headey', 'liam cunningham', 'littlefinger', 'maisie williams', 'meereen', 'melisandre', 'michele fairley', 'michelle fairley', 'myrcella', 'natalie dormer', 'nathalie emmanue', 'ned stark', 'nikolaj coster-waldau', 'olenna tyrell', 'peter dinklage', 'podrick payne', 'queen of thorns', 'ramsay bolton', 'roose bolton', 'rory mccann', 'sandor clegane', 'sansa stark', 'sophie turner', 'sothoryos', 'stephen dillane', 'targaryen', 'three eyed raven', 'tower of joy', 'tyrion', 'vaes dothrak', 'viserys', 'walder frey', 'westeros', 'white walker', 'whitewalker', 'wildling', 'winterfell'];
const SPOILER_WORDS_REGEX = new RegExp(SPOILER_WORDS_LIST.join('|'), 'i');
const SPOILER_WORDS_REDDIT = SPOILER_WORDS_LIST.slice();
SPOILER_WORDS_REDDIT.push("spoiler", "spoilers");
const SPOILER_WORDS_REDDIT_REGEX = new RegExp(SPOILER_WORDS_REDDIT.join('|'), 'i');

const fbHost = "facebook.com";
const gNewsHost = "news.google";
const redditHost = "reddit.com";
const slackHost = "slack.com";
const twitterHost = "twitter.com";
const youtubeHost = "youtube.com";
const quoraHost = "quora.com";
const instagramHost = "instagram.com";
const linkedinHost = "linkedin.com";

const feedSelectorFunc = function(url, remoteDom) {
    if (!remoteDom) {
        remoteDom = {};
    }
    if (url.includes(fbHost)) {
        if (remoteDom[fbHost]) {
            return remoteDom[fbHost]
        }
        return FACEBOOK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes(gNewsHost)) {
        if (remoteDom[gNewsHost]) {
            return remoteDom[gNewsHost]
        }
        return GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes(redditHost)) {
        if (remoteDom[redditHost]) {
            return remoteDom[redditHost]
        }
        return REDDIT_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes(slackHost)) {
        if (remoteDom[slackHost]) {
            return remoteDom[slackHost]
        }
        return SLACK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes(twitterHost)) {
        if (remoteDom[twitterHost]) {
            return remoteDom[twitterHost]
        }
        return TWITTER_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes(youtubeHost)) {
        if (remoteDom[youtubeHost]) {
            return remoteDom[youtubeHost]
        }
        return YOUTUBE_ELEMENTS_SELECTOR;
    } else if (url.includes(quoraHost)) {
        if (remoteDom[quoraHost]) {
            return remoteDom[quoraHost]
        }
        return QUORA_ELEMENTS_SELECTOR;
    } else if (url.includes(instagramHost)) {
        if (remoteDom[instagramHost]) {
            return remoteDom[instagramHost]
        }
        return INSTAGRAM_ELEMENTS_SELECTOR;
    } else if (url.includes(linkedinHost)) {
        if (remoteDom[linkedinHost]) {
            return remoteDom[linkedinHost]
        }
        return LINKEDIN_ELEMENTS_SELECTOR;
    } 
};

const cleanFeed = function(feedSelector, regex) {
    $(feedSelector).each(function (index) {
        if (this.classList.contains('glamoured')) {
            return;
        }
        let divHeight = $(this).height();
        let matchedSpoiler = this.textContent.match(regex);
        if (matchedSpoiler) {
            exileTraitorousSpoiler($(this), matchedSpoiler[0], isBigDom(divHeight));
        }
    });
};

const regexFunc = function (url) {
    if (url.match(GOT_SUBREDDITS_REGEX)) {
        return SPOILER_WORDS_REDDIT_REGEX;
    } else {
        return SPOILER_WORDS_REGEX;
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
                eventListener = eventListenerFunc(feedSelector, regExp);
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