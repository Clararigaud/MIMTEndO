import "/scripts/tone/build/Tone.js";
import Sequencer from '/assets/js/app/Sequencer.js';
import { PlayerInstrument, SamplerInstrument } from "/assets/js/app/Instrument.js";

export default class Machine {
    constructor() {
        this.seqInstruments = [null, null, null, null];
        this.monotronInstrument = null;
        this.compressor;
        this.sequencer = new Sequencer(16);
        this.state = {
            initialized: false
        }

        this.selected = 0;
        this.currentChord = {
            name: '',
            notes: []
        };

        this.options = {
            bpm: {
                min: 20,
                max: 200,
                default: 100,
            }
        };

        this.bpmslider = null;
        Tone.context.resume();
    }

    async initialize(setup) {
        return new Promise((done) => {
            this.compressor = new Tone.Compressor(-30, 3).toMaster();
            this.setBPMFromBPMSpace(this.options.bpm.default);
            // this.setBPM( (this.options.bpm.default + this.options.bpm.min) * (this.options.bpm.max - this.options.bpm.min))
            Promise.all([
                this.initializeSequencer(setup.sequencer),
                new SamplerInstrument(this.compressor, setup.monotron.instrument).then((result) => { this.monotronInstrument = result; })
            ]).then(() => {
                Tone.Transport.start();
                this.state.initialized = true;
                // this.sequencer.start();
                done();
            })
        })
    }

    updateSetup(setup) {
        if (setup.bpm) {
            this.setBPMFromBPMSpace(setup.bpm);
        }
        if (setup.hasOwnProperty("sequencer")) {
            if (setup.sequencer.hasOwnProperty("matrix")) {
                if (setup.sequencer.matrix.length > 0) {
                    this.sequencer.setMatrix(setup.sequencer.matrix)
                }
            }
        }
        if (setup.hasOwnProperty("instruments")) {
            if (setup.instruments.hasOwnProperty("sequencer")) {
                setup.instruments.sequencer.forEach((instru, i) => {
                    if(instru.hasOwnProperty("volume") && this.seqInstruments[i].volume){
                        this.seqInstruments[i].setVolume(instru.volume)
                    }
                    if(instru.hasOwnProperty("effects")){
                        const effects = instru.effects;
                        Object.keys(effects).forEach((effect)=>{
                            Object.keys(effects[effect]["value"]).forEach((variable)=>{
                                this.seqInstruments[i].effects.setParam(effect, variable, effects[effect]["value"][variable])
                            })
                        })
                    }
                })
            }
            if (setup.instruments.hasOwnProperty("monotron")) {

            }
        }
    }

    async initializeSequencer(seq_setup) {
        return new Promise((done) => {
            Promise.all([
                new PlayerInstrument(this.compressor, seq_setup.instruments[0]).then((r) => { this.seqInstruments[0] = r }),
                new PlayerInstrument(this.compressor, seq_setup.instruments[1]).then((r) => { this.seqInstruments[1] = r }),
                new PlayerInstrument(this.compressor, seq_setup.instruments[2]).then((r) => { this.seqInstruments[2] = r }),
                new PlayerInstrument(this.compressor, seq_setup.instruments[3]).then((r) => { this.seqInstruments[3] = r })
            ]).then(() => {
                this.sequencer.initialize(this.seqInstruments, seq_setup.matrix);
                done();
            })
        })
    }

    getInstrumentsState() {
        let instruments = {};
        instruments.sequencer = [];
        this.seqInstruments.forEach((instru, i) => {
            instruments.sequencer.push(instru.getState());
        });
        instruments.monotron = this.monotronInstrument.getState();
        return instruments;
    }

    getState() {
        let state = this.state;
        state.options = this.options;
        state.bpm = { value: this.getBPM(), slidervalue: this.getNormBPM() };
        state.sequencer = this.sequencer.getState();
        state.instruments = this.getInstrumentsState();
        state.sequencer.selected = this.selected;
        return state;
    }

    sliderToBPM(v) {
        return v * (this.options.bpm.max - this.options.bpm.min) + this.options.bpm.min;
    }

    getBPM() {
        return Math.round(this.sliderToBPM(this.bpmslider));
    }

    getNormBPM() {
        return this.bpmslider;
    }


    setBPMFromBPMSpace(bpmvalue) {
        this.setBPM((bpmvalue - this.options.bpm.min) / (this.options.bpm.max - this.options.bpm.min))
    }

    setBPM(value) {
        if (this.getNormBPM() != value) {
            this.bpmslider = value;
            Tone.Transport.bpm.value = this.getBPM();
        }
    }

    // INSTRUMENTS CONTROL OPTIONS
    setCurrentVolume(v) {
        this.seqInstruments[this.selected].setVolume(v);
    }

    setCurrentEffect(effect, value) {
        this.seqInstruments[this.selected].setEffect(effect, value);
    }

    setInstrumentEffect(nslider, value) {
        let targetInstrument;
        if (this.selected < this.seqInstruments.length) {
            targetInstrument = this.seqInstruments[this.selected];
        } else if (this.selected = 5) {
            targetInstrument = this.monotronInstrument;
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