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
	multipleStatements : true,
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
router.get('/coba', (req,res)=>{
	connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4;SELECT * FROM akundesa', (err,results)=>{
		// console.log(results[0]);
		// console.log(results[1]);
		res.render('auth.ejs', {postingan:results[0], akun:results[1]});
	})
})


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
// function qInformasi(){
// 	return new Promise(function(resolve, reject){
// 	connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4', (err,results)=>{
// 		if (!err) {
// 			resolve(results)
// 		}
// 	})
// })
// }

// function qAkun(){
// 	return new Promise(function(resolve, reject){
// 	connection.query('SELECT * FROM akundesa', (err,results2)=>{
// 		if (!err) {
// 			resolve(results2)
// 		}
// 	})
// })
// }
// router.get('/', (req,res)=>{
// 	connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4;SELECT * FROM akundesa', (err,results)=>{
// 		// console.log(results[0]);
// 		// console.log(results[1]);
// 		res.render('index.ejs', {postingan:results[0], akun:results[1]});
// 	})
// })
router.get('/', function(req, res) { 
var message="";      
connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4;SELECT * FROM akundesa', (err, rows, fs) => {
          res.render('index.ejs', {postingan:rows[0], akun:rows[1], message:message})         
       });
       }); 

	router.get('/halaman/:num', (req,res)=>{
		var number = req.params.num;
		var page = (number-1)*4;
		connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4 OFFSET ?;SELECT * FROM akundesa',[page], (err, rows, fs) => {
			res.render('halaman.ejs', {postingan:rows[0], akun:rows[1]})         
		});
	})

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
		var dt = new Date();
		var tanggal = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
		console.log("FILE AKAN DI UPLOAD :")
		console.log(fname);
		console.log(oldpath);
		console.log("Judul : "+judul);
		console.log("Desa : "+desa);
		console.log("Isi : "+artikel);
		connection.query("INSERT INTO request (desa, judul, tentang, postingan, foto, tanggal) VALUES ('"+desa+"','"+judul+"','"+tentang+"','"+artikel+"','"+fname+"','"+tanggal+"')", function(err, fields, files){
			console.log("file sedang diupload.....");
			fs.rename(oldpath, newpath, function(err){
				if (err) {throw err;}
				console.log("file sudah diupload");
				var message="POSTINGAN SUDAH DIMINTA UNTUK DITERBITKAN"
				res.redirect('/');
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

//<---------------- //ADMIN ----------------------------->

router.get('/admin', (req,res)=>{
	var message = "";
	res.render('loginAdmin.ejs', {message:message})
})

router.post('/loginAdmin', (req,res)=>{
	var username = req.body.username;
	var password = req.body.password;
	if (username == "adminkim1010" && password == "kimadmin0101") {
		connection.query('SELECT * FROM request',(err,rows)=>{
			res.render('admin.ejs', {req:rows})
		})
	} else {
		var message = "password atau username salah";
		res.render('loginAdmin.ejs', {message:message})
	}
})

router.get('/accept/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	connection.query("INSERT INTO informasi (desa, judul, tentang, postingan, foto, tanggal) SELECT desa, judul, tentang, postingan, foto, tanggal FROM request WHERE reqid = ?; DELETE FROM request WHERE reqid= ?;", [reqid,reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Postingan sudah diterbitkan")
				connection.query('SELECT * FROM request',(err,rows)=>{
					res.render('admin.ejs', {req:rows})
				})
			}
	})
})
router.get('/reject/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	connection.query("DELETE FROM request WHERE reqid= ?", [reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Postingan sudah dibatalkan")
				connection.query('SELECT * FROM request',(err,rows)=>{
					res.render('admin.ejs', {req:rows})
				})	
			}
	})
})








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
