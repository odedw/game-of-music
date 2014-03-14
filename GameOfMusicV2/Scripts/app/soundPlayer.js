define('soundPlayer',
    ['assetManager'], function (assetManager) {
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
            context, soundBuffers,
            currentSoundBank = '8bit',
            
            play = function(sounds, time) {
                for (var i = 0; i < sounds.length; i++) {
                    if (sounds[i] > 5)
                    playSound(sounds[i], time);
                }
            },
            init = function() {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                context = new AudioContext();

                var bufferLoader = new BufferLoader(
                    context,
                    [
                        '/Content/Sounds/8bit-kick.ogg',
                        '/Content/Sounds/8bit-snare.ogg',
                        '/Content/Sounds/8bit-special.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg',
                        '/Content/Sounds/8bit-hh.ogg'
                        //'/Content/Sounds/rock-kick.ogg',
                        //'/Content/Sounds/rock-snare.ogg',
                        //'/Content/Sounds/rock-special.ogg',
                        //'/Content/Sounds/rock-hh.ogg'
                    ].reverse(),
                    finishedLoading
                );

                bufferLoader.load();
            },
            finishedLoading = function(bufferList) {
                // Create two sources and play them both together.
                soundBuffers = bufferList;
                playSound(0, 0);
            },
            playSound = function (index, time) {
                var source = context.createBufferSource();
                source.buffer = soundBuffers[index];
                source.connect(context.destination);
                source.start(time);
            };

        init();

        return {
            play: play,
            context: context
        };
    });