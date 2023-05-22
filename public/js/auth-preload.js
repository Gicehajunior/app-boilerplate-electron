require('dotenv').config();
const config = require('../../app/Helpers/config');
const MP = require('./SuperPreload/MP');
const electron = require('electron');
const { ipcRenderer } = electron;

class Auth extends MP {
    constructor() {
        super();
    }

    index() {
        if (this.windowLocation.includes("login")) {
            setTimeout(() => {
                ipcRenderer.send('/alertMessage', {
                    status: 'info',
                    title: config.notification_title.login_notification_title,
                    message: config.login_notification
                });
            }, 2000);
        }
        else if (this.windowLocation.includes("reset-password")) {
            ipcRenderer.send('/alertMessage', {
                status: 'info',
                title: config.notification_title.reset_password_notification_title,
                message: config.reset_password_notification
            });
        }
    }
    
    CreateUsersTable() {
        let sql_query = undefined;
        const table = "users";

        if (process.env.DB_CONNECTION == "sqlite") {
            sql_query = `CREATE TABLE IF NOT EXISTS ${table} (whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, reset_pass_security_code INTEGER NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`;
        }
        else if (process.env.DB_CONNECTION == "mysql") {
            sql_query = `CREATE TABLE IF NOT EXISTS ${table} (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, whoiam INTEGER NOT NULL, username VARCHAR(15) NOT NULL, email VARCHAR(50) NULL, contact VARCHAR(13) NULL, password LONGTEXT NOT NULL, reset_pass_security_code INTEGER NULL, created_at DATETIME NULL, updated_at DATETIME NULL)`;
        }

        const table_object = JSON.stringify({
            sql_query: sql_query,
            table: table
        });
        ipcRenderer.invoke('createTable', table_object);

        ipcRenderer.on("create-table", (event, response) => { 
            var response = JSON.parse(response);  
            console.log(`DB Users Table Creation: ${response.status}`); 
        });
    }

    AuthUsers() {
        const signup_user_form = document.querySelector(".signup_user_form")
        const register_btn = document.getElementById("btn-register");

        const login_user_form = document.querySelector(".login_user_form");
        const login_user_btn = document.getElementById("btn-login");

        const users_message = document.getElementById("users_message");

        const email = document.getElementById("email");
        const password = document.getElementById("password");

        const forgot_password = document.querySelector(".forgot-password");
        const reset_password = document.querySelector(".reset-password");

        const request_security_code_btns = document.querySelectorAll(".request-security-code-btn");
        const reset_password_btns = document.querySelectorAll(".reset-password-btn");

        if (document.body.contains(signup_user_form)) {
            register_btn.addEventListener("click", (event) => {
                event.preventDefault();
                register_btn.disabled = true;
                const username = document.getElementById("username");
                const tel = document.getElementById("tel");

                if (username.value.length == 0 ||
                    email.value.length == 0 ||
                    tel.value.length == 0 ||
                    password.value.length == 0
                ) {
                    users_message.innerHTML = config.fill_in_all_fields;
                    users_message.style.color = "red";
                    register_btn.innerHTML = config.register_button_innerhtml_context;
                }
                else {
                    const usersInfo = {
                        "whoiam": 2,
                        "username": username.value,
                        "email": email.value,
                        "contact": tel.value,
                        "password": password.value,
                        "reset_pass_security_code": 0,
                        "created_at": "",
                        "updated_at": ""
                    };

                    ipcRenderer.invoke("registerUser", JSON.stringify(usersInfo));

                    ipcRenderer.on("save-users", (event, response) => {
                        var response = JSON.parse(response);

                        if (response.status == 'OK') {
                            this.clearFormInputs();
                            users_message.innerHTML = response.message;
                            users_message.style.color = "green"; 
                        }
                        else {
                            users_message.innerHTML = response.message;
                            users_message.style.color = "red";
                        }

                        if (response.status == 'fail') {
                            register_btn.innerHTML = config.register_button_innerhtml_context;
                        } 

                        register_btn.disabled = false;
                    });
                }
            });
        }
        else if (document.body.contains(login_user_form)) {
            login_user_btn.addEventListener("click", (event) => {
                event.preventDefault();
                login_user_btn.disabled = true;
                if (email.value.length == 0 ||
                    password.value.length == 0
                ) {
                    users_message.innerHTML = config.errors.fill_in_all_fields;
                    users_message.style.color = "red";
                    login_user_btn.innerHTML = config.login_button_innerhtml_context;
                }
                else {
                    const usersInfo = {
                        "email": email.value,
                        "password": password.value,
                    };

                    const loginUser = ipcRenderer.invoke("loginUser", JSON.stringify(usersInfo));

                    ipcRenderer.on("login-response", (event, response) => {
                        var response = JSON.parse(response);  
                        if (response.status == 'OK') {
                            users_message.innerHTML = response.message;
                            users_message.style.color = "green";
                            this.clearFormInputs();
                            
                            setTimeout(() => {
                                ipcRenderer.send("/dashboard", "views/dashboard");
                            }, 2000);
                        }
                        else {
                            users_message.innerHTML = response.message;
                            users_message.style.color = "red";
                        } 

                        if (response.status == 'fail') {
                            login_user_btn.innerHTML = config.login_button_innerhtml_context;
                        }
                        login_user_btn.disabled = false;
                    });
                }
            });
        }
        else if (document.body.contains(forgot_password)) {
            request_security_code_btns.forEach(request_security_code_btn => {
                request_security_code_btn.addEventListener('click', () => {
                    request_security_code_btn.disabled = true;
                    if (email.value.length == 0) {
                        ipcRenderer.send('/alertMessage', {
                            status: 'info',
                            title: config.notification_title.forgot_password_notification_title,
                            message: config.input_security_code_notification
                        });
                        request_security_code_btn.innerHTML = config.forgot_password_button_innerhtml_context;
                    }
                    else {
                        ipcRenderer.invoke("/forgot-password", email.value);

                        ipcRenderer.on("forgot-password-response", (event, response) => {
                            var response = JSON.parse(response);  
                            if (response.status == 'fail') {
                                ipcRenderer.send('/alertMessage', {
                                    status: 'error',
                                    title: config.notification_title.forgot_password_notification_title,
                                    message: response.message
                                });
                            }
                            else {
                                ipcRenderer.send('/alertMessage', {
                                    status: 'error',
                                    title: config.notification_title.forgot_password_notification_title,
                                    message: response.message
                                });
                            }

                            request_security_code_btn.innerHTML = config.forgot_password_button_innerhtml_context;
                            request_security_code_btn.disabled = false;
                        });
                    }
                });
            });
        }
        else if (document.body.contains(reset_password)) {
            reset_password_btns.forEach(reset_password_btn => {
                reset_password_btn.addEventListener('click', () => {
                    reset_password_btn.disabled = true;
                    const security_code = document.getElementById("security-code");
                    const confirm_password = document.getElementById("confirm-password");

                    if (security_code.value.length == 0 || password.value.length == 0 || confirm_password.value.length == 0) {
                        ipcRenderer.send('/alertMessage', {
                            status: 'info',
                            title: config.notification_title.reset_password_notification_title,
                            message: config.fill_in_all_fields
                        });
                        reset_password_btn.innerHTML = config.reset_password_button_innerhtml_context;
                        reset_password_btn.disabled = false;
                    }
                    else {
                        const reset_password_post_object = JSON.stringify({
                            "security_code": security_code.value,
                            "password": password.value,
                            "confirm_password": confirm_password.value
                        });

                        ipcRenderer.invoke("/reset-password", reset_password_post_object);

                        ipcRenderer.on("reset-password-response", (event, response) => {
                            var response = JSON.parse(response);  
                            if (response.status == 'OK') { 
                                ipcRenderer.send("/login", "auth/login");  
                            } 
                            else {
                                ipcRenderer.send('/alertMessage', {
                                    status: 'error',
                                    title: config.notification_title.reset_password_notification_title,
                                    message: response.message
                                });
                            } 

                            if (response.status == 'fail') {
                                reset_password_btn.innerHTML = config.reset_password_button_innerhtml_context;
                            } 

                            reset_password_btn.disabled = false;
                        });
                    }
                });
            });
        }
    }

    logoutUser() {
        const logoutBtn = document.getElementById("logout-btn");

        if (document.body.contains(logoutBtn)) {
            logoutBtn.addEventListener('click', () => {
                ipcRenderer.invoke("logoutUser");
            });
        }
    }
}

module.exports = Auth;

