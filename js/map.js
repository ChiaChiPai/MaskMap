if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
} else {
    alert("您的瀏覽器不支援定位系統");
    let position = {
        coords: {
            latitude: '23.8523405',
            longitude: '120.9009427',
        },
        zoom: 7,
    }
    showPosition(position);
}

function showPosition(position) {
    let map = L.map('map').setView([position.coords.latitude, position.coords.longitude], position.zoom || 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //創建icon圖標
    let greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let orangeIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    let greyIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blueMarker = L.icon.pulse({ iconSize: [20, 20], color: '#2e72f0', fillColor: '#2e72f0' });

    //設定所在位置的icon
    let selfPos = L.marker([position.coords.latitude, position.coords.longitude], { icon: blueMarker }).bindPopup('目前位置');
    map.addLayer(selfPos);

    //使用 MarkerClusterGroup 將各個地點群組化
    var markers = new L.MarkerClusterGroup().addTo(map);

    //取得 AJAX 資料
    let data = [];
    let xhr = new XMLHttpRequest();
    xhr.open("get", "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json");
    xhr.send();
    xhr.onload = function () {
        data = JSON.parse(xhr.responseText).features;

        for (let i = 0; data.length > i; i++) {
            let pin = "";
            if (data[i].properties.mask_adult == 0 && data[i].properties.mask_child == 0) {
                pin = greyIcon;
            } else {
                pin = orangeIcon;
            } 
            markers.addLayer(L.marker([data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]], { icon: pin }).bindPopup(`
                <ul class="information">
                    <li class="text-dark pharmacy">${data[i].properties.name}</li>
                    <li class="text-dark address"><a href="https://www.google.com.tw/maps/place/${data[i].properties.address}"  target="_blank">${data[i].properties.address} <img src="img/規劃路徑.png" alt=""></a></li>
                    <li class="text-light phone">${data[i].properties.phone}</li>
                    <li class="text-light openTime">${data[i].properties.note || "該店家沒供營業時間"}</li>
                    <li class="mt-2">
                        <div class="row maskNum no-gutters text-white">
                            <div class="col-6 bg-primary py-1" style="padding: 0 24px">
                                <p>成人口罩數量</p>
                                <p class="d-flex align-items-end">
                                    <span style="font-size:21px; line-height:25px"">${data[i].properties.mask_adult}</span> 
                                    <span class="ml-auto">/200</span>
                                </p>
                            </div>
                            <div class="col-6 bg-warning py-1" style="padding: 0 24px">
                                <p>兒童口罩數量</p>
                                <p class="d-flex align-items-end">
                                    <span style="font-size:21px; line-height:25px">${data[i].properties.mask_child}</span>
                                    <span class="ml-auto">/50</span>
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>`))
        };
        map.addLayer(markers);


        //搜尋列
        let maskInfoList = document.querySelector("#js-maskInfoList");
        let searchBlock = document.querySelector("#js-searchBlock");
        let maskTypeOpt = document.querySelector("#js-maskTypeOpt");
        let searchBtn = document.querySelector("#js-searchBtn");
        let pharmacyNumText = document.querySelector("#js-pharmacyNum");

        let searchAddress = function (e) {
            if (e.keyCode == 13 || e.type == 'click') {//同時可以按enter和clickBTN的方法
                let searchList = [];
                let pharmacyStore = [];
                if (searchBlock.value == '') {
                    pharmacyNumText.textContent = `請輸入你要尋找的區域`;
                    return;
                }
                for (let i = 0; i < data.length; i++) {
                    if (data[i].properties.address.indexOf(searchBlock.value.trim()) != -1) { //模糊搜尋
                        if (data[i].properties.mask_child != 0 || data[i].properties.mask_adult != 0) {
                            if (maskTypeOpt.value == "全部") {
                                pharmacyStore.push(data[i]);
                                let pharmacyNum = pharmacyStore.length;
                                let str = `
                            <ul class="information mt-3 js-info" data-lat="${data[i].geometry.coordinates[1]}" data-lng="${data[i].geometry.coordinates[0]}" style="cursor:pointer">
                                <li class="text-dark pharmacy">${data[i].properties.name}</li>
                                <li class="text-dark address">${data[i].properties.address}</li>
                                <li class="text-light phone">${data[i].properties.phone}</li>
                                <li class="text-light openTime"><i class="far fa-clock"></i> ${data[i].properties.note || "該店家沒供營業時間"}</li>
                                <li class="mt-3">
                                    <div class="row maskNum no-gutters text-white">
                                        <div class="col-6 bg-primary px-2 py-2 d-flex justify-content-between">
                                            <p>成人口罩</p>
                                            <p>${data[i].properties.mask_adult} 個</p>
                                        </div>
                                        <div class="col-6 bg-warning px-2 py-2 d-flex justify-content-between">
                                            <p>兒童口罩</p>
                                            <p>${data[i].properties.mask_child} 個</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            `;
                                searchList += str;
                                pharmacyNumText.textContent = `共有${pharmacyNum}處可購買口罩`;
                            }

                        }
                        if (data[i].properties.mask_child != 0 && maskTypeOpt.value == "兒童口罩") {
                            pharmacyStore.push(data[i]);
                            let pharmacyNum = pharmacyStore.length;
                            let str = `
                        <ul class="information mt-3 js-info" data-lat="${data[i].geometry.coordinates[1]}" data-lng="${data[i].geometry.coordinates[0]}" style="cursor:pointer">
                            <li class="text-dark pharmacy">${data[i].properties.name}</li>
                            <li class="text-dark address">${data[i].properties.address}</li>
                            <li class="text-light phone">${data[i].properties.phone}</li>
                            <li class="text-light openTime"><i class="far fa-clock"></i> ${data[i].properties.note || "該店家沒供營業時間"}</li>
                            <li class="mt-3">
                                <div class="row maskNum no-gutters text-white">
                                    <div class="col-12 bg-warning px-2 py-2 d-flex justify-content-between">
                                        <p>兒童口罩</p>
                                        <p>${data[i].properties.mask_child} 個</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        `;
                            searchList += str;
                            pharmacyNumText.textContent = `共有${pharmacyNum}處可購買兒童口罩`;
                        }
                        if (data[i].properties.mask_adult != 0 && maskTypeOpt.value == "成人口罩") {
                            pharmacyStore.push(data[i]);
                            let pharmacyNum = pharmacyStore.length;
                            let str = `
                        <ul class="information mt-3 js-info" data-lat="${data[i].geometry.coordinates[1]}" data-lng="${data[i].geometry.coordinates[0]}" style="cursor:pointer">
                            <li class="text-dark pharmacy">${data[i].properties.name}</li>
                            <li class="text-dark address">${data[i].properties.address}</li>
                            <li class="text-light phone">${data[i].properties.phone}</li>
                            <li class="text-light openTime"><i class="far fa-clock"></i> ${data[i].properties.note || "該店家沒供營業時間"}</li>
                            <li class="mt-3">
                                <div class="row maskNum no-gutters text-white">
                                    <div class="col-12 bg-primary px-2 py-2 d-flex justify-content-between">
                                        <p>成人口罩</p>
                                        <p>${data[i].properties.mask_adult} 個</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                        `;
                            searchList += str;
                            pharmacyNumText.textContent = `共有${pharmacyNum}處可購買成人口罩`;
                        }

                    }
                }

                maskInfoList.innerHTML = searchList;
                //使地圖對應到搜尋相對應的位置
                map.setView([pharmacyStore[0].geometry.coordinates[1], pharmacyStore[0].geometry.coordinates[0]], 15);

                if (searchList.length == 0) {
                    pharmacyNumText.textContent = `您搜尋的關鍵字目前找不到口罩`;
                }

                //點選藥局改變地圖位置pharmacyNumText
                let infoPointer = document.querySelectorAll(".js-info");

                for (let i = 0; i < pharmacyStore.length; i++) {
                    infoPointer[i].addEventListener('click', function (e) {
                        Lat = e.currentTarget.dataset.lat;
                        Lng = e.currentTarget.dataset.lng;
                        map.setView([Lat, Lng], 20);
                    });
                }
            }
        }

        searchBtn.addEventListener('click', searchAddress);
        searchBlock.addEventListener('keydown', searchAddress);
        //回到目前位置
        let goBackPosition = document.querySelector('.js-goBackPosition');
        goBackPosition.addEventListener('click', function () {
            map.setView([position.coords.latitude, position.coords.longitude], 17);
        });
    }
}

//error code
function showError(error) {
    let position = {
        coords: {
            latitude: '23.8523405',
            longitude: '120.9009427',
        },
        zoom: 7,
    }
    switch (error.code) {
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





//日期
let year = document.querySelector('.js-year');
let month = document.querySelector('.js-month');
let date = document.querySelector('.js-date');
let day = document.querySelector('.js-day');
let nextMonth = document.querySelector('.js-nextMonth');
let nextDate = document.querySelector('.js-nextDate');
let nextDay = document.querySelector('.js-nextDay');

var dt = new Date();

year.textContent = ' ' + dt.getFullYear();
month.textContent = dt.getMonth() + 1;
date.textContent = dt.getDate();

var days = new Array(7);
days[0] = "七";
days[1] = "一";
days[2] = "二";
days[3] = "三";
days[4] = "四";
days[5] = "五";
days[6] = "六";

day.textContent = days[dt.getDay()];

Date.prototype.addDays = function (days) { //往後加七天，第八天才能買
    this.setDate(this.getDate() + days);
    return this;
}

let nextBuy = dt.addDays(8);
nextMonth.textContent = nextBuy.getMonth() + 1;
nextDate.textContent = nextBuy.getDate();
nextDay.textContent = days[nextBuy.getDay()];

//設定可以買口罩的時間
let idCardSet = document.querySelector('#js-idCardSet');
let popBox = document.querySelector('#js-popBox');
let idNumBlock = document.querySelector('#js-idNumBlock');
let idSaveBtn = document.querySelector('#js-idSaveBtn');
let buyNews = document.querySelector('#js-buyNews');
let note = document.querySelector('#js-note');


//公告今天誰可以買口罩
let today = day.textContent;
if (today == '一' || today == '三' || today == '五') {
    buyNews.textContent = `今日(${today})身分證尾碼為奇數(1.3.5.7.9)可購買口罩`
} else if (today == '二' || today == '四' || today == '六') {
    buyNews.textContent = `今日(${today})身分證尾碼為奇數(0.2.4.6.8)可購買口罩`
} else if (today == '日') {
    buyNews.textContent = `今天大家都可以買口罩`;
}

//設定尾碼
idCardSet.addEventListener('click', function () {
    popBox.classList.remove('d-none');
});

idSaveBtn.addEventListener('click', saveID);

function saveID() {
    switch (true) {
        case idNumBlock.value < 0:
            note.textContent = '尾碼沒有負的吧';
            break;
        case idNumBlock.value.length != 1:
            note.textContent = '請輸入尾碼一碼就好喔';
            break;
        case idNumBlock.value % 2 == 0:
            if (today == '一' || today == '三' || today == '五') {
                idCardSet.textContent = `您今日不行購買口罩喔！(尾數${idNumBlock.value})`;
            } else if (today == '二' || today == '四' || today == '六') {
                idCardSet.textContent = `您今日可以購買口罩喔！(尾數${idNumBlock.value})`;
            } else if (today == '日') {
                idCardSet.textContent = `今天禮拜天，大家搶口罩阿`;
            }
            popBox.classList.add('d-none');
            break;
        case idNumBlock.value % 2 != 0:
            if (today == '一' || today == '三' || today == '五') {
                idCardSet.textContent = `您今日可以購買口罩喔！(尾數${idNumBlock.value})`;
            } else if (today == '二' || today == '四' || today == '六') {
                idCardSet.textContent = `您今日不行購買口罩喔！(尾數${idNumBlock.value})`;
            } else if (today == '日') {
                idCardSet.textContent = `今天禮拜天，大家搶口罩阿`;
            }
            popBox.classList.add('d-none');
            break;
    }
}


