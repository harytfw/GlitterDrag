const fs = require('fs');
const path = require('path');
const process = require('process');
let filedata = fs.readFileSync(path.join(__dirname, '/en/messages.json'));
let data = JSON.parse(filedata);
for (const aK of Object.keys(data)) {
    if (data[aK]["message"]) {
        data[aK]["message"] = "";
    }
}
fs.writeFileSync(path.join(__dirname, 'messages_template.json'), JSON.stringify(data, null, 4));
process.exit(0);