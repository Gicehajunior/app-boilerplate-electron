const DashboardModel = require("../../models/DashboardModel");  
class DashboardController extends DashboardModel{

    constructor(db, BrowserWindow = undefined) {
        super();
        this.db = db;  
        this.BrowserWindow = BrowserWindow;
        this.post_object = undefined; 
    }
    
}

module.exports = DashboardController;