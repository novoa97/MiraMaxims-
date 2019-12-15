var map;
var markers = []
var data = []

const types = {
  malalt: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
  doctor: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  voluntari: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
}

/* Init */
toMapPage()
checkSesionStart()

/* Google Maps */
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
     center: {lat: 41.8204600, lng: 1.8676800 },
     zoom: 8.5,
     streetViewControl: false,
     mapTypeControl: false
   });
   setMarkers()
}
function setMarkers(){
  jQuery.get("http://51.178.27.50:4000/api/users", function(response,message){
      if(message == "success"){
        data = response["users"]
        console.log(data)
        data.forEach( element => {
          var role = getRole(element.role)
          if (role){
            var coord = {lat: element.latitude, lng: element.longitude }
            console.log(coord)
            var marker = new google.maps.Marker({
                 position: coord,
                 map: map,
                 title: element.name,
                 icon: { url: types[role]}
            })
            markers.push(marker)
            var info = getInfo(element,role)
            var infowindow = new google.maps.InfoWindow({ content: info });
            marker.addListener('click', function() { infowindow.open(map, marker)})
            console.log("ok")
          }
        })
      }
  })
}
function getRole(role){
  switch (role) {
    case 0:
      return "malalt"
      break;
    case 1:
      return "voluntari"
      break
    case 2:
      return "doctor"
      break
    case 3:
      return "organitzacio"
      break;
    default:
      return null
  }
}
function  getInfo(data,role){
  var info = '<div id="content" class="info">'+
          '<div id="siteNotice">'+
          '</div>'
  if (data.profile_pic) info += '<img src="'+data.profile_pic+'" alt="Avatar" class="avatar"><h1 id="firstHeading" class="firstHeading">'+ data.name +'</h1>'
  else info += '<img src="images/grey.jpeg" alt="Avatar" class="avatar"><h1 id="firstHeading" class="firstHeading">'+ data.name +'</h1>'
  if (role == "malalt"){
    info  += '<h3 id="secondHeading class="secondHeading">'+ role.charAt(0).toUpperCase() + role.slice(1) + ': '+ data.disease +'</h3>'
  }
  else{
    info  += '<h3 id="secondHeading class="secondHeading">'+ role.charAt(0).toUpperCase() + role.slice(1) +'</h3>'
  }
  info += '<div id="bodyContent">'+
          '<p>' + data.description + '</p>'+
          '</div>'+
          '</div>';
  if (boolSesion()){
    info += '<div><a href="mailto:'+data.email+'">Contactar</a>.<br></div'
  }
  return info
}
/* Dropdown */
function dropdown() {
  document.getElementById( "dropdownfilter").classList.toggle("show");
}
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
/* Filter */
function switchFilter(filter){
  var checkBox = document.getElementById(filter)
  if (checkBox.checked){
      markers.forEach( marker => {
        if ( marker.icon.url == types[filter]) marker.setVisible(true)
      })
  }
  else{
      markers.forEach( marker => {
        if ( marker.icon.url == types[filter]) marker.setVisible(false)
      })
  }
}
/* Map page */
function toMapPage(){
  $('#user').hide()
  $('#toMap').hide()
  $('#toUser').show()
  $('#filter').show()
  $('#map').show()
  deleteMarkers()
  setMarkers()
  checkSesionStart()
}
/* User page */
function toUserPage(){
  $('#user').show()
  $('#toMap').show()
  $('#toUser').hide()
  $('#filter').hide()
  $('#map').hide()
}
function login(){
  var mail = $('#mail').val()
  var password = $('#password').val()
  if ( mail && password){
    console.log("login")
    $.post("http://51.178.27.50:4000/api/sign_in", { email: mail, password: password})
      .done(function(response,message){
        setSesion(response)
        console.log(message)
      })
      .fail( function(error){ console.log(error)})
  }
}
function logOut(){
  localStorage.removeItem('token')
  localStorage.removeItem('data')
  disableSesion()
}

/* Sesion */
function checkSesionStart(){
  var token = localStorage.getItem('token')
  if (token){
    activeSesion(JSON.parse(localStorage.getItem('data')))
  }
  else{
    disableSesion()
  }

}
function boolSesion(){
  var token = localStorage.getItem('token')
  if (token) return true
  else false
}
function setSesion(dataUser){
  console.log("setSesion")
  //Save token to localstore
  var token = dataUser["data"]["token"]
  localStorage.setItem('token', token)
  localStorage.setItem('data', JSON.stringify(dataUser["data"]))
  activeSesion(dataUser)
}
function activeSesion(dataUser){
    //Change user Page
    $('#user-info').show()
    $('#user-form').hide()
    console.log(JSON.stringify(dataUser))
    //Change text
    $('#email-info').html(dataUser["email"])
    $('#name-info').html(dataUser["name"])
    $('#toUser').html('<i class="fas fa-user"></i>  User')
}
function disableSesion(){
  $('#toUser').html('<i class="fas fa-sign-in-alt"></i>  Accedir </button>')
  $('#user-info').hide()
  $('#user-form').show()
}
