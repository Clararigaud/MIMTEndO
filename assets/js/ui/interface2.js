var selected = 0;
var selector;
window.addEventListener('obsokitready', function (e) {
    selector = window.obsokit.obsobrowsercli.find("selector");
    selector.change = function () {
        selected = selector.getValue();
        document.getElementById('container').setAttribute('value', String(selected.split("b-")[1]));
    }
});

window.addEventListener('state', function (e) {
    var selected = parseInt(e.detail.machine.sequencer.selected);
    document.getElementById('container').setAttribute('value', String(selected));
    var currentinstru = e.detail.machine.instruments.sequencer[selected];
    updateSlider(currentinstru, 0);
    updateSlider(currentinstru, 1);
    updateSlider(currentinstru, 2);
    updateSlider(currentinstru, 3);

    selector.updateIfChanged(e.detail.machine.sequencer.selected)
});

function updateSlider(instru, n) {
    if (instru.controls.length > n) {
        var control = instru.controls[n]
        window.obsokit.obsobrowsercli.find("slider" + String(n + 1)).updateIfChanged({ "value": instru.effects[control[0]].slidervalue[control[1]] })
    }
    else {
        window.obsokit.obsobrowsercli.find("slider" + String(n + 1)).updateIfChanged({ "value": 0 })
    }
}