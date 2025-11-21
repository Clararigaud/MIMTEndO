export default class EffectsFactory {
    constructor(effects) {
        this.effectsparams = {
            'feedback': {
                'feedback': { 'min': 0, 'max': 1, 'default': 1 },
                'delayTime': { 'min': 0, 'max': 0.25, 'default': 0.25 },
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'reverb': {
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'distortion': {
                'wet': { 'min': 0, 'max': 1, 'default': 0.2 }
            },
            'filter': {
                'frequency': { 'min': 0.1, 'max': 800, 'default': 200 }
            }
        };
        this.nodes = this.initializeEffects(effects);
    }

    nodesLen() {
        return Object.values(this.nodes).length;
    }

    initializeEffects(effects) {
        let effectsres = {};
        Object.keys(effects).forEach((effect) => {
            effectsres[effect] = this.initializeEffect(effect, effects[effect])
        })
        return effectsres;
    }

    initDefault(params, effect, evar) {
        if (params.hasOwnProperty(evar)) {
            this.effectsparams[effect][evar].default = params[evar];
            return params[evar]
        }

        return this.effectsparams[effect][evar].default
    }

    initParams(effectobj, params, effect) {
        let vars = Object.keys(this.effectsparams[effect]);
        vars.forEach(v => {
            if (params.hasOwnProperty(v)) {
                this.effectsparams[effect][v].default = params[v];
                effectobj.params[v] = params[v];
                effectobj.clampedparams[v] = this.toSliderSpace(params[v], this.effectsparams[effect][v]);
            }
        })
        return effectobj
    }

    getState() {
        let state = {}
        Object.keys(this.nodes).forEach((effect) => {
            state[effect] = {
                "value": this.nodes[effect].params,
                "slidervalue": this.nodes[effect].clampedparams
            }
        })
        return state
    }

    initializeEffect(effect, params) {
        let effectobj = {
            "node": null,
            "params": {},
            "clampedparams": {}
        }
        effectobj = this.initParams(effectobj, params, effect);
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

    changeParam(effect, param, value) {
        if (this.nodes.hasOwnProperty(effect)) {
            if (this.nodes[effect].params.hasOwnProperty(param)) {
                let newval = this.toEffectValueSpace(value, this.effectsparams[effect][param]);
                this.nodes[effect].node[param].value = newval;
                this.nodes[effect].params[param] = newval;
                this.nodes[effect].clampedparams[param] = value;
            }
        }
    }

    setParam(effect, param, value) {
        if (this.nodes.hasOwnProperty(effect)) {
            if (this.nodes[effect].params.hasOwnProperty(param)) {
                this.nodes[effect].node[param].value = value;
                this.nodes[effect].params[param] = value;
                this.nodes[effect].clampedparams[param] = this.toSliderSpace(value, this.effectsparams[effect][param]);
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

    toEffectValueSpace(v, option) {
        return this.clamp(v, option.min, option.max);
    }

    clamp(v, min, max) {
        return v * (max - min) + min;
    }

    toSliderSpace(v, option) {
        return (v - option.min) / (option.max - option.min);
    }
}