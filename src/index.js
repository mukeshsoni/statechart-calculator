import React from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import Calculator from "./calculator.js";

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
  marginTop: 20
};

const App = () => (
  <div style={styles}>
    <h3>Statechart driven calculator</h3>
    <br />
    <Calculator />
  </div>
);

render(<App />, document.getElementById("root"));
