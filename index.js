const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const url = require("url");

require("dotenv").config();
const {Telegraf, Markup} = require("telegraf");
const fs = require("fs");
const {sequelize, User} = require("./model");

sequelize.sync({force:false}).then(()=>{console.log("database synchronized!!")}).catch((err)=>{console.log("some error occured during database synchronization:\n",err)});


const bot = new Telegraf(process.env.BOT_TOKEN);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});



bot.start(async(ctx)=>{

    const telegram_id = ctx.from.id;
    const telegram_username = ctx.from.username || 'user';

    let user = await User.findOne({where:{telegram_id:telegram_id}});

    if(!user){
        await ctx.reply(`Hello ${ctx.from.username}, welcome to Ton Mango bot`);
        await ctx.reply(`Now let's get your account set up \u2764`);
    
        // ctx.session.messageIds.push(one.message_id);
        // ctx.session.messageIds.push(two.message_id);

        
            //notes.push(ctx.message.text);
            await ctx.reply("\nEnable token withdrawals by clicking and joining the telegram community below\n\n**Please note that accounts not in the community will not be funded**", Markup.inlineKeyboard([
                [
                  Markup.button.url("Join community", "t.me/Ton_mango_page")  
                ],
                [
                  Markup.button.callback("Proceed to start bot","create")
                ]
                
            ]));
            // ctx.session.state = "awaiting_name";
            // await ctx.reply("Type the word TONAGER in the text field below after joining the community")
            
            // if(ctx.session.state == "awaiting_name"){
            //     ctx.session.name = ctx.message.text == "TONAGER"? ctx.message.text : null;
            //     ctx.session.state = null;

            //     if(ctx.session.name == "TONAGER"){

                    

            //     }

                
            // }


   
    }else if(user){

        await ctx.replyWithPhoto({source: fs.createReadStream('./tm.jpg')}).then(async()=>{
            await ctx.reply(`Hey, ${ctx.from.username}!, Welcome to Ton Mango\u2764 \n\nKeep tapping to see your balance grow.\n\nTon Mango is a Decentralized Application which will be listed on Ton blockchain.\n\nGot friends, relatives, co-workers?\nBring them all into the game.\nMore Mates - more coins`,Markup.inlineKeyboard([
                [
                    Markup.button.webApp("Mine coin",`${process.env.FRONT_END}?telegram_username=${ctx.from.username}&telegram_id=${parseInt(ctx.from.id,10)}&user_id=${parseInt(ctx.from.id,10)}`),
                    
                ],
                [
                    Markup.button.url("Join community", "t.me/Ton_mango_page")
                    
                ],
                [
                    Markup.button.callback("Help", "help")
                ]
                
            ]))
        }).catch(()=>{console.log("an error occured")});
    }

    






    
});

bot.action("create", async(ctx)=>{
    const telegram_id = ctx.from.id;
    const telegram_username = ctx.from.username || 'user';
    await ctx.answerCbQuery();
    

    //ctx.session.messageIds.push(three.message_id);

    let user = await User.findOne({where:{telegram_id:telegram_id}});
    
    !user? await ctx.reply(`\nType in below the referral id of the awesome Ton Mango user that referred you \u2764 \u2764 \n\nDon't have a referal id? Not to worry, just type "skip" or any keyword of your choosing.`): null;
    
    !user? bot.on('text', async(ctx)=>{

        // for(const messageId of ctx.session.messageIds){
        //     try{
        //         await ctx.deleteMessage(messageId);
        //     }catch(err){
        //         console.log(`failed to delete message ${messageId}`)
        //     }
        // }
        // ctx.session.messageIds = [];

        let id = parseInt(ctx.message.text,10)? parseInt(ctx.message.text,10): "none";

        let user = await User.findOne({where:{telegram_id:telegram_id}});

        if(id == parseInt(ctx.message.text,10) && !user){
            try{
                let ref_user = await User.findOne({where:{telegram_id: ctx.message.text}});
                let referred = parseInt(ref_user.referred,10) + 1;
                let ref_bal = parseInt(ref_user.balance, 10) + 1500; 
                await ctx.reply("\n\nReferrer's balance credited\u{1F57A}\n\n")
                await User.update({referred: referred, balance: ref_bal},{where:{telegram_id: ref_user.telegram_id}});
            }catch(err){
                console.log("Couldn't pay referrer:  ",ctx.message.text);
            }  

            try{

                const [user,created] = await User.findOrCreate({
                    where: {telegram_id:telegram_id},
                    defaults: {telegram_username: telegram_username}
                });
                if(created){
                   await ctx.reply(`Welcome new user @${telegram_username}, your account has been created successfully.`);
                   await ctx.reply("Please click on /start to begin");
                }

            }catch(err){
                ctx.reply(`Sorry ${telegram_username}, could not create an account.\nPlease Retry...`);
            }
        }else{
            try{
                const [user,created] = await User.findOrCreate({
                    where: {telegram_id:telegram_id},
                    defaults: {telegram_username: telegram_username}
                });
                if(created){
                   await ctx.reply(`Welcome new user ${telegram_username}, your account has been created.`);
                   await ctx.reply("Please click on /start to begin");
                }
            }catch(err){
                ctx.reply(`Sorry ${telegram_username}, could not create an account.\nPlease Retry...`);
            }
        }
    }) : ctx.reply("Your account has already been created")

});


bot.action("help",(ctx)=>{

    ctx.answerCbQuery();
    ctx.reply(`Hey, ${ctx.from.username}!,Welcome to Ton Mango\u2764 \n\nTap the Ton Mango icon to see your balance grow.\n\nTon Mango is a Decentralized Application which will be listed on Ton blockchain.\n\nGot friends, relatives, co-workers?\nBring them all into the game.\nMore Mates - more coins`);
});

bot.launch();


console.log("Telegram bot is running");


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

