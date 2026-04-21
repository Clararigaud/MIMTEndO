const Obsokit = require("./obsokit/server/src/Obsokit");

const obsokit = new Obsokit();

function getConfig() {
    const fs = require('fs')
    return JSON.parse(fs.readFileSync(__dirname + '/data/setups.json'))
}

function writeConfig(id, config){
    const oldConfig = getConfig();
    if(oldConfig.hasOwnProperty(id)){
        console.log("erasing previous")
    }
    oldConfig[id] = config;
    const fs = require('fs')
    fs.writeFileSync(__dirname + '/data/setups.json', JSON.stringify(oldConfig));
    return oldConfig;
}

obsokit.app.get('/machinesetup/:id', function (req, res) {
    const id = req.params.id;
    let config = getConfig();
    if (config.hasOwnProperty(id)) {
        res.send(config[id]);
    } else {
        res.send({});
    }
});

obsokit.app.get('/machinesetupentries', function (req, res) {
    let config = getConfig();
    if (config) {
        res.send(Object.keys(config));
    } else {
        res.send({});
    }
});

obsokit.app.use(obsokit.express.json())
obsokit.app.post('/machinesave/', function (req, res) {
    const postData = req.body;
    let newconf = writeConfig(postData.id, postData.state);
    res.send(Object.keys(newconf));
});

obsokit.start();