window.addEventListener('obsokitready', function (objobsokit) {
    let obso = objobsokit.detail;
    obso.sendMsg("ping");
    obso.listen('state', function (e) { // get current machine values on load
        let state = e.machine;
        document.querySelector('#bpms p').innerHTML = state.bpm.value;
    });

    obso.listen('setup', function (e) { // updating bpm value displayed
        let state = e.machine;
        document.querySelector('#bpms p').innerHTML = state.bpm.value;
        obso.log(state.bpm.value)
        obso.find("sliderbpm").updateIfChanged(state.bpm.slidervalue);
        obso.find("startstop").updateIfChanged(state.sequencer.started);
    });
});