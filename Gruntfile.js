
const gruntFunction = (grunt) => { 
    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: "./public/assets",
                    verbose: true,
                    layout: (type, component, source) => {
                        var renamedType = type;
                        if (type == 'js') renamedType = 'javascripts';
                        else if (type == 'css') renamedType = 'stylesheets';

                        return path.join(component, renamedType);
                    }
                }
            }
        }
    });
  
    grunt.loadNpmTasks('grunt-bower-task'); 
    grunt.registerTask('set-assets', ['grunt-bower-task']);
};

module.exports = gruntFunction;

