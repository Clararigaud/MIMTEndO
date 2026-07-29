document.addEventListener('DOMContentLoaded', () => {
    let sequencer = document.querySelector('#sequencer-container');
    for (let i = 0; i < 16; i++) {
        let row = Math.floor(i / 4);
        let col = i % 4;
        let n = 13 - col * 4 + row;
        let btn = document.createElement('div');
        let options = { type: 'button', toggle: true }
        let btnid = 'button' + String(n);
        btn.setAttribute('id', btnid);
        btn.setAttribute('data-obsokit', JSON.stringify(options));
        btn.classList.add('row-' + row, 'col-' + col);
        for (let j = 0; j < 4; j++) {
            let objs = document.createElement('div');
            objs.setAttribute('id', btnid + "-" + j);
            objs.classList.add('sub-button', 'instrument-' + j);
            btn.append(objs)
        }
        sequencer.appendChild(btn);
    }
});



window.addEventListener('obsokitready', function (objobsokit) {
    let obso = objobsokit.detail;
    let matrix = [];
    obso.listen('seqmatrix', function (m) {
        updateMatrix(m);
    });

    obso.listen('seqstep', (e) => {
        updateStep(e);
    });

    async function updateStep(step) {
        let current = document.querySelectorAll('.current');
        current.forEach((c) => {
            if (current) {
                c.classList.remove('current');
            }
        })
        document.querySelector('#button' + String(step + 1)).classList.add('current');
        for (let i = 0; i < 4; i++) {
            if (matrix[step][i]) {
                document.querySelector('#instrulight-' + String(i + 1)).classList.add('current');
            }
        }
    }

    async function updateMatrix(newmat) {
        if (JSON.stringify(Array.from(matrix)) != JSON.stringify(Array.from(newmat))) {
            matrix = newmat;
            matrix.forEach((m, step) => {
                let button = document.getElementById('button' + String(step + 1));
                if (button) {
                    m.forEach((instru, i) => {
                        let subbutton = button.querySelector('.sub-button.instrument-' + String(i));
                        if (subbutton) {
                            if (m[i] == 1) {
                                subbutton.classList.add('activated');
                            } else {
                                subbutton.classList.remove('activated');
                            }
                        }
                    })
                }
            });
        }
    }
})