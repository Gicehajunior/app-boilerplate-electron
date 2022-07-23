const { remote, contextBridge, ipcRenderer } = require('electron');
const path = require('path'); 
const AppUserSession = require("../../config/services/SessionService");
const alert = require("alert"); 
class Dashboard {
    constructor() {
        this.current_directory = process.cwd();
        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.sessionObject = new AppUserSession(); 
        this.session = this.sessionObject.session();
    }

    index() {    
        const UsernameDomElements = [
            document.querySelector(".username-in-session")
        ]; 

        UsernameDomElements.forEach(UsernameDomElement => {
            if (document.body.contains(UsernameDomElement)) {
                UsernameDomElement.innerHTML = `<i class="fa fa-user-circle" aria-hidden="true"></i> ${this.session['username']}`;
                
                setTimeout(() => {
                    alert(
                        `\nHello ${this.session['username']}. Welcome back to the system.\n\n For any Assistance in using the system, Please contact system administrator.\n\n Thank you!`,
                        "Notification"
                    );
                }, 1000);
            }
        });
    }

    save() {
        console.log("save a resource!");
    }
}

module.exports = Dashboard;


