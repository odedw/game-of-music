define('soundPlayer',
    ['createjs'], function (createjs) {
        var
            soundBank = [
                'bd',
                'sd',
                'hh',
                'lt',
                'bass1',
                'bass5',
                'C',
                'Eb',
                'G',
                'Bb'
            ].reverse(),
            play = function (sounds) {
                for (var i = 0; i < sounds.length; i++) {
                    createjs.Sound.play(soundBank[sounds[i]]);
                }
            },
            init = function () {
                var queue = new createjs.LoadQueue();
                queue.installPlugin(createjs.Sound);
                queue.addEventListener("fileload", handleFileLoad);
                queue.addEventListener("complete", handleComplete);
                for (var i = 0; i < soundBank.length; i++) {
                    queue.loadFile({ id: soundBank[i], src: "/Content/Sounds/"+soundBank[i]+".mp3" });
                }
            },
            handleFileLoad = function (event) {
//                console.log("Preloaded:", event.item.id, event.item.src);
            },
            handleComplete = function () {
//                console.log("Complete!");
            };

        init();

        return {
            play: play
        };
    });