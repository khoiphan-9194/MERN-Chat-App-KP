const db = require('../config/connection');
const { User, Chat, Message } = require('../models');
const cleanDB = require('./cleanDB');


const userData = require('./userSeeds.json');
const messageData = require('./messageSeeds.json');
const chatData = require('./chatSeeds.json');


db.once('open', async () => {
  // clean database
  await cleanDB('User', 'users');
  await cleanDB('Chat', 'chats');
  await cleanDB('Message', 'messages');

  // create users
  const users = await User.insertMany(userData);
  console.log('users seeded!');

  // create chats
  const chats = await Chat.insertMany(chatData);
  console.log('chats seeded!');

  // create messages
  const messages = await Message.insertMany(messageData);
  console.log('messages seeded!');


  for(const chat of chats) {
    const randomUsers = [];
    while (randomUsers.length < 2) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (!randomUsers.includes(randomUser._id)) {
        randomUsers.push(randomUser._id);
      }
      
    }
    chat.users = randomUsers;
    chat.groupAdmin = randomUsers[0]; // assign the first user as group admin

   
   
    await chat.save();
  }

  console.log('chats updated with users!');

  // associate messages with chats and users
  for (const message of messages) {
    const randomChat = chats[Math.floor(Math.random() * chats.length)];
    message.chat = randomChat._id;
    const getChatData = await Chat.findById(randomChat._id).populate('users'); // populate the users in the chat
    console.log(getChatData);
    const randomSender = getChatData.users[Math.floor(Math.random() * getChatData.users.length)];
    
    message.sender = randomSender._id;
    // lastMessage is the latest message in the chat
    getChatData.latestMessage = message._id; // update the latest message in the chat
    await getChatData.save(); // save the chat with the latest message
    await message.save();


  }


  


  

  console.log('all done!');
  process.exit(0);
});













  // // this one will randomly assign coffeHouse model to a randomly Owner
  // for (newOwner of owners)  
  //   {

  //   let tempCoffeeArr = [];
    
  //   const randomCoffeeHouse = coffeehouses[Math.floor(Math.random() * coffeehouses.length)]; // get random coffeehouse
  //    // console.log(randomCoffeeHouse._id);
  //   if(!tempCoffeeArr.includes(randomCoffeeHouse._id)) // means if the random coffeehouse is not already assigned to the owner
  //   {
  //     newOwner.coffeehouses.push(randomCoffeeHouse._id); // push the random coffeehouse to the owner
  //     tempCoffeeArr.push(randomCoffeeHouse._id);
  //     randomCoffeeHouse.coffeeOwnerId = newOwner._id; // push the random owner to the coffeehouse
     
  //   }
    
  //   await newOwner.save();

  // Create a copy of coffeehouses array to track unassigned coffeehouses
  /*
  randomly assign each owner has a diffent array length of coffeehouse but each owner should not has the same coffeehouse with the others. In the other words once a coffeehouse assigned to the owner, it cannot be added to other owners
  */