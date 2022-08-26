
require('dotenv').config();
const MP = require('./MP');

class GeneralPreload extends MP {
    constructor() {
        super();
    }

    index() {
        const DateDomElements = document.querySelectorAll(".dom-date");
        const AppNameDomElements = document.querySelectorAll(".app-name");

        AppNameDomElements.forEach(AppNameDomElement => {
            if (document.body.contains(AppNameDomElement)) {
                AppNameDomElement.innerHTML = process.env.FOOTER_APP_NAME;
            }
        });

        DateDomElements.forEach(DateDomElement => {
            if (document.body.contains(DateDomElement)) {
                DateDomElement.innerHTML = this.date.getFullYear();
            }
        });
    }

}

module.exports = GeneralPreload;
