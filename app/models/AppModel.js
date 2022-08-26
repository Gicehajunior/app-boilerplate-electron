const electron = require('electron');
const { dialog } = electron; 

class AppModel {

    constructor () {
        this.current_directory = process.cwd();
        this.country = process.env.COUNTRY;
        this.database_type = process.env.DB_CONNECTION;

        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.created_at = this.datetime_now;
        this.updated_at = this.datetime_now;
    }

    static InitAlertModel(BrowserWindow, MessageObject) {
        const Window = BrowserWindow.getFocusedWindow();
        // console.log(MessageObject.message); 

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

module.exports = AppModel;
