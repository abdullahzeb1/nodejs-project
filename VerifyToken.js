const JWT = require('jsonwebtoken');

module.exports = function (req, res, next) {
  //Token Exist :-
  const token = req.cookies.access_token;
  if (!token) {
    req.user = { _id: '', role: '', isAuthenticated: false };
  }
  if (token) {
    // Verify Token :-
    const verifiy = JWT.verify(token, 'NBB123');
    if (!verifiy) {
      res.json({ _id: '', role: '', isAuthenticated: false });
    }
    req.user = verifiy;
  }
  //Next Roule :-
};
