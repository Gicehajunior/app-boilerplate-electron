const AppModel = require("./AppModel");
class AuthModel extends AppModel{
    
    database_table() {
        const table = [
            "users"
        ];

        return table;
    }
 
}

module.exports = AuthModel;


