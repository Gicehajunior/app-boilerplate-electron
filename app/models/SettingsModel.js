const AppModel = require("./AppModel"); 

class SettingsModel extends AppModel{
    
    constructor() {
        super(); 
    }

    database_table() {
        const table = [
            "settings"
        ];

        return table;
    }
 
}

module.exports = SettingsModel;


