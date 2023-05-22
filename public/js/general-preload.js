require('dotenv').config();
const config = require('../../app/Helpers/config');
const MP = require('./SuperPreload/MP');

class GeneralPreload extends MP {
    constructor() {
        super();
    }

    index() {
        const buttons = document.querySelectorAll(".btn");
        const DateDomElements = document.querySelectorAll(".dom-date");
        const AppNameDomElements = document.querySelectorAll(".app-name"); 

        const app_name_elements = [
            document.querySelectorAll('.title'), 
            document.querySelectorAll('.navbar-brand')
        ]

        app_name_elements.forEach(app_name_element => {   
            app_name_element.innerHTML = config.app_name;  
        });

        buttons.forEach(button => {
            button.addEventListener('click', event => {
                button.innerHTML = config.button_click_innerhtml_context;
            });
        });

        AppNameDomElements.forEach(AppNameDomElement => {
            if (document.body.contains(AppNameDomElement)) {
                AppNameDomElement.innerHTML = config.footer_app_name;
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
