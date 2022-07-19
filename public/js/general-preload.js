
const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path');  
const alert = require("alert");
require('dotenv').config();
 
class GeneralPreload {
    constructor() {
        this.current_directory = process.cwd();
        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');  
    }

    index() { 
        const DateDomElements = document.querySelectorAll(".dom-date");
        const AppNameDomElements = document.querySelectorAll(".app-name");
        
        AppNameDomElements.forEach(AppNameDomElement => {
            if (document.body.contains(AppNameDomElement)) { 
                AppNameDomElement.innerHTML = process.env.APP_NAME; 
            }
        });

        DateDomElements.forEach(DateDomElement => {
            if (document.body.contains(DateDomElement)) {
                DateDomElement.innerHTML = this.date.getFullYear();
            }
        });
    }

}

module.exports = GeneralPreload;







