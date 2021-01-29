/*
 *   Copyright (c) 2021 WSO2 Inc. (http://www.wso2.org)
 *   All rights reserved.
 *   
 *   This software is the property of WSO2 Inc. and its suppliers, if any.
 *   Dissemination of any information or reproduction of any material contained
 *   herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 *   You may not alter or remove any copyright or other notice from copies of this content.
 */
require('dotenv').config();
var path = require('path');
var fs = require('fs');
const base64url = require('base64url');
const {base64decode}  = require('nodejs-base64'),
decoder = require('saml-encoder-decoder-js'),
parseString = require("xml2js").parseString,
stripPrefix = require("xml2js").processors.stripPrefix,
JWT = require('jsonwebtoken');
var express = require('express');
var session = require('express-session');
var passport = require('passport');
var saml = require('passport-saml').Strategy;

var bodyParser = require('body-parser');

var userProfile;
var app = express();
let nameID, token;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

// saml strategy for passport
var strategy = new saml(
	{
		entryPoint: process.env.SAML_ENTRYPOINT,
		issuer: process.env.SAML_ISSUER,
		protocol: process.env.SAML_PROTOCOL,
		logoutUrl: process.env.SAML_LOGOUTURL,
		//cert: fs.readFileSync('./nilukasmal.pem', 'utf-8')
	},
	(profile, done) => {
		userProfile = profile;
		done(null, userProfile);
	}
);

passport.use(strategy);

var redirectToLogin = (req, res, next) => {
	if (!req.isAuthenticated() || userProfile == null) {
		return res.redirect('/app/login');
	}
	next();
};

app.get('/app', redirectToLogin, (req, res) => {
	res.render('index', {
		title: 'Express Web Application',
		heading: 'Logged-In to Express Web Application'
	});
});

app.get(
	'/app/login',
	passport.authenticate('saml', {
		successRedirect: '/app',
		failureRedirect: '/app/login'
	})
);

app.get('/app/logout', (req, res) => {
	if (req.user == null) {
		return res.redirect('/app/home');
	}

	return strategy.logout(req, (err, uri) => {
		req.logout();

		userProfile = null;
		return res.redirect(uri);
	});
});

app.get('/app/failed', (req, res) => {
	res.status(401).send('Login failed');
});

// app.post(
// 	// '/saml/consume',
// 	// passport.authenticate('saml', {
// 	// 	failureRedirect: '/app/failed',
// 	// 	failureFlash: true
// 	// }),
// 	// (req, res) => {

// 	// 	// saml assertion extraction from saml response
// 	// 	var samlResponse = res.req.body.SAMLResponse;
// 	// 	var decoded = base64decode(samlResponse);
// 	// 	var assertion =
// 	// 		('<saml2:Assertion' + decoded.split('<saml2:Assertion')[1]).split(
// 	// 			'</saml2:Assertion>'
// 	// 		)[0] + '</saml2:Assertion>';
// 	// 	var urlEncoded = base64url(assertion);
// 	// 	console.log("*((*(*"+urlEncoded)

// 	// 	// success redirection to /app
// 	// 	return res.redirect('/app');
// 	// }
	
// );
app.post(
	'/saml/consume',
	passport.authenticate('saml', {
		failureRedirect: '/app/failed',
		failureFlash: true
	}),
	(req, res) => {
		   req.headers['token'] = token;
		  

		  //let body_content = JSON.(res.data.payload.body.data);
		  console.log("$%%$%"+req.headers+"%^%^%^%^%^%^"+JSON.stringify("*&*&*&*"+req.headers['token']));
		   ;
		// saml assertion extraction from saml response
		   var samlResponse = res.req.body.SAMLResponse;
		   const xmlResponse = req.body.SAMLResponse;
	   decoder.decodeSamlPost(xmlResponse, (err,xmlResponse) => {
		 if(err) {
		   throw new Error(err);
		 } else {
		   parseString(xmlResponse, { tagNameProcessors: [stripPrefix] }, function(err, result) {
			 if (err) {
			   throw err;
			 } else {
   
			   //sign token
			   token = JWT.sign({id: nameID}, process.env.SESSION_SECRET, {
				 expiresIn: '24h' //other configuration options
			   });
			   console.log(result);
			   
   
			 }
		   });
		 }
	   })
   
		var decoded = base64decode(samlResponse);
		fs.writeFile('./saml-response/saml_response.xml', decoded, function (err,data) {
			if (err) {
			  return console.log(err);
			}
			console.log(data);
		  })
		var assertion =
			('<saml2:Assertion' + decoded.split('<saml2:Assertion')[1]).split(
				'</saml2:Assertion>'
			)[0] + '</saml2:Assertion>';
		var urlEncoded = base64url(assertion);
   
		// success redirection to /app
		return res.redirect('/app');
	 
	}
   );
   
app.post('/app/home', (req, res) => {
	res.render('home', {
		title: 'Express Web Application',
		heading: 'Express Web Application'
	});
});

app.listen(process.env.PORT || 3000);