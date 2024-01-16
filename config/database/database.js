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

    create_mysql_database() { 
        const connection = mysql.createConnection({
            host: this.host_name,
            user: this.database_username,
            password: this.database_password
        });
        
        const connection_response_promise = new Promise(resolve => {
            connection.connect((err) => {
                if (err) {
                     
                    resolve(err.message);
                } 
                else {
                    connection.query(`CREATE DATABASE ${this.database_name}`, (err, result) => {
                        if (err) {
                            resolve(err);
                        } 
                        else { 
                            resolve(`${this.database_name} database created`);
                        }
                    });
                } 
            });
        }); 

        return connection_response_promise;
    }
    

    mysql_connection() { 
        const connection = mysql.createConnection({
            host: this.host_name,
            user: this.database_username,
            password: this.database_password,
            database: this.database_name
        });
        
        const connection_response_promise = new Promise(resolve => { 
            connection.connect((err) => {
                if (err) {  
                    resolve(err.message);
                }
                else {
                    console.log(`Mysql Database Connected on Port ${this.database_port}!`); 
                    resolve(connection);
                }
            });
        });

        return connection_response_promise;
    }

    sqlite3_connection(db_name) {  
        const db = new sqlite3.Database(db_name ? `config/database/dump/${db_name}.db` : ':memory:', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
        (err) => { 
            if (err) {
                
                console.log(err);
                if (err.message == "SQLITE_CANTOPEN: unable to open database file") {
                    db.run(`CREATE DATABASE [${db_name}]`);
                    
                    return db;
                }

                return err.message;
            } 
        });
        
        return db
    }

    initDbConnection() {   
        let connection_response = undefined;

        if (process.env.DB_CONNECTION == "mysql") {
            connection_response = this.mysql_connection(process.env.DB_NAME); 
        }
        else if (process.env.DB_CONNECTION == "sqlite") {
            connection_response = this.sqlite3_connection(process.env.DB_NAME); 
        } 

        return connection_response
    }
}

module.exports = Database;


