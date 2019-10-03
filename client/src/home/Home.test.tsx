import React from "react";
import ReactDOM from "react-dom";
import Home from "./Home";
import ServiceContext, {
  defaultContextValue
} from "../services/ServiceContext";

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(
    <ServiceContext.Provider value={defaultContextValue}>
      <Home marcs={[]} />
    </ServiceContext.Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
