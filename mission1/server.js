var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const hbs = require("express-handlebars");
var path = require('path');

port = 80;

var app = express();
app.set('port', port);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


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
    secret: 'routerlogin',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
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
            //TODO set session variable and send
            req.session.user = 'admin'
            res.redirect('/dashboard');
        }
    });


app.route('/dashboard')
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        if (username === 'admin' && password === 'admin'){
            //TODO set session variable and send
            req.session.user = 'admin'
            res.redirect('/dashboard');
        }
    });

app.route('/dnssettings')
    .post((req, res) => {
        var new_dns_addr = req.body.dns_addr;

        const { exec } = require('child_process');
        //sed -i '/dns-nameservers/c\        dns-nameservers + new_dns_addr + ' /etc/network/interfaces
        exec('echo new dns: ' + new_dns_addr, (err, stdout, stderr) => {
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


// route for user's dashboard
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('dashboard.hbs', {
            title: "Dashboard",
            username: req.session.user
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/dnssettings', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render('dnssettings.hbs', {
            title: "DNS Settings",
            username: req.session.user
        });
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
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));


function sendFile(res, filename) {
    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end(content, 'utf-8');
    })

}
