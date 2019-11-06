var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const hbs = require("express-handlebars");
var path = require('path');

port = 666;

var app = express();
//app.set('port', port);
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

console.log(__dirname);

app.use(express.static(path.join(__dirname, '/public')));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


app.get('/', (req, res) => {
    res.render('dashboard.hbs', {
            title: "Advertisement",
            username: "Visitor"
        });
});

app.route('/router')
    .get((req, res) => {
        var new_dns_addr = req.body.dns_addr;
        res.render('router.hbs', {
            title: "Router Tutorial!"
        });
    });


app.route('/')
    .post((req, res) => {
        var new_dns_addr = req.body.dns_addr;

        const exec = require('child_process').exec;
        //sed -i '/dns-nameservers/c\        dns-nameservers + new_dns_addr + ' /etc/network/interfaces
        exec('echo this shouldn\'t be called', (err, stdout, stderr) => {
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
app.listen(port, '10.4.18.160', () => console.log("App started on port " + port));


function sendFile(res, filename) {
    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end(content, 'utf-8');
    })

}
