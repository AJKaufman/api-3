// using code from DomoMaker E
const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  console.log('loading login page');
  res.render('login', { csrfToken: req.csrfToken() });
};

// display the game page
const gamePage = (req, res) => {
  res.render('index', { csrfToken: req.csrfToken() });
};

// display the game page
const mainMenuPage = (req, res) => {
  res.render('mainMenu', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please fill all fields.' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.render('index', { csrfToken: req.csrfToken() });
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields need to be filled.' });
  }
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'The passwords don\'t match.' });
  }


  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    // creates a new model of this user's data
    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    // promises to save the user's data
    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.render('index', { csrfToken: req.csrfToken() });
    });


    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};


module.exports.gamePage = gamePage;
module.exports.mainMenuPage = mainMenuPage;
module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;

