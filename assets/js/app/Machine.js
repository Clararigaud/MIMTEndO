import "/scripts/tone/build/Tone.js";
import Sequencer from '/assets/js/app/Sequencer.js';
import { PlayerInstrument, SamplerInstrument } from "/assets/js/app/Instrument.js";

export default class Machine {
    constructor() {
        // instruments 
        this.instruments = [];
        this.compressor;
        this.sequencer = new Sequencer(16);
        this.state = {
            initialized: false
        }

        this.selected = 0;

        this.bpm = {
            min: 20,
            max: 200,
            default: 100,
            slidervalue: null
        };
        Tone.context.resume();
    }

    async initialize(setup) {
        let seqIndices = [null,null,null,null];
        return new Promise((done) => {
            this.compressor = new Tone.Compressor(-30, 3).toMaster();
            this.setBPM_SliderSpace(this.bpm.default);
            Promise.all(setup.instruments.map((instrument, i) => {
                // Check type
                if (instrument.type == "player") {
                    return new PlayerInstrument(this.compressor, instrument).then((r) => {
                        this.instruments.push(r)
                        if (setup.sequencer.instruments.includes(instrument.name)) {
                            seqIndices[setup.sequencer.instruments.indexOf(instrument.name)]= r
                        }
                    })
                } else {
                    return
                }
            })
            ).then(() => {
                //  get sequencer select
                this.sequencer.initialize(seqIndices); // getnames
                Tone.Transport.start();
                this.state.initialized = true;
                this.sequencer.start();
                done();
            })
        });
    }

    updateSetup(setup) {
        if (setup.sliderbpm) {
            this.setBPM_SliderSpace(setup.sliderbpm);
        }
        if (setup.hasOwnProperty("sequencer")) {
            if (setup.sequencer.hasOwnProperty("matrix")) {
                if (setup.sequencer.matrix.length > 0) {
                    this.sequencer.setMatrix(setup.sequencer.matrix)
                }
            }
        }
        if (setup.hasOwnProperty("instruments")) {
            setup.instruments.forEach((instru, i) => {
                if (instru.hasOwnProperty("slidermaster") && this.instruments[i].volume.value) {
                    this.instruments[i].setVolume(instru.slidermaster);
                }
                for (let k = 0; k < 4; k++) { // each sliders
                    if (instru.hasOwnProperty("slider" + String(k + 1))) {
                        this.instruments[i].setControllableEffect(k, instru["slider" + String(k + 1)]);
                    }
                }
            })
        }
    }

    getInstrumentsState() {
        let instruments = {};
        instruments.sequencer = [];
        this.instruments.forEach((instru, i) => {
            instruments.sequencer.push(instru.getState());
        });
        return instruments;
    }

    getState() {
        let state = this.state;
        state.bpm = { value: this.getBPM(), slidervalue: this.getNormBPM() };
        state.sequencer = this.sequencer.getState();
        state.instruments = this.getInstrumentsState();
        state.sequencer.selected = this.selected;
        return state;
    }

    sliderToBPM(v) {
        return v * (this.bpm.max - this.bpm.min) + this.bpm.min;
    }

    getBPM() {
        return Math.round(this.sliderToBPM(this.bpm.slidervalue));
    }

    getNormBPM() {
        return this.bpm.slidervalue;
    }


    setBPM_SliderSpace(bpmvalue) {
        this.setBPM_SliderSpace((bpmvalue - this.bpm.min) / (this.bpm.max - this.bpm.min))
    }

    setBPM_SliderSpace(value) {
        if (this.getNormBPM() != value) {
            this.bpm.slidervalue = value;
            Tone.Transport.bpm.value = this.getBPM();
        }
    }

    // INSTRUMENTS CONTROL OPTIONS
    setCurrentVolume(v) {
        this.instruments[this.selected].setVolume(v);
    }

    setSelectedInstrumentEffect(nslider, value) {
        let targetInstrument;
        if (this.selected < this.instruments.length) {
            targetInstrument = this.instruments[this.selected];
        } else { return }
        targetInstrument.setControllableEffect(nslider, value);
    }

    // SEQUENCER CONTROL FUNCTIONS 
    updateSequencer(step) {
        this.sequencer.toggleMatrix(step, this.selected);
    }

    getSequencerMatrix() {
        return this.sequencer.matrix;
    }

    getSequencerStep() {
        return this.sequencer.step;
    }

    startSequencer() {
        if (this.sequencer.loop.state != 'started') {
            this.sequencer.start();
        }
    }

    stopSequencer() {
        if (this.sequencer.loop.state != 'stopped') {
            this.sequencer.stop();
        }
    }
}