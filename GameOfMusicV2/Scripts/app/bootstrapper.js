define('bootstrapper',
    ['analytics', 'gameManager'],
    function (analytics, gameManager) {
        var run = function () {
//            analytics.track('Page View');
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
        //        define('ko', [], function () { return root.ko; });
        define('createjs', [], function () { return root.createjs; });
    }
    
    function runShims() {
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