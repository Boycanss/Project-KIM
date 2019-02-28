// Full Documentation - https://www.turbo360.co/docs
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()
const mysql = require('mysql')
const useragent = require('express-useragent');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const busboy = require('then-busboy');
const fileUpload = require('express-fileupload');
const formidable = require('formidable');
const fs = require('fs');
var http = require('http');
const path = require('path');
const csrf = require('csurf');
const striptags = require('striptags');
const open = require('open');

//db
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'kim'
});
connection.connect(function(err){
	if(!err) {
		console.log("Database is connected ... boy");
	} else {
		console.log("Error connecting database ... boy");
	}
});

//coba



/*  This is the home route. It renders the index.mustache page from the views directory.
	Data is rendered using the Mustache templating engine. For more
	information, view here: https://mustache.github.io/#demo */

	// router.get('/', (req, res) => {
	// 	connection.query('SELECT * FROM informasi ', (err, rows, fs) => {
	// 		res.render('index.ejs', {postingan :rows})
	// 		if (!err) {
	// 			var status = "online";
	// 			connection.query('SELECT * FROM akundesa WHERE status = ?',[status], (err, rows2, results2) =>{
	// 				var length = results2.length;
	// 				console.log(length)
	// 				console.log(rows2)
	// 				res.render('index.ejs', {leng:length})
	// 			})
	// 		}	
	// 	});
	// })
router.get('/', function(req, res) {       
connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc', (err, rows, fs) => {
          res.render('index.ejs', {postingan:rows})         
       });
       });   

// router.get('/', (req, res) => {
// 		connection.query('SELECT * FROM informasi ', (err, rows, fs) => {
// 			if(!err) {
// 				// res.render('index.ejs', {postingan:rows})
// 				connection.query('SELECT * FROM akundesa WHERE status ="online"',(err, results) =>{
// 					if (results.length == 0) {
// 						res.render('index.ejs', {postingan:rows})
// 					} else {if (results.length == 1 ) {
// 						var desa = results[0].namadesa;
// 						res.render('index.ejs', {postingan:rows, desa:desa})
// 						var html = '<li><a href="login.html">Log in</a></li>';
// 						striptags(html);
// 					}}
// 						})
// 					}
// 				})
// 			});

/*  This route render json data */
router.get('/json', (req, res) => {
	res.json({
		confirmation: 'success',
		app: process.env.TURBO_APP_ID,
		data: 'this is a sample json route.'
	})
})

router.get('/posting', (req,res)=>{
	var status = "online";
	connection.query('SELECT * FROM akundesa WHERE status =?',[status] , (err, results) => {
		console.log(results);
		console.log(results.length);
		// console.log(results[0].status);
		if (results.length == 1) {
			var status = "online";
			if (results[0].status == status) {
				var desa = results[0].namadesa;
				res.render('komentar.ejs', {greetings :desa});
			}
		} else {
			var message = "";
			res.render('login.ejs', {message:message});}

	})

})

//baca
router.get('/baca/:idArtikel', (req,res)=>{
	var id = req.params.idArtikel;
	connection.query('SELECT * FROM informasi WHERE idArtikel = ?', [id], function(err,rows){
		console.log(id)
		res.render('artikelpanjang.ejs',{postingan:rows})
	})
})


//cari
router.post('/cari', (req,res)=>{
	var key = req.body.cari;
	console.log(key);
	connection.query('SELECT * FROM informasi WHERE postingan LIKE ?', '%'+[key]+'%', function(err, rows){
		console.log(rows);
		// var namadesa = rows[0].desa;
		res.render('artikelCari.ejs', {postingan:rows})
	})
})

//beli
router.post('/beli', (req,res)=>{
	var pembelian = req.body.pilihan;
	console.log(pembelian);
	var pesan = "Saya ingin memesan \n"+ pembelian;
	console.log(pesan);
	// app.get('/:phonenum/:message', (req, res) => {
    var source = req.header('user-agent');
    var ua = useragent.parse(source);
    var phonenum = '+6282160011203';

    if (ua.isDesktop) {
        res.status(308).redirect(`https://web.whatsapp.com/send?phone=+${phonenum}&text=${pesan}`);
    } else if (ua.isMobile) {
        res.status(308).redirect(`whatsapp://send?phone=+${phonenum}&text=${pesan}`);
    } else {
        res.status(400).json({status: "error"});
    }
});

router.get('/whatsapp', (req, res) => {
		var source = req.header('user-agent');
		var ua = useragent.parse(source);
		var phonenum = '+6282160011203';

		if (ua.isDesktop) {
			res.status(308).redirect(`https://web.whatsapp.com/send?phone=+${phonenum}`);
		} else if (ua.issMobile) {
			res.status(308).redirect(`whatsapp://send?phone=+${phonenum}`);
		} else {
			res.status(400).json({status: "error"});
		}
	})


router.get('/jualbeli',(req,res)=>{
	connection.query('SELECT * FROM jualbeli', function(req,rows){
	console.log(rows);
	res.render('jualbeli.ejs', {jual:rows});	
	})
	
})

router.get('/kunjungidesa/:name', (req,res)=>{
	var namadesa = req.params.name;
	connection.query('SELECT * FROM informasi WHERE desa LIKE ?', '%'+[namadesa]+'%', function(err, rows){
		console.log(namadesa)
		// console.log(rows[0].desa);
		var namadesa = rows[0].desa;
		res.render('artikel.ejs', {postingan:rows, namadesa:namadesa})
	})

})

//add
router.post('/tambahartikel', posting);
function posting(req,res, files){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var fname = files.filetoupload.name;
		var desa = fields.desa;
		var judul = fields.judul;
		var tentang = fields.tentang;
		var artikel = fields.artikel;
		var oldpath = files.filetoupload.path;
		var newpath = '../Proj/public/images/uploaded/' + fname;
		console.log("FILE AKAN DI UPLOAD :")
		console.log(fname);
		console.log(oldpath);
	console.log("Judul : "+judul);
	console.log("Desa : "+desa);
	console.log("Isi : "+artikel);
	connection.query("INSERT INTO informasi (desa, judul, tentang, postingan, foto) VALUES ('"+desa+"','"+judul+"','"+tentang+"','"+artikel+"','"+fname+"')", function(err, fields, files){
		console.log("file sedang diupload.....");
		fs.rename(oldpath, newpath, function(err){
			if (err) {throw err;}
			console.log("file sudah diupload");
			res.redirect('/')
		})
	}
	)}
	)}

	router.get('/logout', (req,res)=>{
		connection.query('UPDATE akundesa SET status = ""')
		res.redirect('/');
		});

	router.post('/login', loggedin)
//function untuk login
function loggedin(req,res){
	var username = req.body.username;
	var password = req.body.password;
	
	connection.query('SELECT * FROM akundesa WHERE email = ?',[username], function (error, results, fields) {
		if (error) {
			res.send({
				"code":400,
				"failed":"error ocurred"
			})
		}else{
			if(results.length >0){
				if(results[0].password == password){
					console.log(results[0].namadesa)
					var message = ""
					var desa = results[0].namadesa;
					res.render('komentar.ejs', {greetings: desa})
					if (!error) {
						connection.query('UPDATE akundesa SET status = "online" WHERE namadesa = ?',[results[0].namadesa])
					}
				}
				else{
					var message = "Password atau username salah"
					res.render('login.ejs', {message: message});
				}
			}
			else{
				var message = "Password atau username salah"
				res.render('login.ejs', {message: message});
			}
		}
	});
}










//=====================================================================================================================
/*  This route sends text back as plain text. */
router.get('/send', (req, res) => {
	res.send('This is the Send Route')
})

/*  This route redirects requests to Turbo360. */
router.get('/redirect', (req, res) => {
	res.redirect('https://www.turbo360.co/landing')
})


module.exports = router