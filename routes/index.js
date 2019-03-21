// Full Documentation - https://www.turbo360.co/docs
const turbo = require('turbo360')({site_id: process.env.TURBO_APP_ID})
const vertex = require('vertex360')({site_id: process.env.TURBO_APP_ID})
const router = vertex.router()
const mysql = require('mysql')
const useragent = require('express-useragent');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const csrf = require('csurf');
const striptags = require('striptags');
const open = require('open');
const session = require('express-session');
//==================================================================
router.use(session({secret: 'ssshhhhh'}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

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
	connection.query('SELECT * FROM informasi', (err, rows)=>{
		for(var i = 0; i <= Math.ceil(rows.length/4)-1; i++){
			console.log(i)
		}
		
	})
})


var sess;

//index
router.get('/', function(req, res) { 
	sess = req.session;
		var message="";      
		connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4;SELECT * FROM akundesa; SELECT * FROM informasi; SELECT * FROM notif WHERE idDesa = ? GROUP BY idNotif DESC LIMIT 10',[sess.iduser], (err, rows, fs) => {
			console.log(sess.username);
			console.log(sess.iduser);
			console.log(rows[3].length)
		res.render('index.ejs', {postingan:rows[0], akun:rows[1], message:message, halaman:rows[2], notif:rows[3], loggedin:sess.username})         
	});
}); 

router.get('/halaman/:num', (req,res)=>{
	sess = req.session;
	var number = req.params.num;
	var page = (number-1)*4;
	connection.query('SELECT * FROM informasi ORDER BY idArtikel Desc LIMIT 4 OFFSET ?;SELECT * FROM akundesa; SELECT * FROM informasi; SELECT * FROM notif WHERE idDesa = ? GROUP BY idNotif DESC LIMIT 10',[page , sess.iduser], (err, rows, fs) => {
		console.log(sess.username);
		console.log(sess.iduser);
		console.log(rows[3].length);
		console.log(rows[3]);
		res.render('halaman.ejs', {postingan:rows[0], akun:rows[1], halaman:rows[2], notif:rows[3],  loggedin:sess.username})         
	});
})


router.get('/update/:reqid', (req,res)=>{
	var reqid = req.params.reqid;
	connection.query('SELECT * FROM informasi WHERE idArtikel = ?',[reqid],(err,rows)=>{
		res.render('update.ejs', {postingan:rows})
		console.log(rows[0].desa)
	})
})

router.get('/posting', (req,res)=>{
	sess = req.session;
	if (sess.username) {
		connection.query("SELECT * FROM informasi WHERE desa = ?",[sess.username], (err,rows)=>{
			var message="";
			res.render('komentar.ejs',{greetings:sess.username, postingan:rows, message:message})

		})
		
	} else {
		var message = "";
		res.render('login.ejs', {message:message});
	}
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
	sess = req.session;
	var pembelian = req.body.pilihan;
	if (pembelian == undefined) {
		res.redirect('/jualbeli')
	} else {
		var pesan = "Saya dari "+sess.username +" ingin memesan \n"+ pembelian;
		console.log(pesan);
	// router.get('/:phonenum/:message', (req, res) => {
		var source = req.header('user-agent');
		var ua = useragent.parse(source);
		var phonenum = '+6282160011203';
		var dt = new Date();
		var tanggal = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
		var message="melakukan pembelian pada tanggal "+tanggal
		connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
		if (ua.isDesktop) {
			res.status(308).redirect(`https://web.whatsapp.com/send?phone=+${phonenum}&text=${pesan}`);
		} else if (ua.isMobile) {
			res.status(308).redirect(`whatsapp://send?phone=+${phonenum}&text=${pesan}`);
		} else {
			res.status(400).json({status: "error"});
		}}
	});
// });

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
	sess = req.session;
	if (sess.username) {
		connection.query('SELECT * FROM jualbeli', function(req,rows){
			res.render('jualbeli.ejs', {jual:rows});	
		})
	} else {
		const message= "Silahkan login terlebih dahulu sebelum melakukan pemesanan produk desa";
		res.render('login.ejs', {message:message})
	}
})

router.get('/deletepost/:id', (req,res)=>{
	sess = req.session;
	const idp = req.params.id;
	connection.query('DELETE FROM informasi WHERE idArtikel = ?', [idp], (err)=>{
		if (!err) {
			var dt = new Date();
			var tanggal = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
			var message="Menghapus Artikel pada tanggal"+tanggal
			connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
			res.redirect('/');
		} else { throw err;}
	})
})

router.get('/kunjungi/:name', (req,res)=>{
	var namadesa = req.params.name;
	console.log(namadesa);
	connection.query('SELECT * FROM informasi WHERE desa LIKE ?', '%'+[namadesa]+'%', function(err, rows){
		if (rows.length != 0) {
			console.log(rows[0].desa)
			var desa = rows[0].desa;
			res.render('artikel.ejs', {postingan:rows, nmdesa:desa})
		} else {
			var message = "BELUM ADA ARTIKEL";
			res.render('artikel.ejs', {postingan:rows, message:message, nmdesa:namadesa})
		}
		
	})

})


//add produk
router.post('/tambahproduk', jualan);

function jualan(req,res, files){
	sess =req.session;
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var fname = files.filetoupload.name;
		var desa = fields.desa;
		var produk = fields.produk;
		var harga = fields.harga;
		var kategori = fields.kategori;
		var oldpath = files.filetoupload.path;
		var newpath = '../Proj/public/images/uploaded/JUALAN/' + fname;
		console.log("FILE AKAN DI UPLOAD :")
		console.log(fname);
		console.log(oldpath);
		console.log("produk : "+produk);
		console.log("Desa : "+desa);
		console.log("harga : "+harga);
		connection.query("INSERT INTO requestjual (namabrg, hargabrg, kategori, foto, sumber, idDesa) VALUES ('"+produk+"','"+harga+"','"+kategori+"','"+fname+"','"+desa+"','"+sess.iduser+"')", function(err, fields, files){
			console.log("file sedang diupload.....");
			fs.rename(oldpath, newpath, function(err){
				if (err) {throw err;}
				console.log("file sudah diupload");
				var message="Produk sudah diminta untuk diupload pada tanggal "+tanggal 
				connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
				res.redirect('/');
			})
		}
		)}
		)}

//edit artikel
router.post('/ubahartikel', edit);
function edit(req,res, files){
	sess =req.session;
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files){
		var reqid = fields.id;
		var fname = files.filetoupload.name;
		var desa = fields.desa;
		var judul = fields.judul;
		var tentang = fields.tentang;
		var artikel = fields.artikel;
		var oldpath = files.filetoupload.path;
		var newpath = '../Proj/public/images/uploaded/' + fname;
		var dt = new Date();
		var tanggal = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
		console.log("FILE AKAN DI UBAH :")
		console.log(fname);
		console.log(oldpath);
		console.log("Judul : "+judul);
		console.log("Desa : "+desa);
		console.log("Isi : "+artikel);
		connection.query("UPDATE informasi SET desa = ?, judul = ?, tentang = ?, postingan = ?, foto = ?, tanggal = ? WHERE idArtikel = ?",[desa,judul,tentang,artikel,fname, tanggal,reqid] ,function(err, fields, files){
			console.log("file sedang diupload.....");
			fs.rename(oldpath, newpath, function(err){
				if (err) {throw err;}
				console.log("file sudah diubah");
				var message="Artikel sudah diubah pada tanggal "+tanggal;
				connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
				res.redirect('/');
			})
		}
		)}
		)}



//add artikel
router.post('/tambahartikel', posting);
function posting(req,res, files){
	sess =req.session;
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
		connection.query("INSERT INTO request (idDesa, desa, judul, tentang, postingan, foto, tanggal) VALUES ('"+sess.iduser+"','"+desa+"','"+judul+"','"+tentang+"','"+artikel+"','"+fname+"','"+tanggal+"')", function(err, fields, files){
			console.log("file sedang diupload.....");
			fs.rename(oldpath, newpath, function(err){
				if (err) {throw err;}
				console.log("file sudah diupload");
				var message="Artikel sudah diminta untuk diterbitkan pada tanggal "+tanggal;
				connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
				res.redirect('/');
			})
		}
		)}
		)}

	router.get('/logout', (req,res)=>{
		req.session.destroy(function(err) {
			if(err) {
				console.log(err);
			} else {
				res.redirect('/');
			}
		});
	});

	router.post('/login', loggedin)
//function untuk login
function loggedin(req,res){
	var username = req.body.username;
	var password = req.body.password;
	sess = req.session;
	connection.query('SELECT * FROM akundesa WHERE email = ?',[username], function (error, results, fields) {
		if (error) {
			res.send({
				"code":400,
				"failed":"error ocurred"
			})
		}else{
			if(results.length >0){
				sess.username = results[0].namadesa;
				sess.iduser = results[0].id
				console.log(sess.iduser)
				if(results[0].password == password){
					// console.log(results[0].namadesa)
					var dt = new Date();
					var tanggal = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
					var message = "Login pada tanggal "+tanggal
					connection.query("INSERT INTO notif (idDesa, Notif, Tanggal) VALUES ('"+sess.iduser+"','"+message+"','"+tanggal+"')")
					res.redirect('/');
				}
				else{
					var message = "Password atau email salah"
					res.render('login.ejs', {message: message});
				}
			}
			else{
				var message = "Password atau email salah"
				res.render('login.ejs', {message: message});
			}
		}
	});
}

//<---------------- //ADMIN ----------------------------->

router.get('/admin', (req,res)=>{
	sess =req.session;
	if (sess.admin) {
		res.redirect('/adminhome');
	} else {
		var message = "";
		res.render('loginAdmin.ejs', {message:message})
	}
	
})

router.get('/adminhome', (req,res)=>{
	sess = req.session;
	if (sess.admin) {
		connection.query
		('SELECT * FROM request; SELECT * FROM informasi ORDER BY idArtikel Desc; SELECT * FROM akundesa;SELECT * FROM requestjual; SELECT * FROM jualbeli',(err,rows)=>{
			res.render('admin.ejs', {req:rows[0], postingan:rows[1], data:rows[2], jual:rows[3], jb:rows[4]})
		})
	} else {
		res.redirect('/admin')
	}
})

router.get('/formpost', (req,res)=>{
	connection.query('SELECT desa, extract(year from tanggal) as tahun, extract(month from tanggal) as bulan, COUNT(postingan) as postingan from informasi group by desa, extract(year from tanggal), extract(month from tanggal) ORDER BY `tahun` DESC', (err,rows)=>{
		res.render('hasilpost.ejs', {data:rows})
	})
})

router.post('/hasilpost',(req,res)=>{
	const tahun = req.body.tahun;
	const bulan = req.body.bulan;
	console.log(tahun)
	console.log(bulan)
	if (tahun == "semua") {
		connection.query('SELECT desa, extract(year from tanggal) as tahun, extract(month from tanggal) as bulan, COUNT(postingan) as postingan from informasi WHERE extract(month from tanggal) = ? group by desa, extract(year from tanggal), extract(month from tanggal) ORDER BY `tahun` DESC',[bulan], (err,rows)=>{
			res.render('hasilpost.ejs', {data:rows})
		})
		if (bulan == "semua") {
			res.redirect('/formpost')
		}
	} else if (bulan == "semua") {
		connection.query('SELECT desa, extract(year from tanggal) as tahun, extract(month from tanggal) as bulan, COUNT(postingan) as postingan from informasi WHERE extract(year from tanggal) = ? group by desa, extract(year from tanggal), extract(month from tanggal) ORDER BY `bulan` ASC',[tahun], (err,rows)=>{
			res.render('hasilpost.ejs', {data:rows})
		})
	} else if (tahun == "semua" && bulan == "semua") {
		res.redirect('/formpost')
	} else{
		connection.query('SELECT desa, extract(year from tanggal) as tahun, extract(month from tanggal) as bulan, COUNT(postingan) as postingan from informasi WHERE extract(year from tanggal) = ? AND extract(month from tanggal) = ? group by desa, extract(year from tanggal), extract(month from tanggal) ORDER BY `bulan` ASC',[tahun, bulan], (err,rows)=>{
			res.render('hasilpost.ejs', {data:rows})
		})
	}	
})


router.get('/delete/:id', (req,res)=>{
	const idp = req.params.id;
	connection.query('DELETE FROM informasi WHERE idArtikel = ?', [idp], (err)=>{
		if (!err) {
			res.redirect('/adminhome');
			console.log("sudah dihapus")
		} else { throw err;}
	})
})

router.get('/deletejual/:id', (req,res)=>{
	sess = req.session;
	const idp = req.params.id;
	connection.query('DELETE FROM jualbeli WHERE id = ?', [idp], (err)=>{
		if (!err) {
			console.log(">>>> produk sudah di hapus");
			res.redirect('/adminhome');
		} else { throw err;}
	})
})

router.post('/loginAdmin', (req,res)=>{
	sess = req.session;
	var username = req.body.username;
	var password = req.body.password;
	if (username == "adminkim" && password == "kimadmin") {
		sess.admin = username;
		res.redirect('/adminhome');
	} else {
		var message = "password atau username salah";
		res.render('loginAdmin.ejs', {message:message})
	}
})

router.get('/accept/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	sess = req.session;
	connection.query("INSERT INTO informasi (idDesa, desa, judul, tentang, postingan, foto, tanggal) SELECT idDesa, desa, judul, tentang, postingan, foto, tanggal FROM request WHERE reqid = ?; DELETE FROM request WHERE reqid= ?;", [reqid,reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Postingan sudah diterbitkan")
				res.redirect('/adminhome');	
			}
		})
})
router.get('/reject/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	connection.query("DELETE FROM request WHERE reqid= ?", [reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Postingan sudah dibatalkan")
				res.redirect('/adminhome');
			}
		})
})

router.get('/acceptjual/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	console.log(reqid)
	sess = req.session;
	connection.query("INSERT INTO jualbeli (namabrg, hargabrg, kategori, foto, sumber) SELECT namabrg, hargabrg, kategori, foto, sumber FROM requestjual WHERE id = ?; DELETE FROM requestjual WHERE id= ?;", [reqid,reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Produk sudah diterbitkan untuk dijual")
				res.redirect('/adminhome');	
			}
		})
})
router.get('/rejectjual/:reqid', (req,res)=>{
	var reqid= req.params.reqid;
	connection.query("DELETE FROM requestjual WHERE id= ?", [reqid], (err, rows)=>{
		if (err) {throw err} 
			else {
				console.log("Produk sudah dibatalkan")
				res.redirect('/adminhome');
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
