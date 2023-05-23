(function () {
    function getClientParams() {
        var touch = !!('ontouchstart' in window) || (window.navigator && window.navigator.msMaxTouchPoints);
        return (touch ? "device=mobile&" : "") + "screen=" + window.screen.width + ":" + window.screen.height + (window.xpagename ? "&page=" + window.xpagename : "");
    }

    var s = document.createElement("script"),
        params = getClientParams();

    s.setAttribute("src", (xconfig.apiroot || xconfig.root || "/") + "bootloader?" + params);
    s.setAttribute("type", "text/javascript");
    document.body.insertBefore(s, null);

    var frame = document.getElementById("_appcacheframe"),
        appCache = window.applicationCache;

    if (frame) {
        frame.setAttribute("src", frame.getAttribute("data-src") + "?bootParams=" + encodeURIComponent(params));
    }

    if (appCache) {
        var hooks = appCache.hooks = {};
        appCache.onerror = function (e) {
            hooks.error = {
                event: e
            };
        };
        appCache.oncached = function (e) {
            hooks.cached = {
                event: e
            };
        };
        appCache.onnoupdate = function (e) {
            hooks.noupdate = {
                event: e
            };
        };
        appCache.onupdateready = function (e) {
            hooks.updateready = {
                event: e
            };
        };
        appCache.onobsolete = function (e) {
            hooks.obsolete = {
                event: e
            };
        };
    }
}());