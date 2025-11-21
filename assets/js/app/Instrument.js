import EffectsFactory from '/assets/js/app/EffectsFactory.js';

class Instrument {
    constructor(instru, output, params) {
        this.options = {
            volume: {
                min: 0,
                max: 1,
                default: 0.5
            }
        };
        this.instrument = instru; // Tone Instance

        this.params = {};
        this.volume = new Tone.Volume(this.volumeToDB(0.5));
        this.setVolume(0.5);

        this.effects = new EffectsFactory(params.effects);
        let nodes = [];
        nodes = this.effects.getNodes();
        nodes.push(this.volume);
        nodes.push(output);
        this.instrument.chain(nodes[0]);
        for (let i = 1; i < nodes.length; i++) {
            nodes[i - 1].chain(nodes[i])
        }
        
        this.effectControls = [];
        if (params.controls) {
            this.effectControls = this.initEffectControls(params.controls);
        }
    }

    initEffectControls(controls) {
        let assignedControls = [];
        controls.forEach(control => {
            let c = control.split(".");
            if (this.effects.nodes.hasOwnProperty(c[0])) {
                if (this.effects.nodes[c[0]].params.hasOwnProperty(c[1])) {
                    assignedControls.push(c);
                } else {
                    console.log('no variable named', c[0], ">", c[1])
                }
            } else {
                console.log('no effect named', c[0])
            }
        });
        return assignedControls;
    }

    getState() {
        return {
            'volume': this.params.volume,
            'effects': this.effects.getState(),
            'controls': this.effectControls
        }
    }

    getParamValue(realvalue, param) {
        return (realvalue - this.options[param].min) / (this.options[param].max - this.options[param].min);
    }

    setVolume(v) {
        let volumedb = this.volumeToDB(v);
        this.volume.volume.value = volumedb;
        this.params.volume = v;
    }

    volumeToDB(vol) {
        return Math.round(20 * Math.log10((vol / 2 + 0.000001) * 10));
    }

    setControllableEffect(nvariable, value) {
        if (this.effectControls[nvariable]) {
            this.effects.changeParam(this.effectControls[nvariable][0], this.effectControls[nvariable][1], value);
        }
        else { console.log(nvariable, " is not assigned") }
    }
}

class PlayerInstrument extends Instrument {
    constructor(output, params) {
        let tonobj;
        return new Promise((result) => {
            new Promise((done) => {
                tonobj = new Tone.Player(params.url, done);
            }).then(() => {
                new Promise(() => {
                    super(tonobj, output, params);
                    result(this)
                })
            })
        })
    }
}

class SamplerInstrument extends Instrument {
    constructor(output, params) {
        let tonobj;
        return new Promise((result) => {
            new Promise((done) => {
                tonobj = new Tone.Sampler(params.noteUrls, done, params.url);
            }).then((res) => {
                super(tonobj, output, params);
                result(this)
            })
        })
    }
}
export { Instrument, PlayerInstrument, SamplerInstrument }