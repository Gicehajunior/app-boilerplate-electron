 
window.addEventListener('DOMContentLoaded', () => {  
    try {
        const GeneralPreload = require("./general-preload");
        const Auth = require("./auth-preload");
        const Dashboard = require("./dashboard-preload"); 

        const url = window.location.href; 
        const GeneralPreloader = new GeneralPreload();
        const Authentication = new Auth();
        const DashboardCall = new Dashboard();
        
        GeneralPreloader.index(); 

        if (url.includes("login.html") ||
            url.includes("signup.html") ||
            url.includes("forgot-password.html") ||
            url.includes("reset-password.html")) 
        { 
            Authentication.index();
            Authentication.CreateUsersTable();
            Authentication.AuthUsers();  
        } 
        else if (url.includes("dashboard.html")) { 
            DashboardCall.index(); 
        } 
        
        Authentication.logoutUser(); 
    } catch (error) {
        console.log(error);
    }
    
}); 


