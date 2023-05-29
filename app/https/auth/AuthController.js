const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const {phone} = require('phone');
const DB = require('../../../config/DB');
const config = require("../../Helpers/config");
const AuthModel = require("../../models/AuthModel");
const Mailer = require("../../../config/services/MailerService"); 
const Util = require("../../utils/Utils"); 

class AuthController extends AuthModel{

    constructor(BrowserWindow = undefined) {
        super(); 
        this.BrowserWindow = BrowserWindow; 
        this.post_object = undefined;  
    }

    validatePhone(phonenumber) {
        const response = phone(phonenumber, {country: `${this.country}`}); 
        
        return response;
    }
    
    saveUsers(stringifiedUsersInfo) {  
        const usersInfo = JSON.parse(stringifiedUsersInfo);   

        const response_promise = new Promise(resolve => {
            if (Object.values(usersInfo).every(value => value === null || value === undefined || value === '')) {
                resolve({status: 'fail', message: config.errors.empty_credentials});
            }
            else if (!EmailValidator.isEmail(usersInfo.email)) { 
                resolve({status: 'fail', message: config.errors.invalid_email});
            }
            else if (this.validatePhone(usersInfo.contact).isValid == false) {
                resolve({status: 'fail', message: config.errors.invalid_contact});
            }
            else {
                usersInfo.created_at = this.created_at;
                usersInfo.updated_at = this.updated_at;

                const util = new Util();
                util.select(this.table.users, ['*']);
                util.where({ email: usersInfo.email }).then(rows => {
                    const userRow = rows[0]; 

                    if (userRow !== undefined) {  
                        resolve({status: 'fail', message: config.user_exists});
                    }  
                    else if (userRow == config.errors.invalid_email) {
                        resolve({status: 'fail', message: config.errors.invalid_email});
                    }
                    else if (userRow == config.errors.invalid_contact) {
                        resolve({status: 'fail', message: config.errors.invalid_contact});
                    } 
                    else { 
                        const saltRounds = 10; 
                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(usersInfo.password, salt, (err, hash) => {
                                
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
                                    const util = new Util();  
                                    util.save_resource(this.table.users, JSON.stringify(usersInfo)).then(response => { 
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

                }); 
            }
        });
        return response_promise;
    } 

    loginUsers(stringifiedUsersInfo) {
        const usersInfo = JSON.parse(stringifiedUsersInfo);  

        const response_promise = new Promise(resolve => {
            if (Object.values(usersInfo).every(value => value === null || value === undefined || value === '')) {
                resolve({status: 'fail', message: config.errors.empty_credentials});
            }
            else {
                const util = new Util();
                util.select(this.table.users, ['*']);
                util.where({ email: usersInfo.email }).then(rows => {
                    const userRow = rows[0];
                
                    if (!EmailValidator.isEmail(usersInfo.email)) { 
                        resolve({status: 'fail', message: config.errors.invalid_email});
                    } 
                    else if (userRow == undefined) {
                        resolve({status: 'fail', message: config.errors.user_not_exists});
                    }  
                    else if (typeof userRow == "string" && variable !== null) {
                        if (userRow == config.errors.invalid_email) {
                            resolve({status: 'fail', message: config.errors.invalid_email});
                        }
                    }
                    else if (userRow.email == usersInfo.email) {  
                        bcrypt.compare(usersInfo.password, userRow.password, (err, result) => {
                            
                            if (err) {
                                console.log(err);
                                callback({status: 'OK', message: err});
                            } 
                            else if (result == true) {   
                                const object = {
                                    "id": userRow.id ? userRow.id : userRow.rowid ? userRow.rowid : 0,
                                    "whoiam": userRow.whoiam,
                                    "username": userRow.username,
                                    "email": userRow.email,
                                    "contact": userRow.contact,
                                    "created_at": userRow.created_at,
                                    "updated_at": userRow.updated_at
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
                    
                
                });  
            }
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
                const util = new Util();
                util.select(this.table.users, ['*']);
                util.where({ email: email }).then(rows => {
                    if(rows[0] !== undefined) {
                        this.auth.save_session(JSON.stringify({"id": rows[0].id ? rows[0].id : rows[0].rowid, "email": email}));

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
                                        this.post_object = JSON.stringify({"reset_pass_security_code": security_code}); 
                                        if (this.session !== undefined) {
                                            if ('id' in this.session) {
                                                const util = new Util();
                                                util.update_resource_by_id(this.table.users, this.post_object, this.session["id"]).then(response => {
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
            }
        });

        return response_promise;  
    }

    ResetPassword(post_object) {  
        let object = JSON.parse(post_object);   

        const reset_pass_response_promise = new Promise(resolve => {
            const util = new Util();
            util.select(this.table.users, ['*']);
            util.where({ email: this.session["email"] }).then(rows => { 
                const userRow = rows[0];

                if (userRow == undefined) {
                    resolve({status: 'fail', message: config.errors.user_not_exists});
                } 
                else if (userRow.email == this.session["email"]) {  
                    
                    console.log(object.security_code);
                    console.log(userRow.reset_pass_security_code);

                    if (object.security_code == userRow.reset_pass_security_code) {  
                        const saltRounds = 10; 

                        bcrypt.genSalt(saltRounds, (err, salt) => {
                            bcrypt.hash(object.password, salt, (err, hash) => {
                                
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

                                    const util = new Util();
                                    util.update_resource_by_id(this.table.users, this.post_object, this.session["id"]).then(response => { 
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
                 
            });
             
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
                    DB.serialize(() => {
                        DB.run(sql_query);
                        
                        resolve({status: 'OK', message: `${table} table creation success`});
                    });  
                } catch (error) { 
                    resolve({status: 'fail', message: `${table} table creation fail`});
                } 
            }
            else if (this.database_type == "mysql") { 
                DB.query(sql_query, (err, result) => {
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
        this.auth.delete_session().then((response) => {
            console.log(response);
        }).catch(error => {
            console.log(error);
        });

        this.route("resources/auth/", "login"); 
    }

}

module.exports = AuthController;
