
const fs = require("fs");
const mail = require('./mail');
const electron = require("electron");
const { ipcRenderer } = electron;
const { app, contextBridge, BrowserWindow, ipcMain } = electron; 

class App{

    constructor(file_name = undefined) {  
        this.file = file_name; 
        this.current_directory = process.cwd(); 
    }

    initAlert(message) {
        ipcRenderer.send('/alertMessage', message);
    }

    file_parser(file_name, post_object = undefined) { 
        this.file = (this.file == undefined) ? file_name : this.file;

        const file_buffer = fs.readFileSync(this.file);

        if (file_buffer) {
            var file_ = this.removeSpaces(file_buffer.toString()); 

            for (const key in post_object) {  
                var search = `{{ ${key} }}`;
                if (file_.includes(search)) { 
                    file_ = file_.split(search).join(post_object[`${key}`]); 
                }  
            }  

            return file_;
        }

        return 'Oops unknown error!'; 
    }

    mail_parse(mail_template, data) {
        var mail_template = this.file_parser(
            `${this.current_directory}/${mail.markup_lang.default.path}${mail_template}.html`, 
            data
        );

        return mail_template;
    }

    removeSpaces(str) {
        var regexPattern = /\s+/g;
    
        var trimmed_str = str.replace(regexPattern, " ");
    
        return trimmed_str.trim();
    }

    route(view, route, data = {}) {  
        var current_app_dir = `${this.current_directory}`
        const CurrentWindow = BrowserWindow.getFocusedWindow();
        const path_route = `${current_app_dir}/${view}/${route}.html`;
        
        CurrentWindow.loadFile(path_route);
    }
}

module.exports = {App: App, initAlert: (new App()).initAlert};