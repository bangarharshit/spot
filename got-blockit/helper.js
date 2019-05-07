var $log, GAME_O_SPOILERS_DEBUG_MODE, addClass, cl, debounce, debounce_timeout, hasClass, loadUserPreferences, log_timeout;

debounce_timeout = null;

debounce = function(fn_to_debounce) {
    if (debounce_timeout !== null) {
        return;
    }
    return debounce_timeout = setTimeout((function() {
        fn_to_debounce();
        return debounce_timeout = null;
    }), 150);
};

hasClass = function(element, className) {
    if (element.classList) {
        return element.classList.contains(className);
    } else {
        return !!element.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
    }
};

addClass = function(element, className) {
    if (element.classList) {
        return element.classList.add(className);
    } else if (!hasClass(element, className)) {
        return element.className += " " + className;
    }
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.escapeRegex = function() {
    return this.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};