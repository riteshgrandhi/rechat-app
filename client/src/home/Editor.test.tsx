import React from "react";
import ReactDOM from "react-dom";
import Editor from "./Editor";
import ServiceContext, {
  defaultContextValue
} from "../services/ServiceContext";

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(
    <ServiceContext.Provider value={defaultContextValue}>
      <Editor marcId="test" />
    </ServiceContext.Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
