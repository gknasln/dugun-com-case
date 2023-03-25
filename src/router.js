import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Welcome from "./screens/Welcome";
import Map from "./screens/Map";

const routes = createBrowserRouter([
  {
    path: "/",
    element: (<Welcome />),
  },
  {
    path: "map",
    element: (<Map />)
  },
]);

export default routes;
