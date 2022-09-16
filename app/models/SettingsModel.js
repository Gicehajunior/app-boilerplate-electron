const AppModel = require("./AppModel");
const AppUserSession = require("../../config/services/SessionService");

class SettingsModel extends AppModel{
    
    constructor() {
        super();
        this.auth = new AppUserSession();
        this.session = this.auth.session();
    }

    database_table() {
        const table = [
            "settings"
        ];

        return table;
    }
 
}

module.exports = SettingsModel;


