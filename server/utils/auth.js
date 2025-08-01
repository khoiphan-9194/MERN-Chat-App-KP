const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const secret = "mysecretsshhhhh";
const expiration = "3h";

module.exports = {
  AuthenticationError: new GraphQLError("Could not authenticate user.", {
    extensions: { code: "UNAUTHENTICATED" },
  }),

  // This middleware will be used to authenticate the user based on the JWT token
  // It will extract the token from the request headers, query parameters, or body
  // and verify it using the secret key
  // If the token is valid, it will return the user data and the socket.io instance
  // If the token is invalid or not present, it will return null for the user
  // and the socket.io instance will still be available for real-time features
  authMiddleware: function ({ req, io }) {
    let token = req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    if (!token) {
      return { user: null, io };
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { user: data, io };
    } catch {
      console.log("❌ Invalid token");
      return { user: null, io };
    }
  },

  signToken: function ({ username, user_email, _id, profile_picture }) {
    const payload = { username, user_email, _id, profile_picture };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
