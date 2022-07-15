const path = require('path');
const AuthController = require("../app/https/auth/AuthController");
const Database = require("../config/database/database");

const DB = new Database();
const DbConn = DB.sqlite3_connection("business_elite");

const Auth = new AuthController(DbConn);

/**
 * PUT your routes here, 
 * They help in handling requests from the USER INTERFACE.
 * 
 * The requests include, POST, GET, PUT, UPDATE, DELETE:
 * 
 * @return response
 */
const Routes = (ipcMain) => {  
     
    ipcMain.handle('createTable', (event, table) => {
        const response = Auth.createTable(table);
        event.sender.send("create-table", `${response}`);
    });

    ipcMain.handle('registerUser', (event, usersInfo) => { 
        const response = Auth.saveUsers(usersInfo); 
        response.then(value => { 
            console.log(value);
            event.sender.send("save-users", `${value}`);
        }); 
    });

    ipcMain.handle('loginUser', (event, usersInfo) => {   
        const response = Auth.loginUsers(usersInfo); 
        response.then(value => {
            console.log(value);
            event.sender.send("login-response", `${value}`);
        });  
    });
}


module.exports = Routes;








