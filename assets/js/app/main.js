// controller
import Controller from '/assets/js/app/Controller.js';

window.musiccontroller = null;
async function start() {
    try {
        window.musiccontroller = new Controller();
    } catch (e) {
        alert(e)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', () => {
        if (window.zombitron.zombiterface) {
            if (window.zombitron.zombiterface.ready) {
                start();
            }
        } else {
            window.addEventListener("zombiterfaceready", async (event) => {
                start()
            }, { once: true });
        }
    }, { once: true });
})