var dt = new Date();
var ggwp = dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate();
var o = 'id-ID'
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
console.log(ggwp)
console.log(dt.toLocaleDateString('o',options))

