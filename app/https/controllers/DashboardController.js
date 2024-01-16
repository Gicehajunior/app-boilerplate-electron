const path = require('path');
const fs = require("fs");
const bcrypt = require('bcrypt'); 
const EmailValidator = require('validator');  
const {phone} = require('phone');
const DB = require('../../../config/DB');
const config = require("../../Helpers/config");
const DashboardModel = require("../../models/AuthModel");
const Mailer = require("../../../config/services/MailerService"); 
const Util = require("../../utils/Utils");

class DashboardController extends DashboardModel{

    constructor(BrowserWindow = undefined) {
        super(); 
        this.BrowserWindow = BrowserWindow; 
        this.post_object = undefined; 
    }
    
}

module.exports = DashboardController;