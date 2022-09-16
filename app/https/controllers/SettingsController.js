const electron = require('electron');
const { dialog } = electron; 
const SettingsModel = require("../../models/SettingsModel");   

class SettingsController extends SettingsModel{

    constructor(db, BrowserWindow = undefined) {
        super();
        this.db = db;  
        this.BrowserWindow = BrowserWindow;
        this.post_object = undefined; 
    }
    
    InitAlertModel(MessageObject) {
        const Window = this.BrowserWindow.getFocusedWindow(); 

        dialog.showMessageBox(Window, {
            type: (MessageObject.status) ? MessageObject.status : undefined,
            title: (MessageObject.title) ? MessageObject.title : undefined,
            message: (MessageObject.message) ? MessageObject.message : undefined,
            buttons: (MessageObject.buttons) ? MessageObject.buttons : [],
            defaultId: (MessageObject.defaultId) ? MessageObject.defaultId : undefined,
            signal: (MessageObject.signal) ? MessageObject.signal : undefined,
            detail: (MessageObject.detail) ? MessageObject.detail : undefined,
            checkboxLabel: (MessageObject.checkboxLabel) ? MessageObject.checkboxLabel : undefined,
            checkboxChecked: (MessageObject.checkboxChecked) ? MessageObject.checkboxChecked : undefined,
            icon: (MessageObject.icon) ? MessageObject.icon : undefined,
            textWidth: (MessageObject.textWidth) ? MessageObject.textWidth : undefined,
            cancelId: (MessageObject.cancelId) ? MessageObject.cancelId : undefined,
            noLink: (MessageObject.noLink) ? MessageObject.noLink : undefined,
            normalizeAccessKeys: (MessageObject.normalizeAccessKeys) ? MessageObject.normalizeAccessKeys : undefined
        });
    } 
}

module.exports = SettingsController;