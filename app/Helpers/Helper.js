const electron = require('electron');
const { dialog } = electron;    

class Helper{ 
    constructor(BrowserWindow = undefined) {  
        this.BrowserWindow = BrowserWindow; 
    }
    
    showAlertDialog(NotificationMessageObject) {
        const Window = this.BrowserWindow.getFocusedWindow(); 

        dialog.showMessageBox(Window, {
            type: (NotificationMessageObject.status) ? NotificationMessageObject.status : undefined,
            title: (NotificationMessageObject.title) ? NotificationMessageObject.title : undefined,
            message: (NotificationMessageObject.message) ? NotificationMessageObject.message : undefined,
            buttons: (NotificationMessageObject.buttons) ? NotificationMessageObject.buttons : [],
            defaultId: (NotificationMessageObject.defaultId) ? NotificationMessageObject.defaultId : undefined,
            signal: (NotificationMessageObject.signal) ? NotificationMessageObject.signal : undefined,
            detail: (NotificationMessageObject.detail) ? NotificationMessageObject.detail : undefined,
            checkboxLabel: (NotificationMessageObject.checkboxLabel) ? NotificationMessageObject.checkboxLabel : undefined,
            checkboxChecked: (NotificationMessageObject.checkboxChecked) ? NotificationMessageObject.checkboxChecked : undefined,
            icon: (NotificationMessageObject.icon) ? NotificationMessageObject.icon : undefined,
            textWidth: (NotificationMessageObject.textWidth) ? NotificationMessageObject.textWidth : undefined,
            cancelId: (NotificationMessageObject.cancelId) ? NotificationMessageObject.cancelId : undefined,
            noLink: (NotificationMessageObject.noLink) ? NotificationMessageObject.noLink : undefined,
            normalizeAccessKeys: (NotificationMessageObject.normalizeAccessKeys) ? NotificationMessageObject.normalizeAccessKeys : undefined
        });
    } 

}

module.exports = Helper;