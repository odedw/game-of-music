define('soundPlayer',
    ['createjs', 'assetManager'], function (createjs,assetManager) {
        var soundNames = [
            'kick',
            'snare',
            'hh',
            'special',
            'bass1',
            'bass5',
            'C',
            'Eb',
            'G',
            'Bb'
        ].reverse(),
            currentSoundBank = '8bit',
            play = function(sounds) {
                for (var i = 0; i < sounds.length; i++) {
                    assetManager.playSound(currentSoundBank + '-' + soundNames[sounds[i]]);
                    console.log(currentSoundBank + '-' + soundNames[sounds[i]]);
                }
            };

        return {
            play: play
        };
    });