const operationText = document.querySelector(".operation-text");
const resultText = document.querySelector(".result-text");
let firstOperand = null;
let secondOperand = null;
let temporaryOperand = "0";
let result = null;
let confirmedOperator = null;
let selectedOperator = null;
let userInput = false;
let fullOperation = false;
let partialOperation = false;
let completedOperation = true;
let enoughSpace = true;
let maxOperandLength = 8;

initializeApp();

function initializeApp() {
    setKeyEventListeners();
    setButtonEventListeners();
    clearTempOperand();
}


function setKeyEventListeners() {
    document.addEventListener("keyup", (event) => {
        const pressedKeyId = event.key == "+" ? "add":
        event.key == "-" ? "subtract":
        event.key == "*" ? "multiply":
        event.key == "/" ? "divide":
        event.key == "Delete" ? "clear-entry":
        event.key == "Backspace" ? "backspace":
        event.key == "." ? "decimal-point":
        event.key == "Enter" ? "equals":
        event.key;
        const isOperator = pressedKeyId === "add" || pressedKeyId === "subtract" || pressedKeyId === "multiply" || pressedKeyId === "divide";
        const buttonElement = document.querySelector("#b-" + pressedKeyId);

        animateButton(buttonElement);

        if (isOperator) applyOperator(pressedKeyId);
        else if (pressedKeyId == "clear-entry") clearTempOperand();
        else if (pressedKeyId == "backspace") sliceTempOperand();
        else if (pressedKeyId == "decimal-point") appendDecimalPoint();
        else if (pressedKeyId == "equals")checkEquals();
        else if (pressedKeyId >= 0 && pressedKeyId <= 9) {
            userInput = true;
            appendTempOperand(pressedKeyId);
        }
    });
}


function setButtonEventListeners() {
   const calculatorButtons = document.querySelectorAll(".buttons-container button");

   calculatorButtons.forEach((button) => {
        const buttonValue = button.id.slice(2); // Remove the prefix "b-" of each id
        const isOperator = buttonValue === "add" || buttonValue === "subtract" || buttonValue === "multiply" || buttonValue === "divide";

        if (isOperator) button.addEventListener("mousedown", () => applyOperator(buttonValue));
        else if (buttonValue === "clear-entry") button.addEventListener("mousedown", () => clearTempOperand());
        else if (buttonValue === "clear") button.addEventListener("mousedown", () => clearAll());
        else if (buttonValue === "backspace") button.addEventListener("mousedown", () => sliceTempOperand());
        else if (buttonValue === "sign") button.addEventListener("mousedown", () => changeSign());
        else if (buttonValue === "decimal-point") button.addEventListener("mousedown", () => appendDecimalPoint());
        else if (buttonValue === "equals") button.addEventListener("mousedown", () => checkEquals());
        else if (buttonValue >= 0 && buttonValue <= 9) button.addEventListener("mousedown", () => {
                userInput = true;
                appendTempOperand(buttonValue);
        });
    });
}


function applyOperator(operator) {
    selectedOperator = operator;
    completedOperation = false;

    if (userInput) {
        if (firstOperand === null) {
            firstOperand = temporaryOperand;
        } else { // Get result and update screen
            secondOperand = temporaryOperand;
            result = operate(confirmedOperator, Number(firstOperand), Number(secondOperand)).toString();

            if (isNaN(result)) { // Division by zero
                updateOperationText(result);
                updateResultText("Try again");
            } else { // A number or infinite
                result = result.length >= maxOperandLength ? Number(result).toPrecision(maxOperandLength).toString() : result;
                updateResultText(format(result));
                firstOperand = result;
            }
        }
        userInput = false;
    } else {
        if (firstOperand === null) {
            firstOperand = "0";
        }
    }

    // Just update screen
    if (isNaN(result)) {  // Division by zero
        result = "0"; 
        firstOperand = result;
    } else { // A number or infinite
        updateOperationText(`${firstOperand} ${getOperatorChar(selectedOperator)}`);
    }
    operationText.style.opacity = 1;
    confirmedOperator = selectedOperator;
    temporaryOperand = "0";
}


function clearTempOperand() {
    temporaryOperand = "0";
    userInput = false;
    updateResultText(format(temporaryOperand));
}


function clearAll() {
    firstOperand = null;
    secondOperand = null;
    temporaryOperand = "0";
    result = null;
    confirmedOperator = null;
    selectedOperator = null;
    userInput = false;
    fullOperation = false;
    partialOperation = false;
    completedOperation = true;
    clearOperationText();
    clearTempOperand();
}


function sliceTempOperand() {
    const allowedSlice = temporaryOperand.includes("-") && temporaryOperand.length > 2 ||
        !temporaryOperand.includes("-") && temporaryOperand.length > 1;

    if (completedOperation) clearAll();

    if (allowedSlice) {
        temporaryOperand = temporaryOperand.slice(0, -1);
        if (temporaryOperand === "-0.") {
            temporaryOperand = "0";
        }
    } else {
        temporaryOperand = "0";
    }
    updateResultText(format(temporaryOperand));
} 


function changeSign() {
    if (completedOperation) clearAll(); 

    if (temporaryOperand != 0) {
     temporaryOperand = temporaryOperand.charAt(0) === "-" ?
         temporaryOperand.slice(1) :
         "-" + temporaryOperand;
    }
    updateResultText(format(temporaryOperand));
}


function appendDecimalPoint() {
    if (!temporaryOperand.includes(".")) {
        if (temporaryOperand === "0") {
            appendTempOperand("0.");
        } else {
            appendTempOperand(".");
        }
        updateResultText(format(temporaryOperand));
    }
}


function checkEquals() {
    fullOperation = userInput && firstOperand !== null && confirmedOperator !== null;
    partialOperation = userInput === false && firstOperand !== null && confirmedOperator !== null;
    
    if (fullOperation || partialOperation) {
        if (fullOperation) {
            secondOperand = temporaryOperand;
        } else if (partialOperation) {
            secondOperand = secondOperand === null ? "0" : secondOperand;
        }

        result = operate(confirmedOperator, Number(firstOperand), Number(secondOperand)).toString();

        if (isNaN(result)) { // Division by zero
            updateOperationText(result);
            updateResultText("Try again");
            result = "0";
        } else { // A number or infinite
            result = result.length >= maxOperandLength ? Number(result).toPrecision(maxOperandLength).toString() : result;
            updateOperationText(`${firstOperand} ${getOperatorChar(confirmedOperator)} ${secondOperand} =`);
            updateResultText(format(result));
        }
        firstOperand = result;
        userInput = false;
        temporaryOperand = "0";
        completedOperation = true;
    }
}


function appendTempOperand(string) {
    const enoughSpace = temporaryOperand.replace(/[\-.]/g, "").length < maxOperandLength;

    if (enoughSpace) {
        if (completedOperation) clearAll();
        
        if (temporaryOperand === "0") {
            temporaryOperand = string;
        } else {
            temporaryOperand += string;
        }
        completedOperation = false;
        userInput = true;
        updateResultText(format(temporaryOperand));
    }
}


function updateOperationText(text) {
    operationText.textContent = text;
}


function clearOperationText() {
    operationText.textContent = "0";
    operationText.style.opacity = 0;
}


function updateResultText(string) {
    resultText.textContent = string;
}


function format(string) {
    if (!string.includes("$")) {
        if (string.includes("-")) {
            return "-$" + string.substring(1);
        } else {
            return "$" + string;
        }
    }
}


function getOperatorChar(idOperator) {
    return idOperator == "add" ? "+" :
    idOperator == "subtract" ? "-" :
    idOperator == "multiply" ? "×" :
    idOperator == "divide" ? "÷" :
    null;
}


function operate(operator, operand1, operand2) {
    switch(operator) {
        case "add": 
            return operand1 + operand2;
        case "subtract":
            return operand1 - operand2;
        case "multiply":
            return operand1 * operand2;
        case "divide":
            return operand2 == "0" ? "That's not very scientific" : operand1 / operand2;
        default:
            break;
    }
}


function animateButton(buttonElement) {
    if (buttonElement !== null) {
        buttonElement.classList.toggle("active");
        setTimeout(() => buttonElement.classList.toggle("active"), 125);
    }
}