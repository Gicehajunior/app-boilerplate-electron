const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path');  
const { fs, vol } = require("memfs");
const GeneralPreload = require("./general-preload");
const Auth = require("./auth-preload");
const Dashboard = require("./dashboard-preload"); 

window.addEventListener('DOMContentLoaded', () => {  
    const location_end_string_name = window.location.href; 
    const GeneralPreloader = new GeneralPreload();
    const Authentication = new Auth();
    
    GeneralPreloader.index();
    Authentication.logoutUser();

    if (location_end_string_name.includes("login.html") ||
        location_end_string_name.includes("signup.html") ||
        location_end_string_name.includes("forgot-password.html") ||
        location_end_string_name.includes("reset-password.html")) 
    { 
        Authentication.index();
        Authentication.CreateUsersTable();
        Authentication.AuthUsers();  
    } 
    else if (location_end_string_name.includes("dashboard.html")) {
        const DashboardCall = new Dashboard();
        DashboardCall.index(); 
    } 
       
}); 


