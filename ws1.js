const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const url = require("url");

require("dotenv").config();



const {sequelize, User} = require("./model");

sequelize.sync({force:false}).then(()=>{console.log("database synchronized!!")}).catch((err)=>{console.log("some error occured during database synchronization:\n",err)});



const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});




wss.on("connection", async(ws, request)=>{
    console.log("Web socket handshake has been made!!");

    const queryParams = new URLSearchParams(url.parse(request.url).search);
    const id = parseInt(queryParams.get('id'),10);

    const referrer_id =  parseInt(queryParams.get('referrer_id'),10);
    const user_id =  parseInt(queryParams.get('user_id'),10);

   // ws.send(`Total saved balance:  ${id.toString()}..  ${referrer_id}.. ${user_id}`);
    
    let user = await User.findOne({where:{telegram_id:user_id}});
    let bal = user.balance;
    ws.send(bal?? "0");

    let tot_bal = parseInt(user.balance,10);

    ws.on("message", async(message)=>{
        // if(message.data == "tap"){
           tot_bal += 10;
           console.log(tot_bal);
           ws.send(tot_bal); 
        // }else if(message.data == "save"){
        //     ws.send("1000");
        // }
        
    });
    
    ws.on("close", async()=>{
        await User.update({balance:tot_bal},{where:{telegram_id:user_id}});
        console.log("balance updated");
    });

});

server.listen(process.env.PORT1, process.env.HOST1, ()=>{
    console.table({"http":`http://${process.env.HOST1}:${process.env.PORT1}`,"websocket":`ws://${process.env.HOST1}:${process.env.PORT1}`})
});

