const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');



const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, "Must use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },

    profile_picture: {
      type: String,
      default: "/assets/default-avatar.jpg", // path to the default profile picture
      // default profile picture if none is provided
    },
    isOnline: {
      type: Boolean,
      default: false, // default to false, user is not online
    },
  },

  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// hash user password
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

 // this middleware is used to hash the password before updating the owner document
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const saltRounds = 10;
    update.password = await bcrypt.hash(update.password, saltRounds);
  }
  next();
});


// custom method to compare and validate password for logging in
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// virtual for getting the number of chats a user is part of
userSchema.virtual('chatCount').get(function () {
  return this.chats ? this.chats.length : 0;
});


const User = model('User', userSchema);

module.exports = User;
