const electron = require('electron');
const { ipcRenderer } = electron;
const helper = require('../../app/Helpers/config');
const MP = require('./preload/MP');

class Dashboard extends MP {
    constructor() {
        super();
    }

    index() {
        const UsernameDomElements =  document.querySelectorAll(".username-in-session");

        UsernameDomElements.forEach(UsernameDomElement => {
            if (document.body.contains(UsernameDomElement)) {
                UsernameDomElement.innerHTML = `<i class="fa fa-user-circle" aria-hidden="true"></i> ${this.session['username']}`;
                ipcRenderer.send('/alertMessage', {
                    status: 'info',
                    title: "Welcome Message Notification",
                    message: `Hello ${this.session['username']}. Welcome back to the system.\n\n For any Assistance in using the system, Please contact system administrator.\n\n Thank you!`
                });
            }
        });
    }

    save() {
        console.log("save a resource!");
    }
}

module.exports = Dashboard;


