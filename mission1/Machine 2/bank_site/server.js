var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const hbs = require("express-handlebars");
var path = require('path');
var favicon = require('serve-favicon');

port = 80;

var app = express();
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


console.log(__dirname);

app.use(express.static(path.join(__dirname, '/public')));



app.set('view engine', 'hbs');
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
        res.render('dashboard.hbs', {
            title: "Dashboard"
        });
});

app.route('/login')
    .get((req, res) => {
        res.render('login.hbs', {
            title: "Login"
        });
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        console.log("Username: " + username +" Password: " + password)

        // if (username === 'admin' && password === 'admin'){
        if (username && password){
            res.render('dashboard.hbs', {
            title: "Dashboard",
            username: username
        });
        }
    });

app.route('/dashboard')
    .post((req, res) => {
        var new_dns_addr = req.body.dns_addr;
        res.render('dashboard.hbs', {
            title: "Bank Login"
        });
    });


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});


// start the express server
// app.listen(80, '10.4.17.1', () => console.log("App started on port" + port));
app.listen(80, '10.4.18.160',() => console.log("App started on port " + port));


function sendFile(res, filename) {
    fs.readFile(filename, function (error, content) {
        res.writeHead(200, {'Content-type': 'text/html'});
        res.end(content, 'utf-8');
    })

}
