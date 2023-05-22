const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const {phone} = require('phone'); 
const config = require("../../Helpers/config");
const DashboardModel = require("../../models/DashboardModel"); 
const Mailer = require("../../../config/services/MailerService"); 
const Util = require("../../../config/utils/Utils");  

class DashboardController extends DashboardModel{

    constructor(BrowserWindow = undefined, db = undefined) {
        super(); 
        this.BrowserWindow = BrowserWindow;
        this.db = db;
        this.post_object = undefined; 
    }
    
}

module.exports = DashboardController;