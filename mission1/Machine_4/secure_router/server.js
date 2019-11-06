'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const hbs = require("express-handlebars");
var path = require('path');
var favicon = require('serve-favicon');
var crypto = require('crypto');

var port = 80;

const secretkey = 'gasdFAsdgaw3ERGAWf3wf#F3DF#F3W';

// // Create Cross Site Request Forgery Token
// var xsrfCookie = "";
// var xsrfForm = "";
//

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, '/public', 'favicon.ico')));


app.engine( 'hbs', hbs( {
    helpers: {
        getUsername: function(){
            return 'Log in ya bum';
        }
    },
    extname: 'hbs',
} ) );

app.set('view engine', 'hbs');

app.use(session({
    key: 'user_sid',
    secret: 'routerlogin',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(253402300000000)
    }
}));

console.log(__dirname);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.redirect('/login');
});

// route for user Login
app.route('/login')
    .get((req, res) => {

        res.render('login.hbs', {
            title: "Login",

        });
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password,
            tokenResp = req.body.token;

        //console.log("HMAC after GET Req: " + anHMAC);

        if (username === 'admin' && password === 'admin'){
            req.session.user = 'admin';
            res.redirect('/dnssettings');
        }
        else {
            throw Error("Error: Incorrect Login or Verification Failure");
        }
    });


app.post('/dnssettings', function(req, res){
        if (!req.session.user){
            return res.redirect('/login');
        }
        req.session.newServer = req.body.dns_addr;
        let PostTokenResp = req.body.token;
	console.log(PostTokenResp);
        let post_HMAC = crypto.createHmac("sha256", secretkey);
        let stringhmac2 = post_HMAC.update(req.cookies['xsrfID'].concat(PostTokenResp)).digest('base64');

        console.log("HMAC during POST Req: " + stringhmac2);

        if (stringhmac2 === req.session.HMAC) {
            var new_dns_addr = req.body.dns_addr;

            const exec = require('child_process').exec;
            exec('sed -i "/forwarders { 10.4/c\        forwarders { ' + new_dns_addr + '; };" /etc/bind/named.conf.options && service bind9 restart', (err, stdout, stderr) => {
                if (err) {
                    //some err occurred
                    console.error(err)
                } else {
                    // the *entire* stdout and stderr (buffered)
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                }
            });
            req.session.passed = true;
            res.redirect("/dnssettings");
        }else{
            req.session.failed = true;
            res.redirect("/dnssettings");
        }
    });

app.get('/dnssettings', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        let cookie_val = crypto.randomBytes(32).toString('base64')
        res.cookie("xsrfID", cookie_val);
        let random_hash = crypto.randomBytes(32).toString('base64');
        let getHMAC = crypto.createHmac("sha256", secretkey);
        req.session.HMAC = getHMAC.update(cookie_val.concat(random_hash)).digest('base64');

        //console.log("cookie: " + cookie_val);
        //console.log("randomhash: " + random_hash);
        console.log("HMAC during GET Req: " + req.session.HMAC);

        if (req.session.passed){
            req.session.passed = false;
            res.render('dnssettings.hbs', {
                title: "DNS Settings",
                username: req.session.user,
                passed: true,
                new_server: req.session.newServer,
                xsrfForm: random_hash
            });
        }
        else if (req.session.failed){
            req.session.failed = false;
            res.render('dnssettings.hbs', {
                title: "DNS Settings",
                username: req.session.user,
                failed: true,
                new_server: req.session.newServer,
                xsrfForm: random_hash
            });
        }
        else {res.render('dnssettings.hbs', {
            title: "DNS Settings",
            username: req.session.user,
            xsrfForm: random_hash
        });
        }
    }else{
        res.redirect("/login");
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(port, '10.4.18.1', () => console.log("App started on port " + port));


function sendFile(res, filename) {
    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end(content, 'utf-8');
    })

}
