window.addEventListener('obsokitready', function (objobsokit) {
    let obso = objobsokit.detail;
    obso.send({ 'data': { "ping": null } });

    window.addEventListener('state', function (e) { // get current machine values on load
        let state = e.detail.machine;
        obso.find("sliderbpm").updateIfChanged(state.bpm.slidervalue);
        obso.find("startstop").updateIfChanged(state.sequencer.started);
    }, { once: true });

    window.addEventListener('state', function (e) { // updating bpm value displayed
        let state = e.detail.machine;
        document.querySelector('#bpms p').innerHTML = state.bpm.value;
    });
});