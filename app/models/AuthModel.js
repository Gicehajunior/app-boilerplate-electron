const AppModel = require("./AppModel");
const AppUserSession = require("../../config/services/SessionService");

class AuthModel extends AppModel{
    
    constructor() {
        super();
        this.auth = new AppUserSession();
        this.session = this.auth.session();
    }

    database_table() {
        const table = [
            "users"
        ];

        return table;
    }
 
}

module.exports = AuthModel;


