const bcrypt = require('bcrypt'); 

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
        
        // console.log(usersInfo);
        const response_promise = new Promise(resolve => {
            this.db.serialize(() => {
                this.db.each(`SELECT * FROM users`, (err, row) => {  
                    if (row.email == usersInfo.email) { 
                        resolve(`user exists`);  
                    }
                    else {
                        const stmt = this.db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)`);

                        const saltRounds = 10; 
                
                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(usersInfo.password, salt, (err, hash) => {  
                                console.log(hash);
                                // gicehajunior76@gmail.com
                                if (hash == '') {
                                    resolve(`Please input a strong password!`);
                                }
                                else {
                                    stmt.run(usersInfo.whoiam, usersInfo.username, usersInfo.email, usersInfo.contact, hash, usersInfo.created_at, usersInfo.updated_at);
                        
                                    if (stmt.finalize()) {
                                        resolve(`Registration successfull!`);
                                    }
                                
                                    this.db.each(`SELECT * FROM users`, (err, row) => {
                                        console.log(row);
                                    });
                                }
                            });
                        });
                    }
                }); 
            });
        }); 

        return response_promise;
    }

    loginUsers(stringifiedUsersInfo) {
        const usersInfo = JSON.parse(stringifiedUsersInfo); 

        const response_promise = new Promise(resolve => {
            this.db.serialize(() => {
                this.db.each(`SELECT * FROM users`, (err, row) => { 
                    if (row.email == usersInfo.email) {   
                        console.log(row);
                        bcrypt.compare(usersInfo.password, row.password, function(err, result) {
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
                });
            });
        });

        return response_promise;
    }

    createTable(table) {
        try {
            this.db.serialize(() => {
                this.db.run(`CREATE TABLE IF NOT EXISTS ${table} (whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`);
            }); 
            return `${table} table creation success`;
        } catch (error) {
            return `${table} table creation failed`;
        } 
    }
    

}

module.exports = AuthController;




