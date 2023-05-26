const fs = require('fs'); 
const Helper = require('../../app/Helpers/helper');

class RouterService {
    constructor(BrowserWindow, ipcMain, DbConn) { 
        this.BrowserWindow = BrowserWindow;
        this.ipcMain = ipcMain;
        this.DBConnection = DbConn;
        this.controller = undefined;
        this.method_name = undefined;
        this.response_medium = undefined;

        this.get('/alertMessage', 'helper@showAlertDialog');
    }

    post(route, controller, response_medium = undefined) {  
        this.post_route(route, controller, response_medium);
    }

    get(route, controller, response_medium = undefined) {
        this.get_route(route, controller, response_medium);
    }

    post_route(route, controller, response_medium = undefined) { 
        this.ipcMain.handle(route, (event, data) => {  
            try {
                this.route_process(controller, response_medium, event, data);
            } catch (error) {
                console.log(error);
            }
        });
    } 

    get_route(route, controller, response_medium = undefined) { 
        this.ipcMain.on(route, (event, data) => {  
            try {
                this.route_process(controller, response_medium, event, data);
            } catch (error) {
                console.log(error);
            }
        });
    }

    route_process(controller, response_medium, event, data = {}) {
        const controller_method_array = controller.split("@");
        this.controller = controller_method_array[0].replace("'", "");
        this.method_name = controller_method_array[1].replace("'", "");  
        this.response_medium = response_medium;
        var response = data; 

        if (this.controller == 'helper') {  
            (new Helper(this.BrowserWindow)).showAlertDialog(data); 
        }
        else {
            let controller_class = this.RequireModule();  
            
            let controller_class_instance = new controller_class(this.BrowserWindow, this.DBConnection); 
            response = controller_class_instance[this.method_name](data);   
            this.run_response_channel(event, this.response_medium, response);
        }   
    }

    RequireModule() {
        var resolved_path = undefined;

        if (fs.existsSync(`${process.cwd()}/app/https/auth/${this.controller}.js`)) {
            resolved_path = `app/https/auth/`;
        }
        else if (fs.existsSync(`${process.cwd()}/app/https/controllers/${this.controller}.js`)) {
            resolved_path = `app/https/controllers/`;
        } 
        
        let controller_class = require(`../../${resolved_path}${this.controller}`);

        return controller_class;
    }

    run_response_channel(event, response_medium = undefined, response = undefined) { 
        if (response instanceof Promise) {
            Promise.resolve(response).then(value => {  
                if (value) {
                    event.sender.send(response_medium, `${JSON.stringify(value)}`);
                } 
            }); 
        } 
    }
    
}

module.exports = RouterService;
