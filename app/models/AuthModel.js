const AppModel = require("./AppModel");
class AuthModel extends AppModel{
    
    constructor() {
        super();
    }

    database_table() {
        const table = [
            "users"
        ];

        return table;
    }
 
}

module.exports = AuthModel;


