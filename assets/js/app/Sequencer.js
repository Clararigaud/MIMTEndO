export default class Sequencer {
    constructor(size) {
        this.step = 0;
        this.size = size;
        this.instruments = [];
        this.steptickevent = new CustomEvent('steptick', {});
        this.tickevent = new CustomEvent('mytick', {});

    }

    async initialize(instruments, matrix) {
        this.instruments = instruments;
        this.matrix = this.initializeMatrix(matrix);
        this.loop = new Tone.Loop((time) => {
            this.playSounds(time);
            this.step = (this.step + 1) % this.size;
            this.sendStepTick();
            if (this.step % (this.size / 4) == 0) {
                this.sendTick();
            }
        }, String(this.size) + "n");
    }

    toggleMatrix(step, instru) {
        this.matrix[step][instru] = 1 - this.matrix[step][instru];
    }

    playSounds(time) { // go class Machine
        for (let i = 0; i < this.instruments.length; i++) {
            const active = this.matrix[this.step][i] == 1;
            if (active) {
                this.instruments[i].instrument.start(time);
            }
        }
    }

    start() {
        if (this.loop.state != 'started') {
            this.loop.start(this.step);
            this.started = true;
        }
    }

    stop() {
        if (this.loop.state != 'stopped') {
            this.loop.stop();
            this.started = false;
        }
    }

    initializeMatrix(matrixsetup) {
        let matrix = []

        if (matrixsetup) {
            matrix = matrixsetup
        }

        let step = [];
        for (let i = 0; i < this.size; i++) {
            step = [];
            for (let j = 0; j < this.instruments.length; j++) {
                step.push(0);
            }
            matrix.push(step);
        }
        return matrix;
    }

    getState() {
        let state = {
            step: this.step,
            matrix: this.matrix,
            started: (this.loop.state == 'started')
        }
        return state;
    }

    setMatrix(mat) {
        this.matrix = mat;
    }

    sendStepTick() {
        window.dispatchEvent(this.steptickevent);
    }

    sendTick() {
        window.dispatchEvent(this.tickevent);
    }
}