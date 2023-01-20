const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const {phone} = require('phone'); 
const AuthModel = require("../../models/AuthModel");
const Mailer = require("../../../config/services/MailerService"); 
const Util = require("../../../config/utils/Utils"); 

class AuthController extends AuthModel{

    constructor(db = undefined, BrowserWindow = undefined) {
        super();
        this.db = db;  
        this.BrowserWindow = BrowserWindow;
        this.post_object = undefined;  
    }

    index(route) {
        const CurrentWindow = this.BrowserWindow.getFocusedWindow();

        CurrentWindow.loadFile(`${this.current_directory}/resources/${route}.html`);
    }

    validatePhone(phonenumber) {
        const response = phone(phonenumber, {country: `${this.country}`}); 
        
        return response;
    }
    
    saveUsers(stringifiedUsersInfo) {  
        const usersInfo = JSON.parse(stringifiedUsersInfo);  
        usersInfo.created_at = this.created_at;
        usersInfo.updated_at = this.updated_at;

        const getRow = (callback) => { 
            if (!EmailValidator.isEmail(usersInfo.email)) { 
                callback("Invalid email");
            }
            else if (this.validatePhone(usersInfo.contact).isValid == false) {
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
                                if (hash.length == 0) {
                                    resolve(`Please input a strong password!`);
                                }
                                else {
                                    usersInfo.password = hash;
                                    const DBUtil = new Util(this.db, this.database_table()[0]);
                                    DBUtil.save_resource(JSON.stringify(usersInfo)).then(response => { 
                                        if (response == true) {
                                            resolve(`Registration successfull!`);
                                        } 
                                        else {
                                            resolve(`Registration failed!`);
                                        } 
                                    });
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
                    this.db.all(`SELECT rowid, * FROM users WHERE email = ?`, [email], (err, rows) => {
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
                            const object = {
                                "id": row.id ? row.id : row.rowid ? row.rowid : 0,
                                "whoiam": row.whoiam,
                                "username": row.username,
                                "email": row.email,
                                "contact": row.contact,
                                "created_at": row.created_at,
                                "updated_at": row.updated_at
                            }; 

                            this.auth.save_session(JSON.stringify(object)); 

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

    forgotPassword(email=[]) { 
        const response_promise = new Promise(resolve => {
            if (email.length == 0) {
                resolve("empty email");
            }
            else if (!EmailValidator.isEmail(email)) { 
                resolve("Invalid email");
            } 
            else {
                if (this.database_type == "sqlite") {
                    this.db.all(`SELECT rowid, * FROM users WHERE email = ?`, [email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err); 
                        }else{ 
                            if(rows[0] !== undefined) {
                                this.auth.save_session(JSON.stringify({"id":rows[0].rowid, "email": email}));
                            }
                        }
                    });
                }
                else if (this.database_type == "mysql") {
                    const sql = `SELECT * FROM users WHERE email = '${email}'`;
                    this.db.query(sql, (err, rows) => {
                        if (err) {
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err); 
                        }
                        else { 
                            if(rows[0] !== undefined) {
                                this.auth.save_session(JSON.stringify({"id":rows[0].id, "email": email}));
                            }
                        }
                    });  
                }

                setTimeout(() => { 
                    const MailerService = new Mailer();

                    const security_code = Math.floor(100000 + Math.random() * 900000);
                    const recipients = email
                    
                    const subject = "Reset Password Security Code";  
                    const html_message_formart = this.app.file_parser(
                        `${this.current_directory}/resources/app/mails/security_code_mail.html`,
                        {
                            "security_code": security_code
                        }
                    )
                    const text_message_formart = undefined;

                    const send_email_response_promise = MailerService.send(recipients, subject, html_message_formart, text_message_formart);

                    const CurrentWindow = this.BrowserWindow.getFocusedWindow(); 
                    if (send_email_response_promise == false) {  
                        CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);  
                    }
                    else {
                        try { 
                            send_email_response_promise.then(send_email_response => {  
                                if (send_email_response == false) {
                                    CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);  
                                }
                                else if (send_email_response.response.includes("OK")) {
                                    // save security code on database 
                                    const DBUtil = new Util(this.db,  this.database_table()[0]);
                                    this.post_object = JSON.stringify({"reset_pass_security_code": security_code}); 
                                    if ('id' in this.session) {
                                        DBUtil.update_resource_by_id(this.post_object, this.session["id"]).then(response => {
                                            if (response == true) { 
                                                CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);
                                            } 
                                            else { 
                                                CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);
                                            } 
                                        }).catch((error) => {
                                            CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);
                                        });
                                    }
                                    else {
                                        CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);
                                    }
                                }
                            }); 
                        } catch (error) { 
                            CurrentWindow.loadFile(`${this.current_directory}/resources/auth/reset-password.html`);
                        } 
                    } 
                }, 2000);
            }
        });

        return response_promise;  
    }

    ResetPassword(post_object) {  
        let object = JSON.parse(post_object);     
         
        const getRow = (callback) => { 
             
            if (this.database_type == "sqlite") { 
                this.db.all(`SELECT rowid, * FROM users WHERE rowid = ?`, [this.session["id"]], (err, rows) => {
                    if(err){
                        // Crone jobs will be implemented to handle this type of error!
                        console.log(err); 
                    }else{  
                        callback(rows[0]);
                    }
                });
            }
            else if (this.database_type == "mysql") {
                const sql = `SELECT * FROM users WHERE id = '${this.session["id"]}'`;
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

        const reset_pass_response_promise = new Promise(resolve => {
            const callbackFunc = (row) => { 
                
                if (row == undefined) {
                    resolve(`no user found`);
                }  
                else if (typeof row == "string") {
                    if (row.includes("Invalid email")) {
                        resolve("Invalid email");
                    }
                }
                else if (row.email == this.session["email"]) {  
                    if (object.security_code == row.reset_pass_security_code) {  
                        const saltRounds = 10; 

                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(object.password, salt, (err, hash) => {
                                // Crone jobs will be implemented to handle this type of error!
                                if (err) { 
                                    resolve("Unexpected error!");
                                } 
                                else if (object.password !== object.confirm_password) { 
                                    resolve("Password mismatch");
                                }  
                                else if (hash.length == 0) {
                                    resolve(`Please input a strong password!`);
                                }
                                else { 
                                    this.post_object = JSON.stringify({
                                        "password": hash,
                                        "reset_pass_security_code": 0,
                                        "updated_at": this.updated_at
                                    }); 

                                    const DBUtil = new Util(this.db, this.database_table()[0]);
                                    DBUtil.update_resource_by_id(this.post_object, this.session["id"]).then(response => { 
                                        if (response == true) {
                                            resolve(`Reset password success!`);    
                                        } 
                                        else {
                                            resolve(`Reset Password failed!`);
                                        } 
                                    }).catch((error) => {
                                        resolve(`Reset Password failed!`);
                                    });;    
                                }
                            });
                        });
                    } 
                    else {
                        resolve("wrong security_code")
                    }
                }
                else {
                    resolve(`no user found`);
                } 
                 
            }
            
            const row = getRow(callbackFunc);
        }); 

        return reset_pass_response_promise;
    }

    createTable(table_object) { 
        const table_object_parsed = JSON.parse(table_object);

        const sql_query = table_object_parsed.sql_query;
        const table = table_object_parsed.table;

        const response_promise = new Promise(resolve => {
            if (this.database_type == "sqlite") {
                try { 
                    this.db.serialize(() => {
                        this.db.run(sql_query);
                        
                        resolve(`${table} table creation success`);
                    });  
                } catch (error) {
                    console.log(error);
                    resolve(`${table} table creation failed`);
                } 
            }
            else if (this.database_type == "mysql") { 
                this.db.query(sql_query, (err, result) => {
                    if (err) {  
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
    
    logoutUser() {  
        const CurrentWindow = this.BrowserWindow.getFocusedWindow();
        
        this.auth.delete_session().then((response) => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        });

        CurrentWindow.loadFile(`${this.current_directory}/resources/auth/login.html`); 
    }

}

module.exports = AuthController;
