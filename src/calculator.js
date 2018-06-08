import React from "react";
import calcMachine from "./machine.js";
import "./styles.css";

function isOperator(text) {
  return text === "+" || text === "-" || text === "x" || text === "/";
}

function doMath(operand1, operand2, operator) {
  switch (operator) {
    case "+":
      return +operand1 + +operand2;
    case "-":
      return +operand1 - +operand2;
    case "/":
      return +operand1 / +operand2;
    case "x":
      return +operand1 * +operand2;
    default:
      return Infinity;
  }
}

export default class Calculator extends React.Component {
  state = {
    display: "0.",
    operand1: null,
    operand2: null,
    operator: null,
    calcState: calcMachine.initial
  };

  defaultReadout() {
    this.setState({ display: "0." });
  }

  defaultNegativeReadout() {
    this.setState({ display: "-0." });
  }

  appendNumBeforeDecimal = ({ key: num }) => {
    this.setState({ display: this.state.display.slice(0, -1) + num + "." });
  };

  appendNumAfterDecimal = ({ key: num }) => {
    this.setState({ display: this.state.display + num });
  };

  setReadoutNum = ({ key: num }) => {
    this.setState({ display: num + "." });
  };

  setNegativeReadoutNum = ({ key: num }) => {
    this.setState({ display: "-" + num + "." });
  };

  startNegativeNumber = num => {
    console.log("here");
    this.setState({ display: "-" });
  };

  recordOperator = ({ operator }) => {
    this.setState({ operand1: this.state.display, operator });
  };

  setOperator = ({ operator }) => {
    this.setState({ operator });
  };

  computePercentage = () => {
    this.setState({ display: this.state.display / 100 });
  };

  compute = () => {
    const operand2 = this.state.display;
    const { operand1, operator } = this.state;
    this.setState({ display: doMath(operand1, operand2, operator) });
  };

  computeAndStoreResultAsOperand1 = () => {
    const operand2 = this.state.display;
    const { operand1, operator } = this.state;
    console.log("new operand1", doMath(operand1, operand2, operator));
    this.setState({ operand1: doMath(operand1, operand2, operator) });
  };

  storeResultAsOperand1() {
    this.setState({ operand1: this.state.display });
  }

  divideByZeroAlert() {
    // have to put the alert in setTimeout because action is executed on event, before the transition to next state happens
    // this alert is supposed to happend on transition
    // setTimeout allows time for other state transition (to 'alert' state) to happen before showing the alert
    // probably a better way to do it. like entry or exit actions
    setTimeout(() => {
      alert("Cannot divide by zero!");
      this.transition("OK");
    }, 0);
  }

  reset() {
    this.setState({ display: "0." });
  }

  runActions = (calcState, evtObj) => {
    calcState.actions.forEach(action => this[action](evtObj));
  };

  /**
   * does three things
   * 1. calls the transition function of machine creted using xstate
   * 2. invokes/runs all the actions
   * 3. Sets the new state as the current state
   */
  transition = (eventName, evtObj = {}) => {
    console.log("current state", this.state.calcState, eventName);
    const nextState = calcMachine.transition(
      this.state.calcState,
      {
        type: eventName,
        ...evtObj
      },
      {
        operator: this.state.operator,
        operand2: this.state.operator ? this.state.display : null
      }
    );
    console.log("actions", nextState.actions);
    console.log("next state", nextState.value);
    this.runActions(nextState, evtObj);
    this.setState({ calcState: nextState.value });
  };

  handleButtonClick = item => {
    if (Number.isInteger(+item)) {
      this.transition("NUMBER", { key: +item });
    } else if (isOperator(item)) {
      this.transition("OPERATOR", { operator: item });
    } else if (item === "C") {
      this.transition("CANCEL");
    } else if (item === ".") {
      this.transition("DECIMAL_POINT");
    } else if (item === "%") {
      this.transition("PERCENTAGE");
    } else if (item === "CE") {
      this.transition("CE");
    } else {
      this.transition("EQUALS");
      console.log("equals clicked");
    }
  };

  calcButtons() {
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
          onClick={this.handleButtonClick.bind(this, item)}
          className={classNames}
          key={index}
        >
          {item}
        </button>
      );
    });
  }

  render() {
    return (
      <div className="container">
        <input className="readout" value={this.state.display} disabled />
        <div className="button-grid">{this.calcButtons()}</div>
      </div>
    );
  }
}
