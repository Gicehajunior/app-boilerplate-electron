const AppModel = require("./AppModel"); 

class DashboardModel extends AppModel{
    
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

module.exports = DashboardModel;


