const bcrypt = require('bcrypt'); 
const Database = require("../../../config/database/database");


class AuthController {

    constructor(db) {
        this.db = db;
        let datetime_now = new Date();
        datetime_now = datetime_now.toISOString().slice(0, 19).replace('T', ' ');

        this.created_at = datetime_now;
        this.updated_at = datetime_now;
    }

    index() {

    }

    saveUsers(stringifiedUsersInfo) {  
        const usersInfo = JSON.parse(stringifiedUsersInfo); 
        usersInfo.created_at = this.created_at;
        usersInfo.updated_at = this.updated_at; 

        const getRow = (email, callback) => { 
            this.db.all(`SELECT * FROM users WHERE email = ?`, [email], function (err, rows) {
              if(err){
                // Crone jobs will be implemented to handle this type of error!
                console.log(err);
              }else{
                callback(rows[0]);
              }
            });
        }
        const response_promise = new Promise(resolve => {
            const callbackFunc = (row) => { 
                const stmt = this.db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)`);

                const saltRounds = 10; 
                let exists = [];
                if (row !== undefined) { 
                    if (row.email == usersInfo.email) {  
                        exists.push(row); 
                    }  
                } 
                
                if (exists.length > 0) { 
                    resolve(`user exists`);
                }
                else { 
                    bcrypt.genSalt(saltRounds, (err, salt) => {
                        bcrypt.hash(usersInfo.password, salt, (err, hash) => {
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err);   
                            if (hash == '') {
                                resolve(`Please input a strong password!`);
                            }
                            else {
                                stmt.run(usersInfo.whoiam, usersInfo.username, usersInfo.email, usersInfo.contact, hash, usersInfo.created_at, usersInfo.updated_at);
                    
                                if (stmt.finalize()) {
                                    resolve(`Registration successfull!`);
                                } 
                            }
                        });
                    });
                }
            }

            const row = getRow(usersInfo.email, callbackFunc);
        
        });
        return response_promise;
    } 

    loginUsers(stringifiedUsersInfo) {
        const usersInfo = JSON.parse(stringifiedUsersInfo);  
        
        const getRow = (email, callback) => { 
            this.db.all(`SELECT * FROM users WHERE email = ?`, [email], function (err, rows) {
              if(err){
                // Crone jobs will be implemented to handle this type of error!
                console.log(err);
              }else{
                callback(rows[0]);
              }
            });
        }

        const response_promise = new Promise(resolve => {
            const callbackFunc = (row) => { 
                if (row == undefined) {
                    resolve(`no user found`);
                }
                else if (row.email == usersInfo.email) { 
                    console.log(row);
                    bcrypt.compare(usersInfo.password, row.password, function(err, result) {
                        // Crone jobs will be implemented to handle this type of error!
                        console.log(err);
                        if (result == true) { 
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
            try { 
                this.db.serialize(() => {
                    this.db.run(`CREATE TABLE IF NOT EXISTS ${table} (whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`);
                    
                    resolve(`${table} table creation success`);
                });  
            } catch (error) {
                resolve(`${table} table creation failed`);
            } 
 
        });

        return response_promise;
    }
    

}

module.exports = AuthController;




