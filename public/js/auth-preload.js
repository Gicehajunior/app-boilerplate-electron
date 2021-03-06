const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path'); 
const alert = require("alert");

class Auth {
    constructor() { 
        this.current_directory = process.cwd();
        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.windowLocation = window.location.href;
    }

    index() {
        if (this.windowLocation.includes("reset-password")) {
            alert(
                `Please check on your email if you received a security code.\n\n If you filled in the correct email, it must have been sent successfully. If not, Please consult System Administrator for help!`
            );
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
            console.log(response);
        });
    }

    AuthUsers () {
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
                const username = document.getElementById("username");
                const tel = document.getElementById("tel"); 

                if (username.value.length == 0 ||
                    email.value.length == 0 ||
                    tel.value.length == 0 ||
                    password.value.length == 0
                ) {
                    users_message.innerHTML = `<small>Please fill in all fields to proceed!</small>`;
                    users_message.style.color = "red";
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
                        if (response.includes("Invalid email")) {
                            users_message.innerHTML = `<small>Email is invalid. Please correct your email to proceed!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("Invalid contact")) {
                            users_message.innerHTML = `<small>Contact is invalid. Please correct your phone number to proceed!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("user exists")) { 
                            users_message.innerHTML = `<small>Seems you're already registered. Please proceed to login!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("Please input a strong password!")) {
                            users_message.innerHTML = `<small>Password too short or too long. Please fill in a strong password!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("Registration successfull!")) {
                            users_message.innerHTML = `<small>Registration successfull. Go to login page to proceed!</small>`;
                            users_message.style.color = "green";
                        }
                    });
                } 
            });
        }
        else if (document.body.contains(login_user_form)) {
            login_user_btn.addEventListener("click", (event) => {
                event.preventDefault();

                if (email.value.length == 0 ||
                    password.value.length == 0
                ) { 
                    users_message.innerHTML = `<small>Please fill in all fields to login!</small>`;
                    users_message.style.color = "red";
                } 
                else {
                    const usersInfo = {  
                        "email": email.value,  
                        "password": password.value, 
                    };

                    const loginUser = ipcRenderer.invoke("loginUser", JSON.stringify(usersInfo)); 

                    ipcRenderer.on("login-response", (event, response) => { 
                        if (response.includes("password matches")) { 
                            users_message.innerHTML = `<small>Login Successfull, Navigating to Dashboard. Please wait...</small>`;
                            users_message.style.color = "green";

                            setTimeout(() => {
                                ipcRenderer.send("/dashboard", "views/dashboard");
                            }, 2000);
                        }
                        else if (response.includes("Invalid email")) {
                            users_message.innerHTML = `<small>Email is invalid. Please correct your email to proceed!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("Incorrect login credentials")) {
                            users_message.innerHTML = `<small>Wrong Password. Fill in correct password to proceed!</small>`;
                            users_message.style.color = "red";
                        }
                        else if (response.includes("no user found")) {
                            users_message.innerHTML = `<small>No user found with the input Email. Please register to proceed!</small>`;
                            users_message.style.color = "red";
                        }
                    }); 
                } 
            });
        }
        else if (document.body.contains(forgot_password)) {
            request_security_code_btns.forEach(request_security_code_btn => {
                request_security_code_btn.addEventListener('click', () => { 
                    if (email.value.length == 0) {
                        alert(`Please fill in your email to receive a security code!`, "Notification"); 
                    }
                    else {
                        ipcRenderer.invoke("/forgot-password", email.value);
                    }
                });
            });
        }
        else if (document.body.contains(reset_password)) {
            reset_password_btns.forEach(reset_password_btn => {
                reset_password_btn.addEventListener('click', () => { 
                    const security_code = document.getElementById("security-code"); 
                    const confirm_password = document.getElementById("confirm-password"); 

                    if (security_code.value.length == 0 || password.value.length == 0 || confirm_password.value.length == 0) {
                        alert(`Please fill in all the respective fields to proceed!`, "Notification"); 
                    }
                    else {
                        const reset_password_post_object = JSON.stringify({
                            "security_code": security_code.value,
                            "password": password.value,
                            "confirm_password": confirm_password.value
                        });
                        
                        ipcRenderer.send("/reset-password", reset_password_post_object);

                        ipcRenderer.on("reset-password-response", (event, response) => { 
                            if (response.includes("no user found")) { 
                                alert(
                                    `No user found with the input Email. Please register to proceed`
                                );
                            }
                            else if (response.includes("Invalid email")) { 
                                alert(
                                    `Email is invalid. Please correct your email to proceed!`
                                );
                            }
                            else if(response.includes("Unexpected error!")) {
                                alert(
                                    `Please try again or consult System Administrator for help!`
                                );
                            }
                            else if(response.includes("Password mismatch")) {
                                alert(
                                    `Password mismatch. Please confirm your password!`
                                );
                            }
                            else if(response.includes(`Please input a strong password!`)) {
                                alert(
                                    `Please enter a strong password to proceed!`
                                );
                            }
                            else if(response.includes(`wrong security_code`)) {
                                alert(
                                    `You entered Incorrect Security Passcode. Please check the latest passcode and try again!`
                                );
                            } 
                            else if(response.includes(`Reset Password failed!`)) {
                                alert(
                                    `Reseting your password failed. Please try again or consult System Administrator for help!`
                                );
                            }
                            else if(response.includes(`Reset password success!`)) {
                                alert(
                                    `Password reset success. Please wait as login window is trying to load...`
                                );
                                setTimeout(() => {
                                    ipcRenderer.send("/login", "auth/login");
                                }, 2000);
                            }
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

