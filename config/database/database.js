const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');

class Database {
    constructor(database_connection='', host_name='', database_port='', database_name='', database_username='', database_password='') {
        this.database_connection = database_connection;
        this.host_name = host_name; 
        this.database_port = database_port;
        this.database_name = database_name;
        this.database_username = database_username,
        this.database_password = database_password; 
    }

    mysql_connection() {
        const connection = mysql.createConnection({
            host: this.host_name,
            user: this.database_name,
            password: this.database_password
        });
          
        connection.connect((err) => {
            if (err) {
                throw err;
            }
            else {
                console.log("Connected!");
                return connection;
            }
        });
    }

    sqlite3_connection(business_elite_database) {  
        const db = new sqlite3.Database(`config/database/dump/${business_elite_database}.db`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
        (err) => { 
            if (err) {
                // Crone jobs will be implemented to handle this type of error!
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


