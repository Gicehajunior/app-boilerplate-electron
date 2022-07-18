const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path');  
const { fs, vol } = require("memfs");
const location_end_string_name = window.location.href; 

window.addEventListener('DOMContentLoaded', () => { 
    
    if (location_end_string_name.endsWith("login.html") ||
        location_end_string_name.endsWith("signup.html")) 
    {
        const Auth = require("./auth-preload");

        const Authentication = new Auth();  

        Authentication.CreateUsersTable();
        Authentication.AuthUsers();
        Authentication.logoutUser();
    } 
    else if (location_end_string_name.endsWith("dashboard.html")) {
        const Dashboard = require("./dashboard-preload");

        const DashboardCall = new Dashboard();
        DashboardCall.index();
    }   
}); 


