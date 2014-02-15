define('bootstrapper',
    ['analytics'],
    function (analytics) {
        var run = function () {
//            analytics.track('Page View');
            Math.sign = function (number) { return number ? number < 0 ? -1 : 1 : 0; };
            startApp();
        },
            startApp = function () {
                //                gameManager.init();
                
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
    loadPluginsAndBoot();

    function define3rdPartyModules() {
        // These are already loaded via bundles. 
        // We define them and put them in the root object.
        //        define('jquery', [], function () { return root.jQuery; });
        //        define('ko', [], function () { return root.ko; });
//        define('createjs', [], function () { return root.createjs; });
//        define('Box2D', [], function () { return root.Box2D; });
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