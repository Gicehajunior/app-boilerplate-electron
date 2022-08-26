const path = require('path');
const current_directory = process.cwd();
const AppModel = require("../app/models/AppModel");
const AuthController = require("../app/https/auth/AuthController");
const AppUserSession = require("../config/services/SessionService");

const sessionObject = new AppUserSession(); 

/**
 * PUT your routes here, 
 * They help in handling requests from the USER INTERFACE.
 * 
 * The requests include, POST, GET, PUT, UPDATE, DELETE:
 * 
 * @return response
 */
const Routes = (BrowserWindow, ipcMain, DbConn) => {  
    const Auth = new AuthController(DbConn, sessionObject);

    ipcMain.on("/alertMessage", (event, MessageObject) => {   
        AppModel.InitAlertModel(BrowserWindow, MessageObject); 
    });
    
    ipcMain.on("/login", (event, route) => {   
        Auth.index(BrowserWindow, route); 
    }); 

    ipcMain.on("/dashboard", (event, route) => {   
        Auth.index(BrowserWindow, route); 
    });
     
    ipcMain.handle('createTable', (event, table_object) => {
        const table_object_parsed = JSON.parse(table_object);
        const response = Auth.createTable(table_object_parsed.sql_query, table_object_parsed.table); 
        response.then(value => {  
            event.sender.send("create-table", `${value}`);
        });
    });

    ipcMain.handle('registerUser', (event, usersInfo) => { 
        const response = Auth.saveUsers(usersInfo);  
        response.then(value => {  
            event.sender.send("save-users", `${value}`);
        }); 
    });

    ipcMain.handle('/forgot-password', (event, email) => {
        const response = Auth.forgotPassword(BrowserWindow, email); 
        response.then(value => {  
            event.sender.send("forgot-password-response", `${value}`);
        });  
    });

    ipcMain.on('/reset-password', (event, post_object) => { 
        const response = Auth.ResetPassword(post_object);  
        response.then(value => {  
            event.sender.send("reset-password-response", `${value}`);
        });
    });

    ipcMain.handle('loginUser', (event, usersInfo) => {   
        const response = Auth.loginUsers(usersInfo); 
        response.then(value => { 
            event.sender.send("login-response", `${value}`);
        });  
    });

    ipcMain.handle('logoutUser', (event) => {   
        Auth.logoutUser(BrowserWindow);  
    });
} 

module.exports = Routes;








