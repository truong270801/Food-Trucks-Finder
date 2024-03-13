mapboxgl.accessToken = 'pk.eyJ1IjoiYmV0YXBjaG9pMTBrIiwiYSI6ImNrY2ZuaWEwNjA2ZW0yeWw4bG9yNnUyYm0ifQ.bFCQ-5yq6cSsrhugfxO2_Q';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-122.4309147,37.7331262], // starting position [lng, lat]
    zoom: 5, // starting zoom
    hash: 'map'
});



async function FoodTruckFinder() {
  try {
    let apiURL = 'https://data.sfgov.org/resource/rqzj-sfat.json';
    let data = await fetch(apiURL).then(res => res.json());
    let features = data.map(truck => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(truck.longitude), parseFloat(truck.latitude)]
        },
        properties: {
          name: truck.applicant,
          fooditems: truck.fooditems
        }
      };
    });

    let geojson = {
      type: 'FeatureCollection',
      features: features
    };

    map.addSource('food-truck-source', {
      type: 'geojson',
      data: geojson
    });

    // Load biểu tượng tùy chỉnh
    map.loadImage('img/location.png', function(error, image) {
      if (error) throw error;
      map.addImage('custom-icon', image); // Thêm biểu tượng tùy chỉnh vào bản đồ
    });

    map.addLayer({
      id: 'food-truck-points',
      type: 'symbol', // Thay đổi loại layer từ 'circle' sang 'symbol'
      source: 'food-truck-source',
      layout: {
        'icon-image': 'custom-icon', // Sử dụng biểu tượng tùy chỉnh
        'icon-size': 0.75, // Kích thước của biểu tượng
        'icon-allow-overlap': true // Cho phép biểu tượng chồng lên nhau
      }
    });
    map.addLayer({
      id: 'food-truck-labels',
      type: 'symbol',
      source: 'food-truck-source',
      
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 2],
      },
      paint: {
        'text-color': '#000000'
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

FoodTruckFinder();

// Thêm xử lý sự kiện click vào biểu tượng xe ăn
map.on('click', 'food-truck-points', function (e) {
  var coordinates = e.features[0].geometry.coordinates.slice();
  var name = e.features[0].properties.name;
  var foodItems = e.features[0].properties.fooditems;

  // Hiển thị thông tin trong một popup
  new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML('<h3>' + name + '</h3><p>' + foodItems + '</p>')
    .addTo(map);
});

// Thay đổi con trỏ chuột khi di chuột qua các biểu tượng xe ăn
map.on('mouseenter', 'food-truck-points', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Thay đổi lại con trỏ chuột khi di chuột ra khỏi các biểu tượng xe ăn
map.on('mouseleave', 'food-truck-points', function () {
  map.getCanvas().style.cursor = '';
});
