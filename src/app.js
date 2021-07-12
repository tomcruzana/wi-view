const path = require("path");
const express = require("express");
const childProcess = require('child_process');
const port = process.env.PORT || 9000;

const app = express();

//paths for express config
const publicDirPath = path.join(__dirname, "../public");

//use static files
app.use(express.static(publicDirPath));


//global regex pattern variables
let ssidList = [];
const patterns = {
    ssidName: /: [\w-]+$/gm
};

//Fetch WiFi SSIDs onLoad
childProcess.exec(`netsh wlan show profiles`, async function (err, stdout, stderr) { 

        if (err){
            console.error(err + stderr);
            return;
        }
    ssidList = await stdout.match(patterns.ssidName).map(e => `<p class="wifi-info-ssid"><i class="fa fa-circle fa-1x"></i> ${e.substr(2)}</p><span class="tooltiptext">Click to copy!</span>`);//fetch the ssid names and split into readable chunks;
    //process.exit(0);// exit process once it is opened
    //FORMAT: <p class="wifi-info-ssid"><i class="fa fa-circle fa-1x"></i> SSID NAME</p><span class="tooltiptext">Click to copy!</span>
});

//Fetch WiFi Information with password
async function fetchWifiInfo(ssid, res){
    childProcess.exec(`netsh wlan show profiles ${ssid} key=clear`, function (err, stdout, stderr) { 

            (err) ?
                res.status(400).send("Error! SSID information not found. Please try again.")
            :
                res.send(stdout);
        //process.exit(0);// exit process once it is opened
    });
}

//routes
app.get("/", async (req, res)=>{ //homepage
    res.render("index");
});

app.get("/fetch-wifi-info", async (req, res)=>{ //API
    //console.log(req.query.ssid); enable this for sanity check
    try{
        (!req.query.ssid) ? res.status(400).send("Error! you must provide an SSID") : await fetchWifiInfo(req.query.ssid, res);
    }
    catch(e){
        console.log(e)
    }
});

app.get("/fetch-wifi-ssid", async (req, res)=>{ //API
    //console.log(req.query.ssid); enable this for sanity check
    try{
        (!ssidList.length) ? res.status(400).send("Error! WiFi SSID not found") : await res.send({SSID : ssidList});
    }
    catch(e){
        console.log(e)
    }
});

app.get("*", (req, res)=>{ //404
    res.status(400).send("404 File Not Found");
});

//local server
app.listen(port, ()=>{
    console.log("server running on port " + port + ". don't close this window!");
});

//next goal: make output user-friendly