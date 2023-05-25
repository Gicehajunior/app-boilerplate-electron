const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const {phone} = require('phone'); 
const config = require("../../Helpers/config");
const AuthModel = require("../../models/AuthModel");
const Mailer = require("../../../config/services/MailerService"); 
const Util = require("../../../config/utils/Utils"); 

class AuthController extends AuthModel{

    constructor(BrowserWindow = undefined, db = undefined) {
        super(); 
        this.BrowserWindow = BrowserWindow;
        this.db = db;  
        this.post_object = undefined;  
    }

    index() {
        this.route("resources/auth/", "login"); 
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
                callback(config.errors.invalid_email);
            }
            else if (this.validatePhone(usersInfo.contact).isValid == false) {
                callback(config.errors.invalid_contact);
            }
            else {
                if (this.database_type == "sqlite") { 
                    this.db.all(`SELECT * FROM users WHERE email = ?`, [usersInfo.email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err);
                            callback(err); 
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
                            callback(err); 
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
                    else if (row == config.errors.invalid_email) {
                        resolve({status: 'fail', message: config.errors.invalid_email});
                    }
                    else if (row == config.errors.invalid_contact) {
                        resolve({status: 'fail', message: config.errors.invalid_contact});
                    } 
                } 
                 
                if (typeof row !== "string") {
                    if (exists.length > 0) { 
                        resolve({status: 'fail', message: config.user_exists});
                    }
                    else { 
                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(usersInfo.password, salt, (err, hash) => {
                                // Crone jobs will be implemented to handle this type of error!
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                }   
                                else 
                                if (hash.length == 0) {
                                    resolve({status: 'fail', message: config.errors.invalid_password});
                                }
                                else {
                                    usersInfo.password = hash;
                                    const DBUtil = new Util(this.db, this.database_table()[0]);
                                    DBUtil.save_resource(JSON.stringify(usersInfo)).then(response => { 
                                        if (response == true) {
                                            resolve({status: 'OK', message: config.success.create_account});
                                        } 
                                        else {
                                            resolve({status: 'fail', message: config.errors.create_account});
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
                callback({status: 'fail', message: config.errors.invalid_email});
            }
            else {
                if (this.database_type == "sqlite") {
                    this.db.all(`SELECT rowid, * FROM users WHERE email = ?`, [email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err);
                            callback(err); 
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
                            callback(err);
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
                    resolve({status: 'fail', message: config.errors.user_not_exists});
                }  
                else if (typeof row == "string" && variable !== null) {
                    if (row == config.errors.invalid_email) {
                        resolve({status: 'fail', message: config.errors.invalid_email});
                    }
                }
                else if (row.email == usersInfo.email) {  
                    bcrypt.compare(usersInfo.password, row.password, (err, result) => {
                        // Crone jobs will be implemented to handle this type of error!
                        if (err) {
                            console.log(err);
                            callback({status: 'OK', message: err});
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
                            this.route("resources/views/", "dashboard");
                        }
                        else {
                            resolve({status: 'fail', message: config.errors.wrong_user_credentials});
                        }  
                    });  
                }
                else {
                    resolve({status: 'fail', message: config.errors.user_not_exists});
                } 
                 
            }
            
            const row = getRow(usersInfo.email, callbackFunc);
        }); 

        return response_promise;
    }

    forgotPassword(email=[]) { 
        const response_promise = new Promise(resolve => {
            if (email.length == 0) {
                resolve({status: 'fail', message: config.errors.empty_email});
            }
            else if (!EmailValidator.isEmail(email)) { 
                resolve({status: 'fail', message: config.errors.invalid_email});
            } 
            else {
                if (this.database_type == "sqlite") {
                    this.db.all(`SELECT rowid, * FROM users WHERE email = ?`, [email], (err, rows) => {
                        if(err){
                            // Crone jobs will be implemented to handle this type of error!
                            console.log(err);
                            callback({status: 'fail', message: err}); 
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
                            callback({status: 'fail', message: err}); 
                        }
                        else { 
                            if(rows[0] !== undefined) {
                                this.auth.save_session(JSON.stringify({"id":rows[0].id, "email": email}));
                            }
                        }
                    });  
                }  
 
                this.session = this.session;

                const MailerService = new Mailer();

                const security_code = Math.floor(100000 + Math.random() * 900000);
                const recipients = email
                
                const subject = "Reset Password Security Code";  
                const html_message_formart = this.mail_parse(`security_code_mail`, {"security_code": security_code});
                const text_message_formart = undefined;

                const send_email_response_promise = MailerService.send(recipients, subject, html_message_formart, text_message_formart);

                const CurrentWindow = this.BrowserWindow.getFocusedWindow(); 
                if (send_email_response_promise == false) {  
                    this.route("resources/auth/", "reset-password");  
                }
                else {
                    try { 
                        send_email_response_promise.then(send_email_response => {  
                            if (send_email_response == false) {
                                this.route("resources/auth/", "reset-password");  
                            }
                            else if (send_email_response.response.includes("OK")) {
                                // save security code on database 
                                const DBUtil = new Util(this.db,  this.database_table()[0]);
                                this.post_object = JSON.stringify({"reset_pass_security_code": security_code}); 
                                if (this.session !== undefined) {
                                    if ('id' in this.session) {
                                        DBUtil.update_resource_by_id(this.post_object, this.session["id"]).then(response => {
                                            if (response == true) { 
                                                this.route("resources/auth/", "reset-password");
                                            } 
                                            else { 
                                                this.route("resources/auth/", "reset-password");
                                            } 
                                        }).catch((error) => {
                                            this.route("resources/auth/", "reset-password");
                                        });
                                    }
                                    else {
                                        this.route("resources/auth/", "reset-password");
                                    }
                                }
                                else { 
                                    this.route("resources/auth/", "reset-password"); 
                                }
                            }
                        }); 
                    } catch (error) {  
                        this.route("resources/auth/", "reset-password");
                    } 
                }  
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
                        callback(err); 
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
                        callback(err);
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
                    resolve({status: 'fail', message: config.errors.user_not_exists});
                }  
                else if (typeof row == "string" && variable !== null) {
                    if (row == config.errors.invalid_email) {
                        resolve({status: 'fail', message: config.errors.invalid_email});
                    }
                }
                else if (row.email == this.session["email"]) {  
                    if (object.security_code == row.reset_pass_security_code) {  
                        const saltRounds = 10; 

                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(object.password, salt, (err, hash) => {
                                // Crone jobs will be implemented to handle this type of error!
                                if (err) { 
                                    resolve({status: 'fail', message: config.errors.unexpected_error});
                                } 
                                else if (object.password !== object.confirm_password) { 
                                    resolve({status: 'fail', message: config.errors.password_mismatch});
                                }  
                                else if (hash.length == 0) {
                                    resolve({status: 'fail', message: config.errors.invalid_password});
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
                                            this.route("resources/auth/", "login");    
                                        } 
                                        else {
                                            resolve({status: 'fail', message: config.errors.reset_password}); 
                                        } 
                                    }).catch((error) => {
                                        resolve({status: 'fail', message: config.errors.reset_password}); 
                                    });    
                                }
                            });
                        });
                    } 
                    else {
                        resolve({status: 'fail', message: config.errors.wrong_security_code}); 
                    }
                }
                else {
                    resolve({status: 'fail', message: config.errors.user_not_exists});
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
                        
                        resolve({status: 'OK', message: `${table} table creation success`});
                    });  
                } catch (error) { 
                    resolve({status: 'fail', message: `${table} table creation fail`});
                } 
            }
            else if (this.database_type == "mysql") { 
                this.db.query(sql_query, (err, result) => {
                    if (err) {  
                        resolve({status: 'fail', message: `${table} table creation fail`});
                    }
                    else {
                        resolve({status: 'OK', message: `${table} table creation success`});
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

        this.route("resources/auth/", "login"); 
    }

}

module.exports = AuthController;
