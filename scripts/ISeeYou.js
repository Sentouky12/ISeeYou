const { ethers } = require("hardhat"); const axios = require("axios"); 
const API_KEY = "INSERT ETHERSCAN API KEY"; 
const CONTRACT_ADDRESS ="INSERT TOKEN CONTRACT ADDRESS"; 

const RPC='INSERT RPC ENDPOINT';
const routeMap=new Map();
const provider = new ethers.providers.JsonRpcProvider(RPC); 
async function fetchTransferEvents(routes,i,minAmount) { 
  var aurl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${API_KEY}`;

  var res = await axios.get(aurl);
  var abi = JSON.parse(res.data.result); 

    
    
   
if(routes.length>0){
    for (route of routes){
    
      var nextAddress=ethers.utils.hexZeroPad(route,32);
      
    
   
 
var fromBlock=0;
var toBlock=await provider.getBlockNumber();
 var topic = ethers.utils.id("Transfer(address,address,uint256)"); 
 var  url = `https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${CONTRACT_ADDRESS}&topic0=${topic}&topic1=${nextAddress}&apikey=${API_KEY}`;
var response = await axios.get(url, { headers: { "Content-Type": "application/json", }, }); 
var logs=response.data.result;


var key;
var AddrStore=[];
var vroutes=[];
for (const log of logs) {
    
    //const abi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
    const iface = new ethers.utils.Interface(abi);

    const event = iface.parseLog(log);
    const { from, to, value } = event.args;
    if (parseInt(value.toString()) >= minAmount){
    console.log(`Transfer event received!`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Value: ${value.toString()}`);
   key=from;
   
   nextAddress=to;

    AddrStore.push(to,value);
    vroutes.push(to);

    routeMap.set(key,AddrStore);
  }
}

}
}


 routes=vroutes;    
// console.log("Recursive");
     routeMap.set(key,AddrStore);
     //console.log(routeMap);
while(i>0){
  i--;
    await fetchTransferEvents(routes, i, minAmount);
}
    

}



async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let routes, i, minAmount;

  // Prompt user for address
  await new Promise((resolve) => {
    rl.question("Please enter the address you'd like to check: ", (answer) => {
      routes = [answer];
      resolve();
    });
  });

  // Prompt user for recursion count
  await new Promise((resolve) => {
    rl.question("Please enter the recursion count: ", (answer) => {
      i = parseInt(answer);
      resolve();
    });
  });

  // Prompt user for minimum transfer amount
  await new Promise((resolve) => {
    rl.question("Please enter the minimum transfer amount: ", (answer) => {
      minAmount = parseInt(answer);
      resolve();
    });
  });

  rl.close();
  fetchTransferEvents(routes, i, minAmount);
}
//npx hardhat run  scripts/ISeeYou.js
//node scripts/ISeeYou.js
main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});


