const AppUserSession = require("../../config/services/SessionService");
var session = (new AppUserSession()).session();  

module.exports = {
    button_click_innerhtml_context: "Please Wait...",
    footer_app_name: "Electron <strong style='color: green'>Application Boilerplate</strong>",
    app_name: "Application Boilerplate",
    login_button_innerhtml_context:  "Sign In",
    register_button_innerhtml_context:  "Sign Up",
    forgot_password_button_innerhtml_context:  "Request Security Code",
    reset_password_button_innerhtml_context:  "Reset Password",
    login_notification: `Login Required. Please use your current username and Password to login and access the system!`,
    reset_password_notification: `Please check on your email if you received a security code.\n\n If you filled in the correct email, it must have been sent successfully. If not, Please consult System Administrator for help!`,
    input_security_code_notification: `Please fill in your email to receive a security code!`,
    fill_in_all_fields: `<small>Please fill in all fields to login!</small>`,
    notification_title: {
        login_notification_title: "Login Notification",
        reset_password_notification_title: "Reset Password Notification",
        input_security_code_notification_title: "Input Security Code Notification",
        forgot_password_notification_title: "Forgot Password Notification",
        dashboard_welcome_notification_title: "Welcome Message Notification"
    },
    errors: {
        fill_in_all_fields: `<small>Please fill in all fields to login!</small>`,
        empty_email: `Empty email`,
        invalid_email: `<small>Email is invalid. Please correct your email to proceed!</small>`,
        invalid_contact: `<small>Contact is invalid. Please correct your contact to proceed!</small>`,
        invalid_password: `<small>Password too short or too long. Please fill in a strong password!</small>`,
        incorrect_password: `<small>Wrong Password. Fill in correct password to proceed!</small>`,
        password_mismatch: `Password mismatch. Please confirm your password!`,
        wrong_user_credentials: `Wrong auth credentials`,
        user_not_exists: `<small>No user found with the input Email. Please register to proceed!</small>`,
        unexpected_error: `Please try again or consult System Administrator for help!`,
        wrong_security_code: `You entered Incorrect Security Passcode. Please check the latest passcode or close and reopen the application and try resetting your password again!`,
        create_account: 'Registration failed!',
        reset_password: `Password Reset failed!`
    },
    user_exists: `<small>Seems you're already registered!</small>`,
    success: {
        login_success: `<small>Login Successfull, Navigating to Dashboard. Please wait...</small>`,
        create_account: "Registration Success",
        reset_password: `Password Reset successfully!`
    },
    dashboard_welcome_notification: `Hello ${session == undefined ? null : session['username']}. Welcome back to the system.\n\n For any Assistance in using the system, Please contact system administrator.\n\n Thank you!`
}



