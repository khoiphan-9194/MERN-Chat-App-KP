const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const socketIO = require("socket.io");
const http = require("http");
const routes = require("./routes");
const socketController = require("./utils/socketController");
const cors = require("cors"); // this is for cross-origin resource sharing, what it does is it allows you to specify which domains are allowed to access your resources, and what methods and headers are permitted.
// cross-origin resource sharing (CORS) is a mechanism that helps you manage how your web application interacts with resources from different origins. It allows you to specify which domains are allowed to access your resources, and what methods and headers are permitted.
// and it is a security feature implemented by web browsers to prevent malicious websites from making requests to your server on behalf of the user.

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Create HTTP server for both Express and Socket.IO
const httpServer = http.createServer(app);

const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean
); // Boolean is used to filter out any falsy values, ensuring that only valid URLs are included,
// CLIENT_URL is an environment variable that can be set to the client URL in production like "https://yourdomain.com"
// This allows the server to accept requests from both localhost and the production client URL
// This is useful for development and production environments where the client URL may change
// Without this, the server would only accept requests from localhost, which is not ideal for production

const io = socketIO(httpServer, {
  pingTimeout: 60000, // this means that if the server does not receive a ping from the client within 60 seconds, it will disconnect the client
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
  app.use(cors());

  // See Note #2
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return authMiddleware({ req, res, io });
      },
    })
  );

  // Need to use the routes after the GraphQL middleware
  // This will allow us to have both GraphQL and RESTful API routes in the same
  app.use(routes); //restful API routes (see Note #3)

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

/* Note #2:
✅ Correct GraphQL middleware with both auth and io in context
  This middleware will handle GraphQL requests at the /graphql endpoint
  and provide the context with user authentication and socket.io instance
  so that resolvers can access the io instance for real-time features
  This is the correct way to set up the Apollo Server with Express
  and to ensure that the context is properly passed to the resolvers.
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // ✅ Get user from auth middleware
        const authContext = await authMiddleware({ req, res });

        // ✅ Return both user and io in context
        return {
          ...authContext, // Example: { user }
          io, // ✅ Now resolvers can access io
        };
      },
    })
  );
  */

/* Note #3:
  we need to use the routes after the GraphQL middleware 
  because the GraphQL middleware will handle the /graphql endpoint
  and we want the RESTful API routes to be available at /api
  so we use the routes after the GraphQL middleware
  This will allow us to have both GraphQL and RESTful API routes in the same application
  and the GraphQL middleware will handle the /graphql endpoint
  while the RESTful API routes will handle the /api endpoint
  This is the correct way to set up the Apollo Server with Express
  and to ensure that the context is properly passed to the resolvers.
  if we put the routes before the GraphQL middleware,
  the GraphQL middleware will not be able to handle the /graphql endpoint
  and the RESTful API routes will not be available at /api
  */
