define('trackService',
    [], function() {
        var serviceUrl = 'http://gameofmusicapi.azurewebsites.net/api/tracks/',
            get = function (id, callback) {
                return $.get(serviceUrl + id);
            },
            save = function(track) {
                return $.post(serviceUrl, track);                   
            };

        return {
            get: get,
            save: save
        };
    });