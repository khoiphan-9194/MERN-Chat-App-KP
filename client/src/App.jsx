import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Outlet } from "react-router-dom";

import PageHeader from "./pages/PageHeader";
import CustomThemeProvider from "./utils/CustomThemeContext";
import AuthenUserInfoProvider from "./utils/AuthUser_Info_Context";

 
const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("id_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthenUserInfoProvider>
        {/* This provider can be used to manage user info across the app */}
        <CustomThemeProvider>
         
          <Outlet />


        </CustomThemeProvider>
      </AuthenUserInfoProvider>
    </ApolloProvider>
  );
}

export default App;
