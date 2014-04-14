define('bootstrapper',
    ['analytics', 'gameManager'],
    function (analytics, gameManager) {
        var run = function () {
            analytics.track('Page View');
            Math.sign = function (number) { return number ? number < 0 ? -1 : 1 : 0; };
            startApp();
        },
            startApp = function () {
                gameManager.init();
                
            };

        return {
            run: run,
        };
    });

(function (d) {
    var root = this;

    require.config({
        baseUrl: "/Scripts/app",
//        paths: {
//            'Screens': 'screens',
//            'Entities': 'entities',
//        }
    });
    define3rdPartyModules();
    runShims();
    loadPluginsAndBoot();

    function define3rdPartyModules() {
        // These are already loaded via bundles. 
        // We define them and put them in the root object.
        //        define('jquery', [], function () { return root.jQuery; });
        define('ko', [], function () { return root.ko; });
        define('createjs', [], function () { return root.createjs; });
    }
    
    function runShims() {
        Math.range = function(start, end) {
            var arr = [];
            if (end < start)
                return arr;
            for (var i = start; i <= end; i++) {
                arr.push(i);
            }
            return arr;
        };

        Array.prototype.each = function (callback) {
            var i = 0;
            while (i < this.length) {
                callback.call(this, this[i]);
                i++;
            }
            return this;
        };

        Array.prototype.map = function (callback) {
            var i = this.length;
            var found = [];
            while (i--) {
                if (callback.call(this, this[i])) {
                    found.push(this[i]);
                }
            }
            return found;
        };

        Array.prototype.contains = function (obj) {
            var i = this.length;
            while (i--) {
                if (this[i] === obj) {
                    return true;
                }
            }
            return false;
        };

        Array.prototype.remove = function (element) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === element) {
                    this.splice(i, 1);
                    break;
                }
            }
        };
        
        //RAF. from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
              window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    }

    function loadPluginsAndBoot() {
        // Plugins must be loaded after jQuery and Knockout, 
        // since they depend on them.
        requirejs([
        ], boot);
    }

    function boot() {
        require(['bootstrapper'], function (bs) { bs.run(d); });
    }
})(document);