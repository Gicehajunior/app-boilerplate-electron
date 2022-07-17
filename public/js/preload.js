const Auth = require("./auth-preload");
const Dashboard = require("./dashboard-preload");

window.addEventListener('DOMContentLoaded', () => {  
    const Authentication = new Auth();  

    Authentication.CreateUsersTable();
    Authentication.AuthUsers();
    Authentication.logoutUser(); 

    const DashboardCall = new Dashboard();
    DashboardCall.save();
}); 


