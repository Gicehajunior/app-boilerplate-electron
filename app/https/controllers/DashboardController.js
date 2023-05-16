const DashboardModel = require("../../models/DashboardModel");  
class DashboardController extends DashboardModel{

    constructor(BrowserWindow = undefined, db = undefined) {
        super(); 
        this.BrowserWindow = BrowserWindow;
        this.db = db;
        this.post_object = undefined; 
    }
    
}

module.exports = DashboardController;