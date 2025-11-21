import Machine from '/assets/js/app/Machine.js';
export default class Controller {
    constructor() {
        let machinesetup = { // saved in file 
            sequencer: {
                instruments: [
                    { url: "./assets/js/app/instruments/kickoo.wav", effects: { feedback: { feedback: 0.1, delayTime: 0.1 }, filter: { frequency: 400 }, distortion: { wet: 0.2 } }, controls: ['feedback.feedback', 'feedback.delayTime', 'filter.frequency', 'distortion.wet'] },
                    { url: "./assets/js/app/instruments/snorecool.wav", effects: { feedback: { feedback: 0.1, delayTime: 0.1 }, filter: { frequency: 400 }, reverb: { wet: 0.2 } }, controls: ['feedback.feedback', 'feedback.delayTime', 'filter.frequency', 'reverb.wet'] },
                    { url: "./assets/js/app/instruments/clap.wav", effects: { feedback: { feedback: 0.2, delayTime: 0.3 }, filter: { frequency: 200 }, reverb: { wet: 0.2 } }, controls: ['feedback.feedback', 'feedback.delayTime', 'filter.frequency', 'reverb.wet'] },
                    { url: "./assets/js/app/instruments/hiha.wav", effects: { feedback: { feedback: 0.1, delayTime: 0.1 }, filter: { frequency: 400 }, reverb: { wet: 0.2 } }, controls: ['feedback.feedback', 'feedback.delayTime', 'filter.frequency', 'reverb.wet'] }
                ],
                matrix: [
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0],
                    [0, 0, 0, 0], [0, 0, 0, 0]
                ]
            },
            monotron: {
                instrument: {
                    url: "./assets/js/app/instruments/synths/cool2/",
                    effects: {
                        reverb: {
                            wet: 0.2
                        },
                        feedback: {
                            delayTime: 0.2,
                            wet: 0.2
                        },
                        distortion: {
                            wet: 0.5
                        }
                    },
                    noteUrls: {
                        "A3": "A3.wav",
                        "A#3": "Asharp3.wav",
                        "B3": "B3.wav",
                        "C3": "C3.wav",
                        "C#3": "Csharp3.wav",
                        "D3": "D3.wav",
                        "D#3": "Dsharp3.wav",
                        "E3": "E3.wav",
                        "F3": "F3.wav",
                        "F#3": "Fsharp3.wav",
                        "G3": "G3.wav",
                        "G#3": "Gsharp3.wav"
                    }
                }
            }
        }
        this.isLoading = false;
        this.machine = new Machine();

        this.machine.initialize(machinesetup).then(() => {
            this.initializeControllers();
            this.initializeEvents();
        });

        this.setupEntries;

        this.getSetupEntries().then((res) => {
            this.setupEntries = res;
        })
    }

    onCard(id) {
        if (id != null) {
            if (this.setupEntries.includes(String(id))) {
                // setTimeout(() => {
                this.isLoading = true;
                this.getSetup(id).then(res => {
                    if (res) {
                        this.loadState(res);
                        this.sendState();
                    } else {
                        console.log("failed to load setup")
                    }
                    this.isLoading = false;
                });
                // }, 100)
            } else {
                console.log("unknown setup")
            }
        } else {
            this.sendState();
        }
    }

    initializeEvents() {
        window.addEventListener('connection', (e) => {
            this.sendState();
        });

        window.addEventListener('steptick', () => {
            this.sendSequencerStep();
        });

        window.addEventListener('mytick', () => {
            this.send('tick');
        });

        window.addEventListener('/save', (e) => {
            if (e.detail) {
                // check if detected card has already be written
                // if no write

                let tempId = this.findNextAvailableID();
                this.send("writecard", String(tempId));
                // wait for success result write card 
                window.addEventListener('writingresult', (e) => {
                    const res = JSON.parse(e.detail);
                    if (res.success) {
                        this.saveState(res.id).then(res => {
                            this.setupEntries = res;
                        })
                    }
                    else {
                        console.log("error while saving, reason=", res.detail);
                    }
                }, { once: true })
            }
        });
    }

    findNextAvailableID() {
        let n = 0;
        this.setupEntries.forEach(nums => {
            n = parseInt(nums) + 1;
            if (!this.setupEntries.includes(String(n))) {
                return
            }
        })
        return n;
    }

    initializeControllers() {
        window.addEventListener('load', (e) => {
            if (e.detail != 'undefined') {
                this.onCard(parseInt(e.detail));
            } else {
                console.log("blank card");
            }
        });

        // sequencer matrix event listeners
        const sequencermat = ["button1", "button2", "button3", "button4", "button5", "button6", "button7", "button8", "button9", "button10", "button11", "button12", "button13", "button14", "button15", "button16"];
        sequencermat.forEach((button) => {
            window.addEventListener('/sequencer/' + button, (event) => {
                if (!this.isLoading) {
                    let step = parseInt(button.split('button')[1]) - 1;
                    this.machine.updateSequencer(step);
                    this.sendSequencerMatrix();
                }
            });
        });

        // instrument controls
        window.addEventListener(String('/instrumentselector'), (event) => {
            if (!this.isLoading) {
                this.machine.selected = event.detail;
                this.sendState();
            }
        });

        window.addEventListener(String('/sequencerloop/onoff'), (event) => {
            if (!this.isLoading) {
                if (event.detail == true) {
                    this.machine.startSequencer();
                } else {
                    this.machine.stopSequencer();
                }
                this.sendState();
            }
        });

        window.addEventListener(String('/bpmcontrol'), (event) => {
            if (!this.isLoading) {
                this.machine.setBPM(event.detail);
                this.sendState();
            }
        });

        const effectsliders = ['slider1', 'slider2', 'slider3', 'slider4'];
        effectsliders.forEach((slider) => {
            window.addEventListener('/effectscontrol/' + slider, (event) => {
                if (!this.isLoading) {
                    let nslider = parseInt(slider.split('slider')[1]) - 1;
                    this.machine.setInstrumentEffect(nslider, event.detail);
                    this.sendState();
                }
            })
        });

        // window.addEventListener("/slidermaster", (event) => {
        //     if (!this.isLoading) {
        //         this.machine.setCurrentVolume(event.detail);
        //         this.sendState();
        //     }
        // })

        window.addEventListener(String('/chordselector'), (event) => {
            if (!this.isLoading) {
                this.machine.onChord(event.detail);
            }
        });

        window.addEventListener(String('/gigaset/slider1_y'), (event) => {
            if (!this.isLoading) {
                this.machine.onHarp(event.detail);
            }
        });
    }

    async saveState(id) {
        return new Promise((done, fail) => {
            let state = this.machine.getState();
            let saving = {}
            saving.instruments = state.instruments;
            saving.sequencer = state.sequencer;
            const obj = { "id": id, "state": saving }
            fetch('/machinesave/', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(obj)
            }).then((result => {
                result.blob().then(data => {
                    data.text().then(r => {
                        let json = JSON.parse(r);
                        if (json != {}) {
                            done(json)
                        }
                        done(null)
                    })
                })
            })).catch((err => {
                fail(err)
            }))
        })
    }

    loadState(setup) {
        this.machine.updateSetup(setup);
    }

    async getSetupEntries() {
        return new Promise(finito => {
            fetch('/machinesetupentries/').then((res => {
                res.blob().then(data => {
                    data.text().then(r => {
                        let json = JSON.parse(r);
                        if (json != {}) {
                            finito(json)
                        }
                        finito(null)
                    })
                })
            }))
        })
    }

    async getSetup(id) {
        return new Promise(finito => {
            fetch('/machinesetup/' + String(id)).then((res => {
                res.blob().then(data => {
                    data.text().then(r => {
                        let json = JSON.parse(r);
                        if (json != {}) {
                            finito(json);
                        }
                        finito(null)
                    })
                })
            }))
        })
    }

    getState() {
        let state = this.machine.getState()
        return {
            'machine': state
        }
    }

    sendState() {
        let state = this.getState();
        this.send('state', state);
        this.sendSequencerMatrix();
    };

    sendSequencerMatrix() {
        this.send('seqmatrix', this.machine.getSequencerMatrix());
    };

    sendSequencerStep() {
        this.send('seqstep', this.machine.getSequencerStep());
    };

    send(key, value = '') {
        if (window.zombitron.zombiterface.ready) {
            let message = { 'data': {} };
            message.data[key] = value;
            window.zombitron.zombiterface.send(message);
        }
    };
}