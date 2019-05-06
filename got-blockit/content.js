var FACEBOOK_FEED_ELEMENTS_SELECTOR    = 'div[data-testid="fbfeed_story"], div[role="article"], #pagelet_trending_tags_and_topics ul > li';
var GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR = 'a[target="_blank"]';
var REDDIT_FEED_ELEMENTS_SELECTOR      = '.sitetable > .thing.link:visible, .usertext-body';
var SLACK_FEED_ELEMENTS_SELECTOR       = 'ts-message';
var TWITTER_FEED_ELEMENTS_SELECTOR     = "[data-item-type='tweet'], .trend-item";
var YOUTUBE_ELEMENTS_SELECTOR          = '.yt-lockup, .related-list-item, .comment-renderer-text';
var QUORA_ELEMENTS_SELECTOR = '.feed_item, .QueryResult ';
var INSTAGRAM_ELEMENTS_SELECTOR = 'article';

$document = $(document);

const feedSelectorFunc = function(url) {
    if (url.includes("facebook.com")) {
        return FACEBOOK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("news.google.com")) {
        return GOOGLE_NEWS_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("reddit.com")) {
        return REDDIT_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("slack")) {
        return SLACK_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("twitter.com")) {
        return TWITTER_FEED_ELEMENTS_SELECTOR;
    } else if (url.includes("youtube.com")) {
        return YOUTUBE_ELEMENTS_SELECTOR;
    } else if (url.includes("quora.com")) {
        return QUORA_ELEMENTS_SELECTOR;
    } else if (url.includes("instagram.com")) {
        return INSTAGRAM_ELEMENTS_SELECTOR;
    }
};

const cleanFeed = function(feedSelector) {
    $(feedSelector).each(function (index) {
        if (this.innerText.match(SPOILER_WORDS_REGEX)) {
            if (!this.classList.contains('spoiler-hidden')){
                this.classList += ' spoiler-hidden';
            }
        }
    });
};

$document.ready(function() {
    chrome.runtime.sendMessage({todo: "fetchkeywordAndPreference"}, function (response) {
        if (!response.disabled) {
            var url = window.location.toString().toLowerCase();
            var feedSelector = feedSelectorFunc(url);
            if (feedSelector) {
                cleanFeed(feedSelector);
                document.addEventListener("DOMNodeInserted", throttle(function (e) {
                    cleanFeed(feedSelector);
                }, 500));
            }

        }
    });
});

const SPOILER_WORDS_LIST = ['context', '#got', 'ady stonehea', 'aidan gillen', 'alfie allen', 'arya stark', 'asoiaf', 'azor ahai', 'baelish', 'baratheon', 'ben crompton', 'bloodraven', 'braavos', 'bran stark', 'briene of tarth', 'brienne of tarth', 'carice van houten', 'casterly rock', 'cersei ', 'conleth hill', 'd.b. weiss', 'daenerys', 'daniel portman', 'david benioff', 'davos seaworth', 'dornish', 'dothraki', 'dreadfort', 'emilia clarke', 'game of thrones', 'gameofthrone', 'gameofthone', 'gamesofthrone', 'greyjoy', 'gwendoline christie', 'highgarden', 'hodor', 'house bolton', 'house stark', 'house tyrell', 'howland reed', 'iain glen', 'ian mcelhinney', 'iron throne', 'isaac hempstead wright', 'jerome flynn', 'john bradley', 'jojen reed', 'jon snow', 'julian glover', 'khaleesi', "king's landing", 'kit harington', 'kit harrington', 'kristian nairn', 'lanister', 'lannisport', 'lannister', 'lena headey', 'liam cunningham', 'littlefinger', 'maisie williams', 'meereen', 'melisandre', 'michele fairley', 'michelle fairley', 'myrcella', 'natalie dormer', 'nathalie emmanue', 'ned stark', 'nikolaj coster-waldau', 'olenna tyrell', 'peter dinklage', 'podrick payne', 'queen of thorns', 'ramsay bolton', 'roose bolton', 'rory mccann', 'sandor clegane', 'sansa stark', 'sophie turner', 'sothoryos', 'stephen dillane', 'targaryen', 'three eyed raven', 'tower of joy', 'tyrion', 'vaes dothrak', 'viserys', 'walder frey', 'westeros', 'white walker', 'whitewalker', 'wildling', 'winterfell'];
const SPOILER_WORDS_REGEX = new RegExp(SPOILER_WORDS_LIST.join('|'), 'i');

const DEATH_NAMES = ["got burned at the stake to appease R'hllor", 'contracted greyscale and was quarantined permanently', 'did not live through the Long Night', 'drank way too much Moon Tea', 'found itself too far north when winter came', 'is dark and full of terrors', 'lost in trial by combat', 'did not win the game of thrones', 'suffered terribly at the paws of Ser Pounce', 'warged into a dead cat', 'was grimly beheaded for desertion', 'was impaled by a lance at a tournament by a lowly hedge knight', 'was incinerated by hot dragon breath', 'was murdered by its very own nuncle', 'was slain by a shadow', 'was slowly poisoned over a period of many fortnights', 'was torn asunder by six direwolves'];

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