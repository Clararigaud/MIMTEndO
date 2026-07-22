export default class EffectsFactory {
    constructor(effects) {
        this.effectsparams = {
            'feedback': { // Tone FeedbackDelay
                'feedback': { 'min': 0, 'max': 1, 'default': 1 },
                'delayTime': { 'min': 0, 'max': 0.25, 'default': 0.25 },
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'reverb': { // Tone JCReverb
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'distortion': { // Tone Distortion
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'filter': { // Tone Filter
                'frequency': { 'min': 0.1, 'max': 800, 'default': 200 }
            }
        };
        this.nodes = Object.fromEntries(Object.keys(effects).map(effect => [effect, this.initializeEffect(effect, effects[effect])]));
    }

    nodesLen() {
        return Object.values(this.nodes).length;
    }

    getState() {
        let state = {}
        Object.keys(this.nodes).forEach((effect) => {
            state[effect] = {
                "value": this.nodes[effect].params,
                "slidervalue": this.nodes[effect].normedParams
            }
        })
        return state
    }

    initializeEffect(effect, params) {
        let effectobj = {
            "node": null,
            "params": {},
            "normedParams": {}
        }

        let vars = Object.keys(this.effectsparams[effect]);
        vars.forEach(v => {
            if (params.hasOwnProperty(v)) {
                this.effectsparams[effect][v].default = params[v];
                effectobj.params[v] = params[v];
                effectobj.normedParams[v] = this.toNormSpace(params[v], this.effectsparams[effect][v]);
            }
        })

        switch (effect) {
            case 'feedback':
                effectobj.node = new Tone.FeedbackDelay(effectobj.params.delayTime, effectobj.params.feedback);
                break;
            case 'reverb':
                effectobj.node = new Tone.JCReverb(effectobj.params.wet);
                break;
            case 'distortion':
                effectobj.node = new Tone.Distortion(effectobj.params.wet);
                break;
            case 'filter':
                effectobj.node = new Tone.Filter(effectobj.params.frequency, 'bandpass');
                break;
            default:
                break;
        };
        return effectobj;
    }

    setParam_NormSpace(effect, param, value) { // from 0..1 space
        this.updateParam(effect, param, value, this.toValueSpace(value, this.effectsparams[effect][param]));
    }

    setParam_ValueSpace(effect, param, value) { // from param space
        this.updateParam(effect, param, this.toNormSpace(value, this.effectsparams[effect][param]), value);
    }

    updateParam(effect, param, valuenorm, valueeffect) {
        if (this.nodes.hasOwnProperty(effect)) {
            if (this.nodes[effect].params.hasOwnProperty(param)) {
                this.nodes[effect].node[param].value = valueeffect;
                this.nodes[effect].params[param] = valueeffect;
                this.nodes[effect].normedParams[param] = valuenorm;
            }
        }
    }

    getNodes() {
        let nodes = [];
        Object.keys(this.nodes).forEach(effect => {
            nodes.push(this.nodes[effect].node)
        })
        return nodes;
    }

    toValueSpace(v, option) {
        return v * (option.max - option.min) + option.min;
    }

    toNormSpace(v, option) {
        return (v - option.min) / (option.max - option.min);
    }
}