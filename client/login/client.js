// using code from DomoMaker E
let username;
let pass;

// using code from DomoMaker E by Aidan Kaufman
const handleError = (message) => {
  $("#errorMessage").text(message);
};

const redirect = (response) => {
  window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
  $.ajax({
     
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    success: success,
    error: function(xhr, status, error) {
      
      const messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });  
};

const sendAjaxHTML = (type, action, data, success) => {
  $.ajax({
     
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'html',
    success: success,
    error: function(xhr, status, error) {
      
      const messageObj = xhr.responseText;
      handleError(messageObj.error);
    }
  });  
};

const handleLogin = (e) => {
  e.preventDefault();
  
  
  if($("#user").val() == "" || $("#pass").val() == "") {
    handleError("Username or password is empty");
    return false;
  }
  
  console.log($("input[name=_csrf]").val());
  
  
  sendAjax("POST", $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  
  return false;
};

const handleSignup = (e) => {
  e.preventDefault();
  
  
  if($("#user").val() == "" || $("#pass").val() == "" || $("#pass2").val() == "") {
    handleError("All fields are required");
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("Passwords do not match");
    return false;
  }
  
  username = $("#user").val();
  pass = $("#pass").val();
  console.log("Username = " + username + " Pass = " + pass);
  
  //console.dir($("#signupForm").serialize());
  sendAjaxHTML("POST", $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  
  return false;
};

const renderLogin = function() {
  return (
  <form id="loginForm" name="loginForm"
    onSubmit={this.handleSubmit}
    action="/login"
    method="POST"
    className="mainForm"
  >
    <label htmlFor="username">Username: </label>
    <input id="user" type="text" name="username" placeholder="username"/>
    <label htmlFor="pass">Password: </label>
    <input id="pass" type="password" name="pass" placeholder="password"/>
    <input type="hidden" name="_csrf" value={this.props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign in"/>
  </form>
  );
};

const renderSignup = function() {
  return (
  <form id="signupForm" 
    name="signupForm"
    onSubmit={this.handleSubmit}
    action="/signup"
    method="POST"
    className="mainForm"
  >
    <label htmlFor="username">Username: </label>
    <input id="user" type="text" name="username" placeholder="username"/>
    <label htmlFor="pass">Password: </label>
    <input id="pass" type="password" name="pass" placeholder="password"/>
    <label htmlFor="pass2">Pass 2: </label>
    <input id="pass2" type="password" name="pass2" placeholder="retype password"/>
    <input type="hidden" name="_csrf" value={this.props.csrf} />
    <input className="formSubmit" type="submit" value="Sign Up" />
  </form>
  );
};


const createLoginWindow = function (csrf) {
  const LoginWindow = React.createClass({
    handleSubmit: handleLogin,
    render: renderLogin
  });
  
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const createSignupWindow = function (csrf) {
  const SignupWindow = React.createClass({
    handleSubmit: handleSignup,
    render: renderSignup
  });
    
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};


const setup = function(csrf) {
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  
  signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  
  
  createLoginWindow(csrf); // default view
};


const getToken = () => {
  sendAjax("GET", "/getToken", null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
















