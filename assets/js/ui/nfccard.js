window.addEventListener('obsokitready', function (objobsokit) {
    let obso = objobsokit.detail;
    let writing = false;
    let id = null;
    let ti;
    const localNFCAddress = obso.name + "/" + obso.nfc.id + "/data";
    obso.listen(localNFCAddress, (e) => {
        let msg = e;
        if (msg[0].hasOwnProperty("id")) { // already recorded
            id = msg[0].id;
            if (obso.ready && !writing) {
                // load setup associated to ID
                try {
                    obso.sendMsg('load', id); // case we are not in a writing process, so we load the setup associated to ID if exists 
                } catch (ee) { }
            }
        }
    })

    async function writeSetup(data, { timeout } = {}) {
        return new Promise((resolve, reject) => {
            writing = true;
            let id = data;
            const controller = new AbortController();
            controller.signal.onabort = () => {
                obso.sendMsg('writingresult', JSON.stringify({ "success": false, "id": id, "detail": "timeout" }));
                showMessage("FAILED TO SAVE :(", 500)
                writing = false;
                resolve()
            }
            ti = setTimeout(() => controller.abort(), timeout);

            obso.listen(localNFCAddress, (e) => {
                let msg = e;
                clearTimeout(ti)
                if (msg[0].hasOwnProperty("id")) { // already recorded
                    id = msg[0].id;
                    obso.sendMsg('writingresult', JSON.stringify({ "success": true, "id": id, "detail": "alreadywritten" }));
                    showMessage("SAVED :)", 500)
                    writing = false;
                    resolve()
                } else {
                    obso.nfc.ndef.write(id, { signal: controller.signal }).then(res => {
                        obso.sendMsg('writingresult', JSON.stringify({ "success": true, "id": id, "detail": "writing success" }));
                        showMessage("SAVED :)", 500)
                        writing = false;
                        resolve()
                    }).catch(fail => {
                        obso.sendMsg('writingresult', JSON.stringify({ "success": false, "id": id, "detail": "failure while writing" }));
                        showMessage("FAILED TO SAVE :(", 500)
                        writing = false;
                        resolve()
                    });
                }
            }, { once: true });
        })
    }
    obso.listen('writecard', (e) => {
        writeSetup(e, { timeout: 5000 })
    })
})