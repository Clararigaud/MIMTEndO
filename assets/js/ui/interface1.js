window.addEventListener('obsokitready', function (e) {
window.addEventListener('state', function (e) {
    document.querySelector('#bpms p').innerHTML = e.detail.machine.bpm.value;
    window.obsokit.obsobrowsercli.find("sliderbpm").updateIfChanged(e.detail.machine.bpm.slidervalue)
});
window.addEventListener('state', function (e) {
    window.obsokit.obsobrowsercli.find("startstop").updateIfChanged(e.detail.machine.sequencer.started);
});
//     const ndef = new NDEFReader();
//     let writing = false;
//     ndef.scan().then(() => {
//         ndef.onreadingerror = () => {
//             alert("Cannot read data from the NFC tag. Try another one?");
//         };
//         let id = null;
//         ndef.onreading = (event) => {
//             for (const record of event.message.records) {
//                 if (record.recordType == "text") {
//                     const decoder = new TextDecoder();
//                     let obj = JSON.parse(decoder.decode(record.data));
//                     if (obj.hasOwnProperty("id")) {
//                         // alert(obj.id)
//                         id = obj.id;
//                     }
//                 }
//             }
//             if (window.obsokit.obsobrowsercli.ready && !writing) {
//                 if (id) {
//                     try {
//                         let message = { 'data': { 'load': id } };
//                         window.obsokit.obsobrowsercli.send(message);
//                     } catch (ee) {

//                     }
//                 }
//             }
//         };
//     }).catch(error => {
//         alert(`Error! Scan failed to start: ${error}.`);
//     });

//     async function writeSetup(data, { timeout } = {}) {
//         return new Promise((resolve, reject) => {
//             writing = true;
//             let id = data;
//             const controller = new AbortController();
//             controller.signal.onabort = () => {
//                 let message = { 'data': { 'writingresult': JSON.stringify({ "success": false, "id": id, "detail": "timeout" }) } };
//                 window.obsokit.obsobrowsercli.send(message);
//                 showMessage("FAILED TO SAVE :(", 500)
//                 writing = false;
//                 resolve()
//             }
//             let ti = setTimeout(() => controller.abort(), timeout);

//             // alert(id)
//             ndef.addEventListener(
//                 "reading",
//                 (event) => {

//                     clearTimeout(ti)
//                     // alert(event.message)
//                     if (event.message.id) {
//                         id = event.message;
//                         let message = { 'data': { 'writingresult': JSON.stringify({ "success": true, "id": id, "detail": "alreadywritten" }) } };
//                         window.obsokit.obsobrowsercli.send(message);
//                         showMessage("SAVED :)", 500)
//                         writing = false;
//                         resolve()

//                     } else {
//                         ndef.write(JSON.stringify({ 'id': id }), { signal: controller.signal }).then(res => {
//                             let message = { 'data': { 'writingresult': JSON.stringify({ "success": true, "id": id, "detail": "writing success" }) } };
//                             window.obsokit.obsobrowsercli.send(message);
//                             showMessage("SAVED :)", 500)
//                             writing = false;
//                             resolve()

//                         }).catch(fail => {
//                             let message = { 'data': { 'writingresult': JSON.stringify({ "success": false, "id": id, "detail": "failure while writting" }) } };
//                             window.obsokit.obsobrowsercli.send(message);
//                             showMessage("FAILED TO SAVE :(", 500)
//                             writing = false;
//                             resolve()

//                         }
//                         );
//                     }
//                 },
//                 { once: true },
//             );
//         })
//     }
//     window.addEventListener('writecard', (e) => {
//         // alert(e.detail)
//         writeSetup(e.detail, { timeout: 5000 })
//     })
})



