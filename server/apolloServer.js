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

// Create HTTP server first, for both Express and Socket.IO
const httpServer = http.createServer(app);

const io = socketIO(httpServer, {

  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
  cors: // cors is a middleware that allows cross-origin requests
    // cross-origin is when a request is made from a different origin than the server
    // for example, if the server is running on localhost:3001 and the client is running on localhost:3000,
    // what happens is that the client is trying to access a resource like http://localhost:3001/graphql to
    // send a message, but the server is not allowing it because the origin is different
    // this is where we allow the client to access the server
  
  {
    origin: "localhost:3000" || process.env.CLIENT_URL, // means that the server will allow requests from localhost:3000 or the CLIENT_URL environment variable,
    methods: ["GET", "POST"]
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
      context: authMiddleware,
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
