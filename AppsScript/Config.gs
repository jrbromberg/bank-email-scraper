function setConfig() {
  CONFIG = {
    PRODUCTION: {
      SPREADSHEET_ID: "PUT GOOGLE SPREADSHEET ID HERE",
      ERROR_ALERT_EMAIL_ADDRESS: "PUT EMAIL FOR ERROR ALERTS HERE",
    },
    TEST: {
      SPREADSHEET_ID: "PUT TEST GOOGLE SPREADSHEET ID HERE",
      ERROR_ALERT_EMAIL_ADDRESS: "PUT EMAIL FOR TEST ERROR ALERTS HERE"
    },
  };
  Object.freeze(CONFIG);
}

// enter info the above CONFIG
// preconfigured banks are in the Banks.gs file
// setup your emails, spreadsheets, and bank alerts per the readme

setConfig();
initGlobalVarAndErrorHandling();

function initGlobalVarAndErrorHandling() {
  GLOBAL_VAR = {};
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES = [];
  GLOBAL_VAR.ERROR_OCCURRED = false;
}

function addError(error, separateEmailMessage) {
  try {
    GLOBAL_VAR.ERROR_OCCURRED = true;
    if (error instanceof Error) {
      GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
        separateEmailMessage ?? error.message
      );
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error("addError was not given an Error object");
      sendErrorAlertEmail();
    }
  } catch (error) {
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
      "Error occured in the addError function"
    );
    console.error(error.message);
    console.error(error.stack);
    sendErrorAlertEmail();
  }
}

function sendErrorAlertEmail() {
  let toValue, subjectValue, bodyValue;
  if (typeof GLOBAL_CONST !== "undefined" && GLOBAL_CONST !== null) {
    toValue = GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS;
    subjectValue = GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT;
    bodyValue = GLOBAL_VAR.ERROR_EMAIL_MESSAGES.join("\n");
  } else {
    toValue = [
      CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS,
      CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS,
    ].join(",");
    subjectValue = "Bank Email Scraper Alert";
    bodyValue = "The script failed early on";
  }
  MailApp.sendEmail({
    to: toValue,
    subject: subjectValue,
    body: bodyValue,
  });
  Logger.log("Error email sent");
}

function setGlobalValues(setting) {
  if (typeof GLOBAL_CONST === "undefined" || GLOBAL_CONST === null) {
    GLOBAL_CONST = {};
    setDefaultGlobalValues();
    if (setting === "production") {
      setProductionGlobalValues();
    } else if (setting === "test") {
      setTestGlobalValues();
    } else {
      addError(new Error("Unexpected setting in setGlobalValues"));
    }
    Object.freeze(GLOBAL_CONST);
  } else {
    addError(new Error("There was an error in setGlobalValues"));
  }
}

function setDefaultGlobalValues() {
  GLOBAL_CONST.POST_PROCESS_LABEL =
    GmailApp.getUserLabelByName("TransactionAdded");
  GLOBAL_CONST.PRE_PROCESS_LABEL = GmailApp.getUserLabelByName(
    "BankTransactionUpdate"
  );
  GLOBAL_CONST.UNPROCESSED_ALERTS = GLOBAL_CONST.PRE_PROCESS_LABEL.getThreads();
  setBankData();
}

function setProductionGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    CONFIG.PRODUCTION.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "email";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Financial Dashboard Error";
}

function setTestGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    CONFIG.TEST.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "test-data";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Test run";
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
    "Financial Dashboard script was run in test mode"
  );
}

function getTransactionsSheet(spreadsheetID) {
  return SpreadsheetApp.openById(spreadsheetID).getSheetByName("Transactions");
}
