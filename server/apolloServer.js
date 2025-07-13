const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const socketIO = require("socket.io");
const http = require("http");
const socketController = require("./utils/socketController");
const multer = require("multer"); // this is for file upload, what it does is it creates a storage engine that stores the file in the destination you specify
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
  app.use(cors());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return authMiddleware({ req, res, io });
      },
    })
  );

  
  // multer.diskStorage is a method that creates a storage engine that stores the file in the destination you specify
  // multer is a middleware for handling multipart/form-data, which is used for uploading files
  const storage_1 = multer.diskStorage({
    destination: (req, file, cb) => {
      return cb(null, path.join(__dirname, "../client/public/userAvatar"));
      // or   return cb(null, '../client/dist/uploads'); if you're using the production build
    },
    filename: (req, file, cb) => {
      return cb(null, `${file.originalname}`);
    },
  });

  // multer.diskStorage is a method that creates a storage engine that stores the file in the destination you specify
  // multer is a middleware for handling multipart/form-data, which is used for uploading files

  const upload_singleImage = multer({ storage: storage_1 });

  // This endpoint handles single file uploads
  app.post("/upload/single", upload_singleImage.single("file"), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    res.json({ message: "File uploaded successfully", file: req.file });
  });



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
