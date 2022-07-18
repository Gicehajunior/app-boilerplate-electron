const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const path = require('path');

class AuthController {

    constructor(db) {
        this.db = db;

        this.current_directory = process.cwd();
        this.database_type = process.env.DB_CONNECTION;

        let datetime_now = new Date();
        datetime_now = datetime_now.toISOString().slice(0, 19).replace('T', ' ');

        this.created_at = datetime_now;
        this.updated_at = datetime_now; 
    }

    index() {

    }

    validatePhone() {
        return true;
    }

    isObject(variable){
        return (!!variable) && (a.constructor === Object);
    }

    saveUsers(stringifiedUsersInfo) {  
        const usersInfo = JSON.parse(stringifiedUsersInfo); 
        usersInfo.created_at = this.created_at;
        usersInfo.updated_at = this.updated_at; 

        const getRow = (callback) => { 
            if (!EmailValidator.isEmail(usersInfo.email)) { 
                callback("Invalid email");
            }
            else if (this.validatePhone(usersInfo.contact) == false) {
                callback("Invalid contact");
            }
            else {
                if (this.database_type == "sqlite") { 
                    this.db.all(`SELECT * FROM users WHERE email = ?`, [usersInfo.email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err); 
                        }else{
                            callback(rows[0]);
                        }
                    });
                }
                else if (this.database_type == "mysql") {
                    const sql = `SELECT * FROM users WHERE email = '${usersInfo.email}'`;
                    this.db.query(sql, (err, rows) => {
                        if (err) {
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err); 
                        }
                        else { 
                            callback(rows[0]);
                        }
                    });  
                }
            }
        }
        const response_promise = new Promise(resolve => {
            const callbackFunc = (row) => { 
                let stmt;
                if (this.database_type == "sqlite") {
                    stmt = this.db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)`);
                }
                else if (this.database_type == "mysql") {
                    stmt = `INSERT INTO users (whoiam, username, email, contact, password, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)`;
                }
                const saltRounds = 10; 
                let exists = [];
                if (row !== undefined) { 
                    if (row.email == usersInfo.email) {  
                        exists.push(row); 
                    }  
                    else if (row.includes("Invalid email")) {
                        resolve("Invalid email");
                    }
                    else if (row.includes("Invalid contact")) {
                        resolve("Invalid contact");
                    } 
                } 
                 
                if (typeof row !== "string") {
                    if (exists.length > 0) { 
                        resolve(`user exists`);
                    }
                    else { 
                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(usersInfo.password, salt, (err, hash) => {
                                // Crone jobs will be implemented to handle this type of error!
                                if (err) {
                                    console.log(err);
                                }   
                                else 
                                if (hash == '') {
                                    resolve(`Please input a strong password!`);
                                }
                                else {
                                    if (this.database_type == "sqlite") {
                                        stmt.run(usersInfo.whoiam, usersInfo.username, usersInfo.email, usersInfo.contact, hash, usersInfo.created_at, usersInfo.updated_at);
                            
                                        if (stmt.finalize()) {
                                            resolve(`Registration successfull!`);
                                        } 
                                        else {
                                            resolve(`Registration failed!`);
                                        }
                                    }
                                    else if (this.database_type == "mysql") {
                                        this.db.query(stmt, [usersInfo.whoiam.toString(), usersInfo.username.toString(), usersInfo.email.toString(), usersInfo.contact.toString(), hash.toString(), usersInfo.created_at.toString(), usersInfo.updated_at.toString()], (err, result) => {
                                            if (err) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else 
                                                resolve(`Registration failed!`);
                                            }
                                            else {
                                                resolve(`Registration successfull!`);
                                            }
                                        }); 
                                    }
                                }
                            });
                        });
                    }
                }
            }

            const row = getRow(callbackFunc);
        
        });
        return response_promise;
    } 

    loginUsers(stringifiedUsersInfo) {
        const usersInfo = JSON.parse(stringifiedUsersInfo);  
        
        const getRow = (email, callback) => { 
            if (!EmailValidator.isEmail(usersInfo.email)) { 
                callback("Invalid email");
            }
            else {
                if (this.database_type == "sqlite") {
                    this.db.all(`SELECT * FROM users WHERE email = ?`, [email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err); 
                        }else{
                            callback(rows[0]);
                        }
                    });
                }
                else if (this.database_type == "mysql") {
                    const sql = `SELECT * FROM users WHERE email = '${usersInfo.email}'`;
                    this.db.query(sql, (err, rows) => {
                        if (err) {
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err);
                        }
                        else { 
                            callback(rows[0]);
                        }
                    });  
                }
            }
        }

        const response_promise = new Promise(resolve => {
            const callbackFunc = (row) => { 
                if (row == undefined) {
                    resolve(`no user found`);
                }  
                else if (typeof row == "string") {
                    if (row.includes("Invalid email")) {
                        resolve("Invalid email");
                    }
                }
                else if (row.email == usersInfo.email) {  
                    bcrypt.compare(usersInfo.password, row.password, (err, result) => {
                        // Crone jobs will be implemented to handle this type of error!
                        if (err) {
                            console.log(err);
                        } 
                        else if (result == true) { 
                            resolve(`password matches`);
                        }
                        else {
                            resolve(`Incorrect login credentials`);
                        }  
                    });  
                }
                else {
                    resolve(`no user found`);
                } 
                 
            }
            
            const row = getRow(usersInfo.email, callbackFunc);
        }); 

        return response_promise;
    }

    createTable(table) { 
        const response_promise = new Promise(resolve => {
            if (this.database_type == "sqlite") {
                try { 
                    this.db.serialize(() => {
                        this.db.run(`CREATE TABLE IF NOT EXISTS ${table} (whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`);
                        
                        resolve(`${table} table creation success`);
                    });  
                } catch (error) {
                    resolve(`${table} table creation failed`);
                } 
            }
            else if (this.database_type == "mysql") { 
                const sql = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`;
                this.db.query(sql, (err, result) => {
                    if (err) {
                        console.log(err); 
                        resolve(`${table} table creation failed`);
                    }
                    else {
                        resolve(`${table} table creation success`);
                    }
                }); 
            }
        });

        return response_promise;
    }
    
    logoutUser(BrowserWindow) {
        const CurrentWindow = BrowserWindow.getFocusedWindow();
        CurrentWindow.loadFile(`${this.current_directory}/resources/auth/login.html`); 
    }
}

module.exports = AuthController;




