// controller
import Controller from '/assets/js/app/Controller.js';

window.musiccontroller = null;
async function start() {
    console.log("start")
    try {
        window.musiccontroller = new Controller();
    } catch (e) {
        alert(e)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', () => {

        if (window.obsokit.obsobrowsercli) {
            if (window.obsokit.obsobrowsercli.ready) {
                console.log("lala")
                start();
            } else {
                window.addEventListener("obsokitready", async (event) => {
                    start()
                }, { once: true });
            }
        } else {
            window.addEventListener("obsokitready", async (event) => {
                start()
            }, { once: true });
        }
    }, { once: true });
})