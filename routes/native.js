const RouterService = require("../config/services/RouterService");

/**
 * PUT your routes here, 
 * They help in handling requests from the USER INTERFACE.
 * 
 * The requests include, POST, GET, PUT, UPDATE, DELETE:
 * 
 * @return response
 */
const Routes = (BrowserWindow, ipcMain) => {    
    const Router = new RouterService(BrowserWindow, ipcMain); 

    Router.post('createTable', 'AuthController@createTable', "create-table"); 

    Router.post('loginUser', 'AuthController@loginUsers', "login-response");
    Router.post('registerUser', 'AuthController@saveUsers', "save-users");

    Router.post('/forgot-password', 'AuthController@forgotPassword', "forgot-password-response");
    Router.post('/reset-password', 'AuthController@ResetPassword', "reset-password-response");

    Router.post('logoutUser', 'AuthController@logoutUser');
} 

module.exports = Routes;

