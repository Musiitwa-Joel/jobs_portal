import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

// import { initDevToolsProtection } from "./protect";
// initDevToolsProtection();

// === Apollo Client Setup (as before) ===
const errorLink = onError(({ graphQLErrors, networkError }) => {
  const message = graphQLErrors?.[0]?.message || networkError?.message;
  console.warn(`[GraphQL Error]: ${message}`);
});

const httpLink = new HttpLink({
  uri: "http://localhost:9000/graphql",
  headers: { "Content-Type": "application/json" },
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});

// === Render app ===
createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={client}>
    <StrictMode>
      <App />
    </StrictMode>
  </ApolloProvider>,
);
