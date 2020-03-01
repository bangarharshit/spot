var addClass, cl, debounce, debounce_timeout, hasClass;

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