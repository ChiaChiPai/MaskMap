# 使用 leaflet + OSM 實作口罩地圖
## 一、 leaflet 基礎使用
[leaflet網站](https://leafletjs.com/)
### 1.載入 Css 及 JavaScript
```
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" >
<!-- Make sure you put this AFTER Leaflet's CSS -->
<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"></script>
```
### 2. Html 綁定 id
```
<div id="map"><div>
```
### 3. CSS 設定寬高
```
html,body{
  width: 100%;
  height: 100%;
}
#map {
  width: 100%;
  height: 100%;
}
```

### 4. JaveScript 語法設定
- 設定地圖的中心位置及縮放比例
```
var map = L.map('map').setView([22.604799,120.2976256
], 13);
//L.map('(綁定id)').setView([經緯度],縮放比例)
```
- 設定使用的地圖，這邊使用的是OSM
```
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
```
- 在地圖上加上標籤
```
var marker = L.marker([51.5, -0.09]).addTo(mymap);
```
- 在地圖上加上範圍
```
// 多邊形
var polygon = L.polygon([
[23.956052,120.685992],
[23.976052,120.665992],
[23.936052,120.655992]
]).addTo(map);
// 圓形
var circle = L.circle([23.976052,120.685992], {
color: 'red',
fillColor: '#f03',
fillOpacity: 0.5,
radius: 500
}).addTo(map);
```
- 為範圍及標示加上註解
```
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup(); 
circle.bindPopup("I am a circle."); 
polygon.bindPopup("I am a polygon.");
```
## 二、改變標示座標的顏色
- 插入外部設計者的標籤
```
var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map);
```
## 三、 加入多個地標
```
var data = [
  {'name':'愛荔枝樂園',lat:24.0053725,lng:120.6275244},
  {'name':'黃金風鈴木',lat:24.0057594,lng:120.6290734}
]
for(let i =0;data.length>i;i++){
  L.marker([data[i].lat,data[i].lng], {icon:       
  greenIcon}).addTo(map).bindPopup('<h1>'+ data[i].name +'</p>');
}
```
## 四、 使用 MarkerClusterGroup 增加效能
為了不讓六千多筆資料一次顯示，使用 MarkerClusterGroup 將資料變成範圍性的數字，使用者有需要再去點開想看的區域。
[MarkerClusterGroup連結](https://github.com/Leaflet/Leaflet.markercluster)
### 1. 加入CDN
```
//CSS
<link href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"></link>
<link href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"></link>
//JS
<script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
```
### 2. 建立 L.MarkerClusterGroup() 的圖層
```
var data = [
{'name':'愛荔枝樂園',lat:24.0053725,lng:120.6275244},
{'name':'黃金風鈴木',lat:24.0057594,lng:120.6290734}
]
var markers = new L.MarkerClusterGroup();
for(let i =0;data.length>i;i++){
markers.addLayer(L.marker([data[i].lat,data[i].lng], {icon: greenIcon})); //將 L.mark(地標) 的圖層放到 makers 上面
}
map.addLayer(markers); //將 markers 放到 map 的圖層上
```
- 所以這邊的圖層會變成:
- - - - - - -
L.mark(地標) 上
- - - - - - -
markers 中
- - - - - - -
map 下
- - - - - - -

## 五、 使用 AJAX 串接資料
```
var xhr = new XMLHttpRequest();
//開啟一個XML的網路請求
xhr.open("get","https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
跟網址上的伺服器要資料
xhr.send();
//執行要資料的動作
xhr.onload = function(){
//當資料回傳完後，下面的函式會觸發
var data = JSON.parse(xhr.responseText).features;
//將得到的資料轉換成物件的格式
for(let i =0;data.length>i;i++){
markers.addLayer(L.marker([data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], {icon: greenIcon }).bindPopup('<h1>'+data[i].properties.name+'</h1>'+'<p>成人口罩數量'+data[i].properties.mask_adult+'</p>'));
};
map.addLayer(markers);
}
```
## 六、 使用 HTML5 Geolocation 來辨識目前位置
### 1.先判斷目前瀏覽器支不支援定位功能
```
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
alert("您的瀏覽器不支援定位系統");
}
```
### 2. 沒有 error.code 就呼叫 showPosition()
```
function showPosition(position){
let map =       
 L.map('map').setView([position.coords.latitude,position.coords.long
 itude], position.zoom || 15);
:
:
:
:
 要執行的程式碼
}
```
### 3. 有 error.code 就呼叫 showError()
```
function showError(error){
let position = { //做一筆資料讓讀取不到目前位置時使用
  coords: {
    latitude: '23.8523405',
    longitude: '120.9009427',
  },
  zoom: 7, //讀取不到位置時縮放的範圍
}
switch(error.code) {
  case error.PERMISSION_DENIED:
    alert("讀取不到您目前的位置");
    showPosition(position);
    break;
  case error.POSITION_UNAVAILABLE:
    alert("讀取不到您目前的位置");
    showPosition(position);
    break;
  case error.TIMEOUT:
    alert("讀取位置逾時");
    showPosition(position);
    break;
  case error.UNKNOWN_ERROR:
    alert("Error");
    showPosition(position);
    break;
  }
}
```
## 七、按下回到目前位置按鈕
- 這段程式要放在 showPosition 的函式中，在執行 navigator.geolocation 後，目前位置的座標會存在這個函式中。
在使用一次 setView 找回中心點。
我有看到其他人是使用 map.panTo()，但是當我加上 map.setZoom時，發現他只能一次執行一個動作，他都得第一次把地圖放大後，第二次點才能去回到目前位置。
```
let goBackPosition = document.querySelector('.js-goBackPosition');
goBackPosition.addEventListener('click',function(){
  map.setView([position.coords.latitude,position.coords.longitude],   
  position.zoom || 17);
});
```

## 八、日期往後推七天
由於「this」即是指定的時間物件，因此就使用 this 取得「日」再加 7 天，最後將這個更新後的日期設定給這個時間物件即可。
```
Date.prototype.addDays = function(days) {
this.setDate(this.getDate() + days);
return this;
}
let nextDay = dt.addDays(7);
```
