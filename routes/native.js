const path = require('path');
const AuthController = require("../app/https/auth/AuthController");
const current_directory = process.cwd();

/**
 * PUT your routes here, 
 * They help in handling requests from the USER INTERFACE.
 * 
 * The requests include, POST, GET, PUT, UPDATE, DELETE:
 * 
 * @return response
 */
const Routes = (BrowserWindow, ipcMain, DbConn) => {  
    const Auth = new AuthController(DbConn);
    
    ipcMain.on('/dashboard', (event, route) => {   
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
        Auth.forgotPassword(BrowserWindow, email);   
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








