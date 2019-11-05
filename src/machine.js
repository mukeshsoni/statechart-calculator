import { Machine, assign } from "xstate";

// Utils
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

// Guards
const not = fn => (...args) => !fn.apply(null, args);
const isZero = (_, { key }) => key === 0;
const isNotZero = not(isZero);
const isMinus = (_, { operator }) => operator === "-";
const isNotMinus = not(isMinus);
const divideByZero = ({ operand2, operator }) => (!operand2 || operand2 === "0.") && operator === "/";
const notDivideByZero = not(divideByZero);

// Actions
const defaultReadout = assign({ display: "0." });
const defaultNegativeReadout = assign({ display: "-0." });
const appendNumBeforeDecimal = assign(({ display }, { key: num }) => ({ display: display.slice(0, -1) + num + "." }));
const appendNumAfterDecimal = assign(({ display }, { key: num }) => ({ display: display + num }));
const setReadoutNum = assign((_, { key: num }) => ({ display: num + "." }));
const setNegativeReadoutNum = assign((_, { key: num }) => ({ display: "-" + num + "." }));
const startNegativeNumber = assign({ display: "-" });
const recordOperator = assign(({ display }, { operator }) => ({ operand1: display, operator }));
const setOperator = assign((_, { operator }) => ({ operator }));
const computePercentage = assign(({ display }) => ({ display: display / 100 }));
const compute = assign(({ display, operand1, operator }) => {
  const operand2 = display;
  return { display: doMath(operand1, operand2, operator) };
});
const computeAndStoreResultAsOperand1 = assign(({ display, operand1, operator }) => {
  const operand2 = display;
  console.log("new operand1", doMath(operand1, operand2, operator));
  return { operand1: doMath(operand1, operand2, operator) };
});
const storeResultAsOperand1 = assign(({ display }) => ({ operand1: display }));
const reset = assign({ display: "0." });

const calcMachine = Machine({
  initial: "calc",
  context: {
    display: "0.",
    operand1: null,
    operand2: null,
    operator: null
  },
  states: {
    calc: {
      initial: "start",
      on: {
        CANCEL: {
          target: ".start",
          actions: "reset"
        }
      },
      states: {
        start: {
          on: {
            NUMBER: [
              {
                target: "operand1.zero",
                actions: "defaultReadout",
                cond: "isZero"
              },
              {
                target: "operand1.before_decimal_point",
                actions: "setReadoutNum",
                cond: "isNotZero"
              }
            ],
            OPERATOR: {
              target: "negative_number",
              actions: "startNegativeNumber",
              cond: "isMinus"
            },
            DECIMAL_POINT: {
              target: "operand1.after_decimal_point",
              actions: "defaultReadout"
            }
          }
        },
        result: {
          on: {
            NUMBER: {
              target: "operand1",
              actions: "reset",
              cond: "isZero"
            },
            PERCENTAGE: {
              target: "result",
              actions: "computePercentage"
            },
            OPERATOR: {
              target: "operator_entered",
              actions: ["storeResultAsOperand1", "recordOperator"]
            }
          }
        },
        operand1: {
          on: {
            OPERATOR: {
              target: "operator_entered",
              actions: "recordOperator"
            },
            PERCENTAGE: {
              target: "result",
              actions: "computePercentage"
            },
            CE: {
              target: "start",
              actions: "reset"
            }
          },
          states: {
            zero: {
              on: {
                NUMBER: {
                  target: "before_decimal_point",
                  actions: "setReadoutNum"
                },
                DECIMAL_POINT: "after_decimal_point"
              }
            },
            before_decimal_point: {
              on: {
                NUMBER: {
                  actions: "appendNumBeforeDecimal"
                },
                DECIMAL_POINT: "after_decimal_point"
              }
            },
            after_decimal_point: {
              on: {
                NUMBER: {
                  actions: "appendNumAfterDecimal"
                }
              }
            }
          }
        },
        alert: {
          invoke: {
            src: "divideByZeroAlert",
          },
          on: {
            OK: {
              target: "operand2.zero",
              actions: "reset"
            }
          }
        },
        operand2: {
          on: {
            OPERATOR: {
              target: "operator_entered",
              actions: ["computeAndStoreResultAsOperand1", "setOperator"]
            },
            EQUALS: [
              {
                target: "result",
                actions: "compute",
                cond: "notDivideByZero"
              },
              {
                target: "alert"
              }
            ],
          },
          states: {
            initial: "zero",
            zero: {
              on: {
                NUMBER: {
                  target: "before_decimal_point",
                  actions: "setReadoutNum"
                },
                DECIMAL_POINT: "after_decimal_point"
              }
            },
            before_decimal_point: {
              on: {
                NUMBER: {
                  actions: "appendNumBeforeDecimal"
                },
                DECIMAL_POINT: "after_decimal_point"
              }
            },
            after_decimal_point: {
              on: {
                NUMBER: {
                  actions: "appendNumAfterDecimal"
                }
              }
            }
          }
        },
        operator_entered: {
          on: {
            OPERATOR: [
              {
                target: "operator_entered",
                actions: "setOperator",
                cond: "isNotMinus"
              },
              {
                target: "negative_number_2",
                actions: "startNegativeNumber",
                cond: "isMinus"
              }
            ],
            NUMBER: [
              {
                target: "operand2.zero",
                actions: "defaultReadout",
                cond: "isZero"
              },
              {
                target: "operand2.before_decimal_point",
                actions: "setReadoutNum",
                cond: "isNotZero",
              }
            ],
            DECIMAL_POINT: {
              target: "operand2.after_decimal_point",
              actions: "defaultReadout"
            }
          }
        },
        negative_number: {
          on: {
            NUMBER: [
              {
                target: "operand1.zero",
                actions: "defaultNegativeReadout",
                cond: "isZero"
              },
              {
                target: "operand1.before_decimal_point",
                actions: "setNegativeReadoutNum",
                cond: "isNotZero"
              }
            ],
            DECIMAL_POINT: {
              target: "operand1.after_decimal_point",
              actions: "defaultNegativeReadout"
            },
            CE: {
              target: "start",
              actions: "reset"
            }
          }
        },
        negative_number_2: {
          on: {
            NUMBER: [
              {
                target: "operand2.zero",
                actions: "defaultNegativeReadout",
                cond: "isZero"
              },
              {
                target: "operand2.before_decimal_point",
                actions: "setNegativeReadoutNum",
                cond: "isNotZero"
              }
            ],
            DECIMAL_POINT: {
              target: "operand2.after_decimal_point",
              actions: "defaultNegativeReadout"
            },
            CE: {
              target: "operator_entered",
              actions: "defaultReadout"
            }
          }
        }
      }
    }
  }
}, {
  actions: {
    defaultReadout,
    defaultNegativeReadout,
    appendNumBeforeDecimal,
    appendNumAfterDecimal,
    setReadoutNum,
    setNegativeReadoutNum,
    startNegativeNumber,
    recordOperator,
    setOperator,
    computePercentage,
    compute,
    computeAndStoreResultAsOperand1,
    storeResultAsOperand1,
    reset
  },
  guards: {
    isMinus,
    isNotMinus,
    isZero,
    isNotZero,
    notDivideByZero
  }
});

export default calcMachine;
