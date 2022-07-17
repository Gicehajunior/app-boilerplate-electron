const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path'); 

class Dashboard {
    constructor() {
        this.current_directory = process.cwd();
        let datetime_now = new Date();
        this.datetime_now = datetime_now.toISOString().slice(0, 19).replace('T', ' ');  
    }

    save() {
        console.log("save a resource!");
    }
}

module.exports = Dashboard;


