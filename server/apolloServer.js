const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const socketIO = require("socket.io");
const http = require("http");
const socketController = require("./utils/socketController");

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Create HTTP server for both Express and Socket.IO
const httpServer = http.createServer(app);

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean
); // Boolean is used to filter out any falsy values, ensuring that only valid URLs are included

const io = socketIO(httpServer, {
  pingTimeout: 60000,// this means that if the server does not receive a ping from the client within 60 seconds, it will disconnect the client
  pingInterval: 25000, // this means that the server will send a ping to the client every 25 seconds
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

socketController(io);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return authMiddleware({ req, res, io });
      },
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  db.once("open", () => {
    httpServer.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();

// ✅ Correct GraphQL middleware with both auth and io in context
  // This middleware will handle GraphQL requests at the /graphql endpoint
  // and provide the context with user authentication and socket.io instance
  // so that resolvers can access the io instance for real-time features
  // This is the correct way to set up the Apollo Server with Express
  // and to ensure that the context is properly passed to the resolvers.
  // app.use(
  //   "/graphql",
  //   expressMiddleware(server, {
  //     context: async ({ req, res }) => {
  //       // ✅ Get user from auth middleware
  //       const authContext = await authMiddleware({ req, res });

  //       // ✅ Return both user and io in context
  //       return {
  //         ...authContext, // Example: { user }
  //         io, // ✅ Now resolvers can access io
  //       };
  //     },
  //   })
  // );
