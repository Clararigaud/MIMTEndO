window.addEventListener('obsokitready', function (objobsokit) {
    let obso = objobsokit.detail;

    const ndef = new NDEFReader();
    let writing = false;
    ndef.scan().then(() => {
        obso.container.requestFullscreen();
        ndef.onreadingerror = () => {
            alert("Cannot read data from the NFC tag. Try another one?");
        };
        let id = null;
        ndef.onreading = (event) => {
            for (const record of event.message.records) {
                if (record.recordType == "text") {
                    const decoder = new TextDecoder();
                    let obj = JSON.parse(decoder.decode(record.data));
                    if (obj.hasOwnProperty("id")) {
                        // alert(obj.id)
                        id = obj.id;
                    }
                }
            }
            if (obso.ready && !writing) {
                if (id) {
                    try {
                        let message = { 'data': { 'load': id } };
                        obso.send(message);
                    } catch (ee) {

                    }
                }
            }
        };
    }).catch(error => {
        alert(`Error! Scan failed to start: ${error}.`);
    });

    async function writeSetup(data, { timeout } = {}) {
        return new Promise((resolve, reject) => {
            writing = true;
            let id = data;
            const controller = new AbortController();
            controller.signal.onabort = () => {
                let message = { 'data': { 'writingresult': JSON.stringify({ "success": false, "id": id, "detail": "timeout" }) } };
                obso.send(message);
                showMessage("FAILED TO SAVE :(", 500)
                writing = false;
                resolve()
            }
            let ti = setTimeout(() => controller.abort(), timeout);

            // alert(id)
            ndef.addEventListener(
                "reading",
                (event) => {

                    clearTimeout(ti)
                    // alert(event.message)
                    if (event.message.id) {
                        id = event.message;
                        let message = { 'data': { 'writingresult': JSON.stringify({ "success": true, "id": id, "detail": "alreadywritten" }) } };
                        obso.send(message);
                        showMessage("SAVED :)", 500)
                        writing = false;
                        resolve()

                    } else {
                        ndef.write(JSON.stringify({ 'id': id }), { signal: controller.signal }).then(res => {
                            let message = { 'data': { 'writingresult': JSON.stringify({ "success": true, "id": id, "detail": "writing success" }) } };
                            obso.send(message);
                            showMessage("SAVED :)", 500)
                            writing = false;
                            resolve()

                        }).catch(fail => {
                            let message = { 'data': { 'writingresult': JSON.stringify({ "success": false, "id": id, "detail": "failure while writting" }) } };
                            obso.send(message);
                            showMessage("FAILED TO SAVE :(", 500)
                            writing = false;
                            resolve()

                        }
                        );
                    }
                },
                { once: true },
            );
        })
    }
    window.addEventListener('writecard', (e) => {
        writeSetup(e.detail, { timeout: 5000 })
    })

})