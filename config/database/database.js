const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(database_connection='', host_name='', database_port='', database_name='', database_password='') {
        this.database_connection = "MYSQL";
        this.host_name = "127.0.0.1"; 
        this.database_port = 3306;
        this.database_name = "business_elite";
        this.database_password = "db_pass"; 
    }

    mysql_connection() {

    }

    sqlite3_connection(business_elite_database) {  
        const db = new sqlite3.Database('config/database/business_elite.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
        (err) => { 
            if (err) {
                console.log(err);
                if (err.message == "SQLITE_CANTOPEN: unable to open database file") {
                    db.run(`CREATE DATABASE [${business_elite_database}]`);
                    
                    return db;
                }

                return err.message;
            } 
        }); 

        return db
    }
}

module.exports = Database;


