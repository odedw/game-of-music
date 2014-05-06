define('tour',
    [], function() {
        return {
            id: "hello-hopscotch",
                steps: [
                  {
                      title: "Overview",
                      content: "Game of Music is a music sequencer where every state is computed according to the rules of Conway's Game of Life. Fill in the initial state, set the BPM, pick a sound set, set your track's chords and click play!",
                      target: "controls-container",
                      placement: "bottom",
                      xOffset: 'center',
                      arrowOffset: 'center'
                  },
                  {
                      title: "Build Your Track",
                      content: "The four bottom rows control the drum section, top four the melody instrument and the middle is the bass. Left click to fill in the cell, right click to lock the cell (state will not change).",
                      target: "game-container",
                      placement: "bottom",
                      xOffset: 'center',
                      arrowOffset: 'center'
                  },
                  {
                      title: "Play/Pause",
                      content: "Click to play/pause.",
                      target: 'play-btn',
                      xOffset: 'center',
                      arrowOffset: 'center',
                      placement: "bottom"
                  },
                  {
                      title: "Clear",
                      content: "Click to clear the track.",
                      target: 'clear-btn',
                      xOffset: 'center',
                      arrowOffset: 'center',
                      placement: "bottom"
                  },
                    {
                        title: "Lock",
                        content: "Lock the entire board (good for figuring out the initial state).",
                        target: 'lock-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        title: "BPM",
                        content: "Set the track's BPM.",
                        target: 'bpm-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        title: "Sound Set",
                        content: "Pick a sound set.",
                        target: 'sound-set-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        title: "Help",
                        content: "See this tour.",
                        target: 'help-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        title: "Share",
                        content: "Click to generate a unique link to your track and share it.",
                        target: 'share-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        title: "Chords",
                        content: "Click the chord letter to change the chords key, and click the chord modulator to change the chord type. Click the +/- signs to add/remove a chord.",
                        target: 'chord-container',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                    {
                        content: "Don't forget to share your track, and have fun!",
                        target: 'share-btn',
                        xOffset: 'center',
                        arrowOffset: 'center',
                        placement: "bottom"
                    },
                ]
        };
});