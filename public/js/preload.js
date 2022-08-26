 
window.addEventListener('DOMContentLoaded', () => {  
    try {
        const GeneralPreload = require("./general-preload");
        const Auth = require("./auth-preload");
        const Dashboard = require("./dashboard-preload"); 

        const location_end_string_name = window.location.href; 
        const GeneralPreloader = new GeneralPreload();
        const Authentication = new Auth();
        const DashboardCall = new Dashboard();
        
        GeneralPreloader.index(); 

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
            DashboardCall.index(); 
        } 
        
        Authentication.logoutUser(); 
    } catch (error) {
        console.log(error);
    }
    
}); 


