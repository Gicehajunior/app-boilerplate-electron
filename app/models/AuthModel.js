const AppModel = require("./AppModel");
class AuthModel extends AppModel{
    
    constructor() {
        super();

        this.table = {
            users: "users"
        };
    }
 
}

module.exports = AuthModel;


