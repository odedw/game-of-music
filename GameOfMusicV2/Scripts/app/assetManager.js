define('assetManager',
    ['createjs'], function (createjs) {
        var images = {},
            queue,
            progressChangedEvent = $.Callbacks(),
            loadCompleteEvent = $.Callbacks(),
            manifest = [
                //images
                { src: "/Content/Images/lock.png", id: "lock" },

                //sounds
                { src: "/Content/Sounds/8bit-kick.ogg", id: '8bit-kick' },
                { src: "/Content/Sounds/8bit-snare.ogg", id: '8bit-snare' },
                { src: "/Content/Sounds/8bit-special.ogg", id: '8bit-special' },
                { src: "/Content/Sounds/8bit-hh.ogg", id: '8bit-hh' },
                { src: "/Content/Sounds/rock-kick.ogg", id: 'rock-kick' },
                { src: "/Content/Sounds/rock-snare.ogg", id: 'rock-snare' },
                { src: "/Content/Sounds/rock-special.ogg", id: 'rock-special' },
                { src: "/Content/Sounds/rock-hh.ogg", id: 'rock-hh' }
            ],
            loadAssets = function () {
                queue = new createjs.LoadQueue();
                queue.installPlugin(createjs.Sound);
                queue.addEventListener("complete", handleComplete);
                queue.addEventListener("fileload", handleFileLoad);
                queue.addEventListener("progress", handleProgress);
                queue.loadManifest(manifest);
            },
            handleFileLoad = function (o) {
                //You could store all your images in object to call them easily.  
                if (o.item.type === "image") {
                    images[o.item.id] = o.result;
                }
                else if (o.item.type === "sound") {
                    //sounds[o.item.id] = o.result;
                }
            },
            handleProgress = function (event) {
                progressChangedEvent.fireWith(window, [event.progress]);
            },
            handleComplete = function (event) {
                loadCompleteEvent.fire();
            },

        //sound stuff
            currentMusic,
            
        isMuted = false,
            playSound = function (id, volume, loop) {
                volume = volume || 1;
                var sound = createjs.Sound.play(id, createjs.Sound.INTERRUPT_NONE,0,0,loop? -1 : 0,volume );
                return sound;
            },
            stopMusic = function(callback) {
                createjs.Tween.get(currentMusic).to({ volume: 0 }, 800, createjs.Ease.quadIn).call(function () {
                    currentMusic.stop();
                    if (callback)
                        callback();
                });
            },
            playMusic = function (id, volume) {
                if (currentMusic) {
                    if (currentMusic.id !== id) {
                        stopMusic(function() {
                            currentMusic = playSound(id, volume, true);
                            currentMusic.id = id;
                        });
                    }
                } else {
                    currentMusic = playSound(id, volume, true);
                    currentMusic.id = id;

                }
                
            },
            toggleMute = function () {
                isMuted = !isMuted;
                createjs.Sound.setMute(isMuted);
            };

        return {
            loadAssets: loadAssets,
            progressChangedEvent: progressChangedEvent,
            loadCompleteEvent: loadCompleteEvent,
            images: images,
            playSound: playSound,
            toggleMute: toggleMute,
            playMusic: playMusic,
            stopMusic: stopMusic,
            isMuted: function () { return isMuted; }
    };
    });