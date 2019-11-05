import React from "react";
import { useMachine } from "@xstate/react";
import calcMachine from "./machine.js";
import "./styles.css";

function isOperator(text) {
  return text === "+" || text === "-" || text === "x" || text === "/";
}

const divideByZeroAlert = () => callback => {
  alert("Cannot divide by zero!");
  callback("OK");
}

export default function Calculator() {
  const [ current, send ] = useMachine(calcMachine.withConfig({
    services: {
      divideByZeroAlert
    }
  }));
  const { display } = current.context;

  const handleButtonClick = item => {
    if (Number.isInteger(+item)) {
      send("NUMBER", { key: +item });
    } else if (isOperator(item)) {
      send("OPERATOR", { operator: item });
    } else if (item === "C") {
      send("CANCEL");
    } else if (item === ".") {
      send("DECIMAL_POINT");
    } else if (item === "%") {
      send("PERCENTAGE");
    } else if (item === "CE") {
      send("CE");
    } else {
      send("EQUALS");
      console.log("equals clicked");
    }
  };

  const calcButtons = () => {
    const buttons = [
      "C",
      "CE",
      "/",
      "7",
      "8",
      "9",
      "x",
      "4",
      "5",
      "6",
      "-",
      "1",
      "2",
      "3",
      "+",
      "0",
      ".",
      "=",
      "%"
    ];

    return buttons.map((item, index) => {
      let classNames = "calc-button";

      if (item === "C") {
        classNames += " two-span";
      }

      return (
        <button
          onClick={() => handleButtonClick(item)}
          className={classNames}
          key={index}
        >
          {item}
        </button>
      );
    });
  }

  return (
    <div className="container">
      <input className="readout" value={display} disabled />
      <div className="button-grid">{calcButtons()}</div>
    </div>
  );
}
