import Machine from '/assets/js/app/Machine.js';
export default class Controller {
    constructor() {
        let instruments = "instruments1";

        let defaultstate = {
            "sequencer": {
                "matrix": [
                    [0,0,0,1],
                    [1,1,0,0],
                    [1,1,0,0],
                    [0,0,1,0],
                    [1,0,1,0],
                    [0,1,0,0],
                    [1,0,0,0],
                    [0,1,0,1],
                    [1,0,1,0],
                    [1,0,0,1],
                    [0,1,1,0],
                    [0,1,0,1],
                    [0,1,0,0],
                    [0,0,1,1],
                    [0,0,1,1],
                    [1,0,0,0]
                ]
            },
            "sliderbpm": 0.001+ Math.round(Math.random() * 100) / 100,
            "instruments": [
                {
                    "slidermaster": Math.round(Math.random() * 100) / 100,
                    "slider1": Math.round(Math.random() * 100) / 100,
                    "slider2": Math.round(Math.random() * 100) / 100,
                    "slider3": Math.round(Math.random() * 100) / 100,
                    "slider4": Math.round(Math.random() * 100) / 100
                },
                {
                    "slidermaster": Math.round(Math.random() * 100) / 100,
                    "slider1": Math.round(Math.random() * 100) / 100,
                    "slider2": Math.round(Math.random() * 100) / 100,
                    "slider3": Math.round(Math.random() * 100) / 100,
                    "slider4": Math.round(Math.random() * 100) / 100
                }, {
                    "slidermaster": Math.round(Math.random() * 100) / 100,
                    "slider1": Math.round(Math.random() * 100) / 100,
                    "slider2": Math.round(Math.random() * 100) / 100,
                    "slider3": Math.round(Math.random() * 100) / 100,
                    "slider4": Math.round(Math.random() * 100) / 100
                }, {
                    "slidermaster": Math.round(Math.random() * 100) / 100,
                    "slider1": Math.round(Math.random() * 100) / 100,
                    "slider2": Math.round(Math.random() * 100) / 100,
                    "slider3": Math.round(Math.random() * 100) / 100,
                    "slider4": Math.round(Math.random() * 100) / 100
                }
            ]
        }

        console.log(defaultstate.sliderbpm)
        this.isLoading = false;
        new Promise(finito => {
            fetch('/machineinstruments/' + String(instruments)).then((res => {
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
        }).then((instrus) => {
            this.machine = new Machine();

            this.machine.initialize(instrus).then(() => {
                this.initializeControllers();
                this.initializeEvents();
                this.loadState(defaultstate);
                this.sendState();
            });

            this.setupEntries;
            this.getSetupEntries().then((res) => {
                this.setupEntries = res;
            })

        })

    }

    onCard(id) { // NFC detected
        if (id != null) {
            if (this.setupEntries.includes(String(id))) {
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
            this.send('tick', Math.round(this.machine.getSequencerStep()/4));
        });

        window.addEventListener('iphone/savebutton/value', (e) => {
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

        window.addEventListener("ping", (event) => {
            this.sendState();
        })

        // sequencer matrix event listeners
        const sequencermat = ["button1", "button2", "button3", "button4", "button5", "button6", "button7", "button8", "button9", "button10", "button11", "button12", "button13", "button14", "button15", "button16"];
        sequencermat.forEach((button) => {
            window.addEventListener('sequencer/' + button + '/value', (event) => {
                if (!this.isLoading) {
                    let step = parseInt(button.split('button')[1]) - 1;
                    this.machine.updateSequencer(step);
                    this.sendSequencerMatrix();
                }
            });
        });

        // instrument controls
        window.addEventListener(String('iphone/selector/value'), (event) => {
            if (!this.isLoading) {
                this.machine.selected = parseInt(event.detail.split("b-")[1]);
                this.sendState();
            }
        });

        window.addEventListener(String('sequencer/startstop/value'), (event) => {
            if (!this.isLoading) {
                if (event.detail == true) {
                    this.machine.startSequencer();
                } else {
                    this.machine.stopSequencer();
                }
                this.sendState();
            }
        });

        window.addEventListener(String('sequencer/sliderbpm/value'), (event) => {
            if (!this.isLoading) {
                this.machine.setBPM_SliderSpace(event.detail);
                this.sendState();
            }
        });

        const effectsliders = ['slider1', 'slider2', 'slider3', 'slider4'];
        effectsliders.forEach((slider) => {
            window.addEventListener('iphone/' + slider + '/value', (event) => {
                if (!this.isLoading) {
                    let nslider = parseInt(slider.split('slider')[1]) - 1;
                    this.machine.setSelectedInstrumentEffect(nslider, event.detail);
                    this.sendState();
                }
            })
        });

        // window.addEventListener("/iphone/slidermaster/value", (event) => {
        //     if (!this.isLoading) {
        //         this.machine.setCurrentVolume(event.detail);
        //         this.sendState();
        //     }
        // })
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
        if (window.obsokit.obsobrowsercli.ready) {
            let message = { 'data': {} };
            message.data[key] = value;
            window.obsokit.obsobrowsercli.send(message);
        }
    };
}