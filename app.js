mapboxgl.accessToken = 'pk.eyJ1IjoiYmV0YXBjaG9pMTBrIiwiYSI6ImNrY2ZuaWEwNjA2ZW0yeWw4bG9yNnUyYm0ifQ.bFCQ-5yq6cSsrhugfxO2_Q';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-122.40945776860957,37.7653468958055], 
    zoom: 12,
    hash: 'map'
});


function getUserLocation() {
  data = {
    "type": "FeatureCollection",
    "features": [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [-122.40945776860957, 37.7653468958055]
        },
        properties: {
            name: 'My Location'
        }
    
    }]
}
map.on('load', (e) => {
  map.loadImage(
      'img/mylocation.png', 
      function (error, image) {
          if (error) throw error;
          map.addImage('location-icon', image);
          map.addSource('my-location-src', {
              type: 'geojson',
              data: data
          });
          map.addLayer({
              id: 'my-location',
              type: 'symbol', 
              source: 'my-location-src',
              layout: {
                  'icon-image': 'location-icon', 
                  'icon-size': 0.9, 
                  'icon-allow-overlap': true, 
                  'icon-ignore-placement': true 
              }
          });
          map.addLayer({
              id: 'my-location-name',
              type: 'symbol',
              source: 'my-location-src',
              layout: {
                  'text-field': ['format', ['get', 'name'], { 'font-scale': 1 }],
                  'text-size': 12,
                  'text-offset': [0, 2]
              },
              paint: {
                  'text-color': '#000000'
              }
          });
      }
  );
});

  return [-122.40945776860957, 37.7653468958055]; 
}
//API
async function FoodTruckFinder() {
  try {
    let inputF = document.getElementById("radius");  
    radiusValue = parseFloat(inputF.value);
    let referenceLocation = getUserLocation(); // Lấy vị trí tham chiếu
    let apiURL = 'https://data.sfgov.org/resource/rqzj-sfat.json';
    let data = await fetch(apiURL).then(res => res.json());
    let features = data.map(truck => {
        let truckLat = parseFloat(truck.latitude);
        let truckLon = parseFloat(truck.longitude);
        let dist = calculateDistance(referenceLocation[1], referenceLocation[0], truckLat, truckLon);
        if (dist <= radiusValue) { 
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [truckLon, truckLat]
                },
                properties: {
                    applicant: truck.applicant,
                    fooditems: truck.fooditems,
                    facilitytype: truck.facilitytype,
                    address: truck.address,
                    locationdescription: truck.locationdescription,
                    status: truck.status,
                    dayshours: truck.dayshours,
                    expirationdate: truck.expirationdate,
                    approved: truck.approved,
                }
            };
        } else {
            return null;
        }
    }).filter(feature => feature); // Loại bỏ các feature null

    let geojson = {
        type: 'FeatureCollection',
        features: features
    };

    // Kiểm tra xem nguồn dữ liệu 'food-truck-source' đã tồn tại chưa
    if (map.getSource('food-truck-source')) {
        map.removeLayer('food-truck-points'); // Xóa layer liên quan trước khi xóa nguồn dữ liệu
        map.removeSource('food-truck-source'); // Xóa nguồn dữ liệu cũ
    }

    map.addSource('food-truck-source', {
        type: 'geojson',
        data: geojson
    });

    // Load biểu tượng tùy chỉnh
    if (!map.hasImage('custom-icon')) {
        map.loadImage('img/location.png', function(error, image) {
            if (error) throw error;
            map.addImage('custom-icon', image); 
        });
    }
    map.addLayer({
        id: 'food-truck-points',
        type: 'symbol', 
        source: 'food-truck-source',
        layout: {
            'icon-image': 'custom-icon', 
            'icon-size': 0.75, 
            'icon-allow-overlap': true 
        }
    });

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
FoodTruckFinder();

// Thêm một hàm để tính khoảng cách giữa hai điểm trên bản đồ
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // bán kính Trái Đất trong kilômét
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon =   (lon2 - lon1) * Math.PI / 180;
  var a =  //công thức haversine
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c; // khoảng cách giữa hai điểm
  return distance;
}
// Thêm xử lý sự kiện click vào biểu tượng
map.on('click', 'food-truck-points', function (e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var name = e.features[0].properties.applicant;
  var foodItems = e.features[0].properties.fooditems;
  var facilityType = e.features[0].properties.facilitytype;
  var Address = e.features[0].properties.address;
  var locationDescription = e.features[0].properties.locationdescription;
  var Status = e.features[0].properties.status;
  var Dayshours = e.features[0].properties.dayshours;
  var Expirationdate = e.features[0].properties.expirationdate;
  var Approved = e.features[0].properties.approved;
  // Hiển thị thông tin trong một popup
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<h3>' + name + '</h3><p><b>Facility Type: </b>' + facilityType + '</p> <p><b>Address: </b>' + Address + '</p>   <p><b>Food Items: </b>' + foodItems + '</p> <p><b>Location Description: </b>' + locationDescription + '</p > <p><b>Status: </b><i >' + Status + '</i></p>  <p><b>Days hours: </b>' + Dayshours + '</p>  <p><b>Approved: </b>' + Approved + '</p> <p><b>Expiration date: </b>' + Expirationdate + '</p>')
    .addTo(map);
});
// Thay đổi con trỏ chuột khi di chuột qua các biểu tượng
map.on('mouseenter', 'food-truck-points', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Thay đổi lại con trỏ chuột khi di chuột ra khỏi các biểu tượng
map.on('mouseleave', 'food-truck-points', function () {
  map.getCanvas().style.cursor = '';
});

function closePanel(){
  var elm = document.querySelector('.wrapper .left-panel');
  if(elm){
    elm.style.left = '-100%';
  }
  document.querySelector('.wrapper .open-panel').style.display = 'flex';
}
function openPanel(){
  var elm = document.querySelector('.wrapper .left-panel');
  if(elm){
    elm.style.left = '1rem';
  }
}




