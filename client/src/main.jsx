import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./components/Login";
import Homepage from "./pages/Homepage";
import Error from "./pages/Error";
import Signup from "./components/Signup";
import SingleCoffeeHouse from "./pages/SingleCoffeeHouse";
import Contact from "./pages/Contact";
import SingleEvent from "./pages/SingleEvent";
import Profile from "./pages/Profile";
import Success from "./pages/Success";
import CancelPayment from "./pages/CancelPayment";
import CreateCoffeeHouse from "./pages/CreateCoffeeHouse";
import CreateHouseEvent from "./pages/CreateHouseEvent";
import EditCoffeehouse from "./pages/EditCoffeehouse";
import EditHouseEvent from "./pages/EditHouseEvent";
import ProfileSetting from "./components/ProfileSetting";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },

      {
        path: "/success",
        element: <Success />,
      },

      {
        path: "/cancel",
        element: <CancelPayment />,
      },

      {
        path: "/Login",
        element: <Login />,
      },
      {
        path: "/Contact",
        element: <Contact />,
      },

      {
        path: "/Signup",
        element: <Signup />,
      },
      {
        path: "/coffeehouse/:coffeeHouseId",
        element: <SingleCoffeeHouse />,
      },
      {
        path: "/event/:eventId",
        element: <SingleEvent />,
      },
      {
        path: "/create-coffeehouse/:ownerId",
        element: <CreateCoffeeHouse />,
      },
      {
        path: "/profile/:ownerId",
        element: <Profile />,
      },
      {
        path: "/me/:ownerId",
        element: <Profile />,
      },
      {
        path:"/me/:ownerId/create-event/:coffeeHouseId",
        element: <CreateHouseEvent />,
      },
      
      {
        path: "/me_id=/:ownerId/edit-coffee-house_id=/:coffeeHouseId",
        element: <EditCoffeehouse />,
      },
      {
        path: "coffeehouse/:coffeeEventHouse_Id/edit-event/:eventId",
        element: <EditHouseEvent />,

      },
      
      {
        path: "/settings/:ownerId",
        element: <ProfileSetting />,
      },

      
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

//ReactDOM.createRoot(document.getElementById('root')).render(<App />);
