import EffectsFactory from '/assets/js/app/EffectsFactory.js';

class Instrument {
    constructor(instru, output, params) {
        this.instrument = instru; // Tone Instance
        this.name = params.name;
        this.initVolume();
        this.effects = new EffectsFactory(params.effects);

        this.plugNodes(output);

        this.effectControls = [];
        if (params.controls) {
            this.effectControls = this.initEffectControls(params.controls);
        }
    }

    plugNodes(output) {
        let nodes = [];
        nodes = this.effects.getNodes();
        nodes.push(this.volume.toneobj);
        nodes.push(output);
        this.instrument.chain(nodes[0]);
        for (let i = 1; i < nodes.length; i++) {
            nodes[i - 1].chain(nodes[i])
        }
    }

    initVolume() {
        this.volume = {};
        this.volume.value = 0.5;
        this.volume.toneobj = new Tone.Volume(this.volumeToDB(0.5));
        this.setVolume(0.5);
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
            'volume': this.volume.value,
            'effects': this.effects.getState(),
            'controls': this.effectControls
        }
    }

    setVolume(v) {
        let volumedb = this.volumeToDB(v);
        this.volume.toneobj.volume.value = volumedb;
        this.volume.value = v;
    }

    volumeToDB(vol) {
        return Math.round(20 * Math.log10((vol / 2 + 0.000001) * 10));
    }

    updateEffects(effects) {
        Object.keys(effects).forEach((effect) => {
            Object.keys(effects[effect]["value"]).forEach((variable) => {
                this.effects.setParam_ValueSpace(effect, variable, effects[effect]["value"][variable])
            })
        })
    }

    setControllableEffect(variable, value) {
        if (this.effectControls[variable]) {
            this.effects.setParam_NormSpace(this.effectControls[variable][0], this.effectControls[variable][1], value);
        }
        else { console.log(variable, " is not assigned") }
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