define('analytics',
    [], function() {
        var
            identify = function () {

            },
            track = function(eventName, extraData) {
                                mixpanel.track(eventName, extraData);
            };

        return {
            identify: identify,
            track:track
        };
    });