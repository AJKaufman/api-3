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











