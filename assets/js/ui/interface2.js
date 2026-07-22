window.addEventListener('obsokitready', function (e) {
    var selected = 0;
    var selector;
    var obso = null;
    obso = e.detail;
    obso.send({ 'data': { "ping": null } });
    selector = obso.find("selector");

    window.addEventListener('state', function (e) { // first get current state on load 
        var state = e.detail.machine;
        updateInstru(state);

    }, { once: true });

    window.addEventListener('state', function (e) { // update selected interface only if selected instrument changed 
        var state = e.detail.machine;
        var selectorvalue = parseInt(selector.getValue().split("b-")[1]);
        if (selected != selectorvalue) {
            selected = selectorvalue;
            updateInstru(state);
        }
    });

    function updateSlider(instru, n) {
        if (instru.controls.length > n) {
            var control = instru.controls[n]
            window.obsokit.obsobrowsercli.find("slider" + String(n + 1)).updateIfChanged(instru.effects[control[0]].slidervalue[control[1]])
        }
        else {
            window.obsokit.obsobrowsercli.find("slider" + String(n + 1)).updateIfChanged(0)
        }
    }

    function updateInstru(state) {
        // Update instru 
        var currentinstru = state.instruments.sequencer[selected];
        updateSlider(currentinstru, 0);
        updateSlider(currentinstru, 1);
        updateSlider(currentinstru, 2);
        updateSlider(currentinstru, 3);
        document.getElementById('container').setAttribute('value', String(selected));
    }
});