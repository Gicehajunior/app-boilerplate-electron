require('dotenv').config();
const config = require('../../app/Helpers/config');
const MP = require('./SuperPreload/MP');
const electron = require('electron');
const { ipcRenderer } = electron;

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
                    title: config.notification_title.dashboard_welcome_notification_title,
                    message: config.dashboard_welcome_notification
                });
            }
        });
    }

    save() {
        console.log("save a resource!");
    }
}

module.exports = Dashboard;


