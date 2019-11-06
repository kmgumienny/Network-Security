var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const hbs = require("express-handlebars");
var path = require('path');
var favicon = require('serve-favicon');

port = 80;

var app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});
//app.set('port', port);
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
    // defaultLayout: 'main',
    // layoutsDir: __dirname + '/views/layouts/',
    // partialsDir: __dirname + '/views/partials/'
} ) );

app.set('view engine', 'hbs');
app.use(session({
    key: 'user_sid',
    secret: 'routerloginfds',
    resave: false,
    saveUninitialized: false,
    cookie: {
       expires: new Date(253402300000000)
    }
}));

console.log(__dirname);


app.use(express.static(path.join(__dirname, '/public')));
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dnssettings');
    } else {
        next();
    }
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.render('login.hbs', {
            title: "Login"
        });
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        if (username === 'admin' && password === 'admin'){
            req.session.user = 'admin';
            res.redirect('/dnssettings');
        }
    });


app.route('/dnssettings')
    .post((req, res) => {
	if (!req.session.user){
	    return res.redirect('/login');
	}
        var new_dns_addr = req.body.dns_addr;

        const exec = require('child_process').exec;
        //sed -i '/dns-nameservers/c\        dns-nameservers + new_dns_addr + ' /etc/network/interfaces
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
        res.render('dnssettings.hbs', {
            title: "DNS Settings",
            username: req.session.user,
            set: true,
            new_server: new_dns_addr
        });
    });

app.get('/dnssettings', (req, res) => {
   if (req.session.user && req.cookies.user_sid) {
       res.render('dnssettings.hbs', {
          title: "DNS Settings",
           username: req.session.user
       });
   }
    else {
    res.redirect('/login');
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
app.listen(80, '10.4.18.1', () => console.log("App started on port" + port));


function sendFile(res, filename) {
    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end(content, 'utf-8');
    })

}
