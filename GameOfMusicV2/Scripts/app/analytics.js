define('analytics',
    [], function() {
        var
            identify = function () {

            },
            track = function(eventName, extraData) {
                                mixpanel.track(eventName, extraData);
//                console.log('track: '+eventName);
                
            };

        return {
            identify: identify,
            track:track
        };
    });