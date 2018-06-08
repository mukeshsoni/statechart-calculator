import { Machine } from "xstate";

const not = fn => (...args) => !fn.apply(null, args);
const isZero = (extState, evtObj) => evtObj.key === 0;
const isNotZero = not(isZero);
const isMinus = (extState, evtObj) => evtObj.operator === "-";
const isNotMinus = not(isMinus);
const divideByZero = (extState, evtObj) =>
  extState.operand2 === "0." && extState.operator === "/";
const notDivideByZero = not(divideByZero);

const calcMachine = Machine(
  {
    initial: "calc.start",
    states: {
      calc: {
        on: {
          CANCEL: {
            "calc.start": { actions: ["reset"] }
          }
        },
        states: {
          start: {
            on: {
              NUMBER: {
                "operand1.zero": {
                  actions: ["defaultReadout"],
                  cond: "isZero"
                },
                "operand1.before_decimal_point": {
                  cond: "isNotZero",
                  actions: ["setReadoutNum"]
                }
              },
              OPERATOR: {
                negative_number: {
                  cond: "isMinus",
                  actions: ["startNegativeNumber"]
                }
              },
              DECIMAL_POINT: {
                "operand1.after_decimal_point": {
                  actions: ["defaultReadout"]
                }
              }
            }
          },
          result: {
            on: {
              NUMBER: {
                operand1: {
                  actions: ["reset"],
                  cond: "isZero"
                }
              },
              PERCENTAGE: {
                result: {
                  actions: ["computePercentage"]
                }
              },
              OPERATOR: {
                operator_entered: {
                  actions: ["storeResultAsOperand1", "recordOperator"]
                }
              }
            }
          },
          operand1: {
            on: {
              OPERATOR: {
                operator_entered: {
                  actions: ["recordOperator"]
                }
              },
              PERCENTAGE: {
                result: {
                  actions: ["computePercentage"]
                }
              },
              CE: {
                start: {
                  actions: ["reset"]
                }
              }
            },
            states: {
              zero: {
                on: {
                  NUMBER: {
                    before_decimal_point: {
                      actions: ["setReadoutNum"]
                    }
                  },
                  DECIMAL_POINT: "after_decimal_point"
                }
              },
              before_decimal_point: {
                on: {
                  NUMBER: {
                    before_decimal_point: {
                      actions: ["appendNumBeforeDecimal"]
                    }
                  },
                  DECIMAL_POINT: "after_decimal_point"
                }
              },
              after_decimal_point: {
                on: {
                  NUMBER: {
                    after_decimal_point: {
                      actions: ["appendNumAfterDecimal"]
                    }
                  }
                }
              }
            }
          },
          alert: {
            on: {
              OK: "operand2.hist"
            }
          },
          operand2: {
            on: {
              OPERATOR: {
                operator_entered: {
                  actions: ["computeAndStoreResultAsOperand1", "setOperator"]
                }
              },
              EQUALS: {
                result: {
                  actions: ["compute"],
                  cond: "notDivideByZero"
                },
                alert: {
                  actions: ["divideByZeroAlert"]
                }
              }
            },
            states: {
              initial: "zero",
              hist: {
                history: true,
                target: "zero"
              },
              zero: {
                on: {
                  NUMBER: {
                    before_decimal_point: {
                      actions: ["setReadoutNum"]
                    }
                  },
                  DECIMAL_POINT: "after_decimal_point"
                }
              },
              before_decimal_point: {
                on: {
                  NUMBER: {
                    before_decimal_point: {
                      actions: ["appendNumBeforeDecimal"]
                    }
                  },
                  DECIMAL_POINT: "after_decimal_point"
                }
              },
              after_decimal_point: {
                on: {
                  NUMBER: {
                    after_decimal_point: {
                      actions: ["appendNumAfterDecimal"]
                    }
                  }
                }
              }
            }
          },
          operator_entered: {
            on: {
              OPERATOR: {
                operator_entered: {
                  cond: "isNotMinus",
                  actions: ["setOperator"]
                },
                negative_number_2: {
                  cond: "isMinus",
                  actions: ["startNegativeNumber"]
                }
              },
              NUMBER: {
                "operand2.zero": {
                  actions: ["defaultReadout"],
                  cond: "isZero"
                },
                "operand2.before_decimal_point": {
                  cond: "isNotZero",
                  actions: ["setReadoutNum"]
                }
              },
              DECIMAL_POINT: {
                "operand2.after_decimal_point": {
                  actions: ["defaultReadout"]
                }
              }
            }
          },
          negative_number: {
            on: {
              NUMBER: {
                "operand1.zero": {
                  actions: ["defaultNegativeReadout"],
                  cond: "isZero"
                },
                "operand1.before_decimal_point": {
                  cond: "isNotZero",
                  actions: ["setNegativeReadoutNum"]
                }
              },
              DECIMAL_POINT: {
                "operand1.after_decimal_point": {
                  actions: ["defaultNegativeReadout"]
                }
              },
              CE: {
                start: {
                  actions: ["reset"]
                }
              }
            }
          },
          negative_number_2: {
            on: {
              NUMBER: {
                "operand2.zero": {
                  actions: ["defaultNegativeReadout"],
                  cond: "isZero"
                },
                "operand2.before_decimal_point": {
                  cond: "isNotZero",
                  actions: ["setNegativeReadoutNum"]
                }
              },
              DECIMAL_POINT: {
                "operand2.after_decimal_point": {
                  actions: ["defaultNegativeReadout"]
                }
              },
              CE: {
                operator_entered: {
                  actions: ["defaultReadout"]
                }
              }
            }
          }
        }
      }
    }
  },
  {
    guards: {
      isMinus,
      isNotMinus,
      isZero,
      isNotZero,
      notDivideByZero
    }
  }
);

export default calcMachine;
