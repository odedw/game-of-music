define('soundManager',
    ['assetManager', 'constants'], function (assetManager,c) {
        var soundBanks = {
            '8bit': {
                'drums': Math.range(0,3),
                'bass': Math.range(4, 15),
                'melody': Math.range(16, 39)
            },
            'Rock': {
                'drums': Math.range(40,43),
                'bass': Math.range(44, 55),
                'melody': Math.range(56, 79)
            },
            'Latin': {
                'drums': Math.range(80,83),
                'bass': Math.range(84, 95),
                'melody': Math.range(96, 119)
            }    
        },
            context, soundBuffers,
            currentSoundBank = '8bit',
            
            play = function (sounds, time, chord) {
                var index = 0;
                var chordArr = buildChord(chord);
                for (var i = 0; i < sounds.length; i++) {
                    if (sounds[i] > 4) { // drums
                        index = soundBanks[currentSoundBank]['drums'][c.ROWS - 1 - sounds[i]];
                    }
                    else if (sounds[i] == 4){ //bass
                        index = soundBanks[currentSoundBank]['bass'][chordArr[sounds[i]]];
                    }
                    else {
                        index = soundBanks[currentSoundBank]['melody'][chordArr[sounds[i]]];
                    }
                    playSound(index, time);
                    
                }
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
            },
            buildChord = function (chordName) {
                var arr = [], base = 0, bassBase = 0;
                switch (chordName[0]) {
                    case 'A': base = bassBase = 3; break;
                    case 'B': base = bassBase = 4; break;
                    case 'C': base = bassBase = 5; break;
                    case 'D': base = bassBase = 6; break;
                    case 'E': base = bassBase = 0; break;
                    case 'F': base = bassBase = 1; break;
                    case 'G': base = bassBase = 2; break;
                }
                chordName = chordName.substr(1);
                if (chordName[0] == '#') {
                    base++;
                    bassBase++;
                    chordName = chordName.substr(1);
                }
                if (chordName == 'maj') { //major
                    arr = [base, base + 4, base + 7, base + 12].reverse();
                }
                else if (chordName === 'min') { //minor
                    arr = [base, base + 3, base + 7, base + 12].reverse();
                }
                else if (chordName === '7') { //seven
                    arr = [base, base + 4, base + 7, base + 10].reverse();
                }
                else if (chordName === 'maj7') { //major sevn
                    arr = [base, base + 4, base + 7, base + 11].reverse();
                }
                else if (chordName === 'min7') { //minor seven
                    arr = [base, base + 3, base + 7, base + 10].reverse();
                }
                else if (chordName === 'aug') { //minor seven
                    arr = [base, base + 4, base + 7, base + 8].reverse();
                }
                arr.push(bassBase);
                //arr.push(bassBase + 7 > 15 ? bassBase - 5 : bassBase + 7);
                return arr;
            },
            init = function() {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                context = new AudioContext();

                var bufferLoader = new BufferLoader(
                    context,
                    [
                        '/Content/Sounds/8bit-kick.ogg', //0
                        '/Content/Sounds/8bit-snare.ogg', //1
                        '/Content/Sounds/8bit-special.ogg', //2
                        '/Content/Sounds/8bit-hh.ogg', //3
                        '/Content/Sounds/8bit-bass-E0.ogg', //4
                        '/Content/Sounds/8bit-bass-F0.ogg', //5
                        '/Content/Sounds/8bit-bass-F_0.ogg', //6
                        '/Content/Sounds/8bit-bass-G0.ogg', //7
                        '/Content/Sounds/8bit-bass-G_0.ogg', //8
                        '/Content/Sounds/8bit-bass-A0.ogg', //9
                        '/Content/Sounds/8bit-bass-A_0.ogg', //10
                        '/Content/Sounds/8bit-bass-B0.ogg', //11
                        '/Content/Sounds/8bit-bass-C1.ogg', //12
                        '/Content/Sounds/8bit-bass-C_1.ogg', //13
                        '/Content/Sounds/8bit-bass-D1.ogg', //14
                        '/Content/Sounds/8bit-bass-D_1.ogg', //15
                        '/Content/Sounds/8bit-E1.ogg',  //16
                        '/Content/Sounds/8bit-F1.ogg', //17
                        '/Content/Sounds/8bit-F_1.ogg', //18
                        '/Content/Sounds/8bit-G1.ogg', //19
                        '/Content/Sounds/8bit-G_1.ogg', //20
                        '/Content/Sounds/8bit-A1.ogg', //21
                        '/Content/Sounds/8bit-A_1.ogg', //22
                        '/Content/Sounds/8bit-B1.ogg', //23
                        '/Content/Sounds/8bit-C2.ogg', //24
                        '/Content/Sounds/8bit-C_2.ogg', //25
                        '/Content/Sounds/8bit-D2.ogg', //26
                        '/Content/Sounds/8bit-D_2.ogg', //27
                        '/Content/Sounds/8bit-E2.ogg', //28
                        '/Content/Sounds/8bit-F2.ogg', //29
                        '/Content/Sounds/8bit-F_2.ogg', //30
                        '/Content/Sounds/8bit-G2.ogg', //31
                        '/Content/Sounds/8bit-G_2.ogg', //32
                        '/Content/Sounds/8bit-A2.ogg', //33
                        '/Content/Sounds/8bit-A_2.ogg', //34
                        '/Content/Sounds/8bit-B2.ogg', //35
                        '/Content/Sounds/8bit-C3.ogg', //36
                        '/Content/Sounds/8bit-C_3.ogg', //37
                        '/Content/Sounds/8bit-D3.ogg', //38
                        '/Content/Sounds/8bit-D_3.ogg', //39
                        '/Content/Sounds/rock-kick.ogg', //0
                        '/Content/Sounds/rock-snare.ogg', //1
                        '/Content/Sounds/rock-special.ogg', //2
                        '/Content/Sounds/rock-hh.ogg', //3
                        '/Content/Sounds/rock-bass-E0.ogg', //4
                        '/Content/Sounds/rock-bass-F0.ogg', //5
                        '/Content/Sounds/rock-bass-F_0.ogg', //6
                        '/Content/Sounds/rock-bass-G0.ogg', //7
                        '/Content/Sounds/rock-bass-G_0.ogg', //8
                        '/Content/Sounds/rock-bass-A0.ogg', //9
                        '/Content/Sounds/rock-bass-A_0.ogg', //10
                        '/Content/Sounds/rock-bass-B0.ogg', //11
                        '/Content/Sounds/rock-bass-C1.ogg', //12
                        '/Content/Sounds/rock-bass-C_1.ogg', //13
                        '/Content/Sounds/rock-bass-D1.ogg', //14
                        '/Content/Sounds/rock-bass-D_1.ogg', //15
                        '/Content/Sounds/rock-E1.ogg',  //16
                        '/Content/Sounds/rock-F1.ogg', //17
                        '/Content/Sounds/rock-F_1.ogg', //18
                        '/Content/Sounds/rock-G1.ogg', //19
                        '/Content/Sounds/rock-G_1.ogg', //20
                        '/Content/Sounds/rock-A1.ogg', //21
                        '/Content/Sounds/rock-A_1.ogg', //22
                        '/Content/Sounds/rock-B1.ogg', //23
                        '/Content/Sounds/rock-C2.ogg', //24
                        '/Content/Sounds/rock-C_2.ogg', //25
                        '/Content/Sounds/rock-D2.ogg', //26
                        '/Content/Sounds/rock-D_2.ogg', //27
                        '/Content/Sounds/rock-E2.ogg', //28
                        '/Content/Sounds/rock-F2.ogg', //29
                        '/Content/Sounds/rock-F_2.ogg', //30
                        '/Content/Sounds/rock-G2.ogg', //31
                        '/Content/Sounds/rock-G_2.ogg', //32
                        '/Content/Sounds/rock-A2.ogg', //33
                        '/Content/Sounds/rock-A_2.ogg', //34
                        '/Content/Sounds/rock-B2.ogg', //35
                        '/Content/Sounds/rock-C3.ogg', //36
                        '/Content/Sounds/rock-C_3.ogg', //37
                        '/Content/Sounds/rock-D3.ogg', //38
                        '/Content/Sounds/rock-D_3.ogg', //39
                        '/Content/Sounds/latin-kick.ogg', //0
                        '/Content/Sounds/latin-snare.ogg', //1
                        '/Content/Sounds/latin-special.ogg', //2
                        '/Content/Sounds/latin-hh.ogg', //3
                        '/Content/Sounds/latin-bass-E0.ogg', //4
                        '/Content/Sounds/latin-bass-F0.ogg', //5
                        '/Content/Sounds/latin-bass-F_0.ogg', //6
                        '/Content/Sounds/latin-bass-G0.ogg', //7
                        '/Content/Sounds/latin-bass-G_0.ogg', //8
                        '/Content/Sounds/latin-bass-A0.ogg', //9
                        '/Content/Sounds/latin-bass-A_0.ogg', //10
                        '/Content/Sounds/latin-bass-B0.ogg', //11
                        '/Content/Sounds/latin-bass-C1.ogg', //12
                        '/Content/Sounds/latin-bass-C_1.ogg', //13
                        '/Content/Sounds/latin-bass-D1.ogg', //14
                        '/Content/Sounds/latin-bass-D_1.ogg', //15
                        '/Content/Sounds/latin-E1.ogg',  //16
                        '/Content/Sounds/latin-F1.ogg', //17
                        '/Content/Sounds/latin-F_1.ogg', //18
                        '/Content/Sounds/latin-G1.ogg', //19
                        '/Content/Sounds/latin-G_1.ogg', //20
                        '/Content/Sounds/latin-A1.ogg', //21
                        '/Content/Sounds/latin-A_1.ogg', //22
                        '/Content/Sounds/latin-B1.ogg', //23
                        '/Content/Sounds/latin-C2.ogg', //24
                        '/Content/Sounds/latin-C_2.ogg', //25
                        '/Content/Sounds/latin-D2.ogg', //26
                        '/Content/Sounds/latin-D_2.ogg', //27
                        '/Content/Sounds/latin-E2.ogg', //28
                        '/Content/Sounds/latin-F2.ogg', //29
                        '/Content/Sounds/latin-F_2.ogg', //30
                        '/Content/Sounds/latin-G2.ogg', //31
                        '/Content/Sounds/latin-G_2.ogg', //32
                        '/Content/Sounds/latin-A2.ogg', //33
                        '/Content/Sounds/latin-A_2.ogg', //34
                        '/Content/Sounds/latin-B2.ogg', //35
                        '/Content/Sounds/latin-C3.ogg', //36
                        '/Content/Sounds/latin-C_3.ogg', //37
                        '/Content/Sounds/latin-D3.ogg', //38
                        '/Content/Sounds/latin-D_3.ogg', //39
                    ],
                    finishedLoading
                );

                bufferLoader.load();

                window.buildChord = buildChord;
            };

        init();

        return {
            play: play,
            context: context,
            buildChord: buildChord,
            setSoundBank: function(bank) { currentSoundBank = bank; },
            getSoundBank: function() { return currentSoundBank; }
    };
    });