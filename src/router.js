// using code from DomoMaker E by Aidan Kaufman
const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/index', mid.requiresLogin, controllers.Account.gamePage);
  app.get('/mainMenu', mid.requiresLogin, controllers.Account.mainMenuPage);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('*', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

