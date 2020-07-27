const ssidList = document.querySelector(".list");
const search = document.querySelector("input");
const loader = document.querySelector(".loader");
const loaderNotification = document.querySelector(".loader-notification");
const fetchBtn = document.querySelector(".fetch-btn"); 
const wifiInfo = document.querySelector(".wifi-info-pass");
const modalBox = document.querySelector("#openmodal");
const closeModalBox = document.querySelector(".close");
const advancedModalBtn = document.querySelector(".advanced-info-btn");
const copyModalBtn = document.querySelector(".copy-btn");
let dataLog = null;

//advanced modal btn
advancedModalBtn.addEventListener("click", (e)=>{
    alert(dataLog);
});

//close modal box
closeModalBox.addEventListener("click", (e)=>{
    modalBox.style.display = "none";
});

//copy ssid name to input box through click
ssidList.addEventListener("click", (e)=>{
    search.value = "";
    search.focus();
    (e.target.tagName === "P") ?
    search.value = e.target.textContent.toString() : 
    -1;
});

//string formatter
const formatString = (data) => { //convert to regex. This is still temporary since it's prolematic/unmaintainable
    let convertDataToArr = data.split("\r\n");
    return {
        ssidname : convertDataToArr[20],
        password : (convertDataToArr[32]) && convertDataToArr[32].replace("Key Content", "Password") || "null", //if password exists, replace the word 'key content' to password to make it obvious for the user
        authentication: convertDataToArr[27],
        congested: convertDataToArr[37]
    };
    
    /* reference
        ssidname, password,  authentication, congested
        20, 32, 27, 37
    */
};

//fetch wifi info
fetchBtn.addEventListener("click", async (e)=>{
    e.preventDefault();

    await fetch(`/fetch-wifi-info?ssid=${search.value}`)
    .then(response => response.text())
    .then(data => {
        if (data.includes("Error")) { //if data has error
            wifiInfo.innerHTML = data; 
            modalBox.style.display = "block";
            return
        }

        //If data has substantial wifi info
        const {ssidname, password, authentication, congested} = formatString(data); //destructure obj
        wifiInfo.innerHTML = `<li>${ssidname}</li><li>${password}</li><li>${authentication}</li><li>${congested}</li>`; //populate the list element with the wifi info data 
        modalBox.style.display = "block";
        dataLog = data;
    })
    .catch(err => alert(err))
});


//fetch wifi ssid 
window.addEventListener('load', async () => {
    await fetch(`/fetch-wifi-ssid`)
        .then(raw => raw.json())
        .then(data => {
            data.SSID.forEach(e => ssidList.innerHTML += e);
            setTimeout(()=>{ //lil bit of loading effect. Once data is fetch show it after an X num of seconds
                loader.style.display = "none";
                loaderNotification.style.display = "none";
                ssidList.style.display = "block";
            },2000);
        })
        .catch(err => alert(err))
});
