function checkForNewAlerts(setting) {
  try {
    setting = typeof setting !== 'string' ? 'production' : setting;
    setGlobalValues(setting);
    const preppedMessages = getPreppedMessages();
    const newAlertsCount = preppedMessages.length;
    if (newAlertsCount > 0) {
      Logger.log(newAlertsCount + ' new alert messages found');
      processBankAlerts(preppedMessages);
    } else {
      Logger.log('No new alerts');
    }
  } catch (error) {
    addError(error, 'The script was not able to run')
  }
  if (GLOBAL_VAR.ERROR_OCCURRED) {sendErrorAlertEmail();}
}

function getPreppedMessages() {
  if (GLOBAL_CONST.MESSAGE_SOURCE === 'email') {
    return prepMessagesFromEmail();
  } else if (GLOBAL_CONST.MESSAGE_SOURCE === 'test-data') {
    return prepMessagesFromTestData();
  } else {
    addError(new Error('Unexpected message source specified'))
  }
}

function prepMessagesFromEmail() {
  let preppedMessages = [];
  const allMessages = GmailApp.getMessagesForThreads(GLOBAL_CONST.UNPROCESSED_ALERTS);
  allMessages.forEach(thisMessage => {
    let fromEmail = thisMessage[0].getFrom();
    let receivedTime = thisMessage[0].getDate();
    let messageContent = thisMessage[0].getPlainBody();
    let thisMessagePrepped = {
      from: fromEmail,
      time: receivedTime,
      content: messageContent
    }
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function processBankAlerts(preppedMessages) {
  try {
    let transactionValues = getTransactionsFromAllMessages(preppedMessages);
    transactionValues.allNew.forEach(thisTransaction => {
      writeToTransactionsSheet(thisTransaction, GLOBAL_CONST.TRANSACTIONS_SHEET);
    });
    Logger.log('Transactions added to sheet');
    reviewPendingTransactionsFromSheet(transactionValues.newCompleted);
    updateLabels();
  } catch (error) {
    addError(error, 'Error occursed while processing the email alerts');
  }
}

function getTransactionsFromAllMessages(preppedMessages) {
  let allTransactionValues = {
    allNew: [],
    newCompleted: []
  }
  preppedMessages.forEach(thisMessage => {
    let bank = getBankData(thismessage);
    let receivedTime = thisMessage.time;
    let messageContent = thisMessage.content;
    Logger.log('Message:');
    Logger.log(messageContent);
    let messageSections = messageContent.split(bank.SECTION_DELIMITER);
    let messageTransactionValues = getTransactionsFromThisMessage(messageSections, receivedTime, bank);
    allTransactionValues.allNew.push(...messageTransactionValues.allNew);
    allTransactionValues.newCompleted.push(...messageTransactionValues.newCompleted);
  });
  Logger.log(allTransactionValues.allNew.length + ' transactions found');
  Logger.log('Transactions:');
  Logger.log(allTransactionValues.allNew);
  return allTransactionValues;
}

// need to add error handling for when bank isn't found
function getBankData(message) {
  for (const [bank, bankValues] of Object.entries(BANKS)) {
    if (bankValues.SENDER === message.from) {return bankValues;}
  }
  return undefined;
}

// pending and expense will need to be more complicated now  (tran type too)
function getTransactionsFromThisMessage(messageSections, receivedTime, bank) {
  let valuesFromAllMessageTransactions = [];
  let newCompletedMessageTransactions = [];
  messageSections.forEach(thisSection => {
    try {
      let transType = getTransactionType(thisSection, bank);
      if (transType != null) {
        let accountNum = thisSection.match(bank.ACCOUNT_NUM)[0];
        let dollarAmount = thisSection.match(bank.AMOUNT)[0].replace('$', '');
        if ([TRANSACTION_NAMES.EXPENSE, TRANSACTION_NAMES.PENDING_EXPENSE].includes(transType)) {
          dollarAmount = ('-' + dollarAmount);
        }
        let transDescription = thisSection.match(bank.DESCRIPTION)[0].trim();
        let valuesfromTransaction = [
          receivedTime,
          bank.SHORT_NAME,
          accountNum,
          transType,
          dollarAmount,
          transDescription
        ];
        valuesFromAllMessageTransactions.push(valuesfromTransaction);
        if ([TRANSACTION_NAMES.PENDING_EXPENSE, TRANSACTION_NAMES.PENDING_DEPOSIT].includes(transType)) {
          let valuesMinusReceivedTime = valuesfromTransaction.slice(1);
          newCompletedMessageTransactions.push(valuesMinusReceivedTime);
        }
      } else if (bank.NON_TRANS_TYPE.test(thisSection)) {
        Logger.log('Non transaction email alert');
      } else if (!bank.OTHER_CONTENT.test(thisSection)) {
        addError(new Error('Unexpected content in email'));
      }
    } catch (error) {
      addError(error, 'Error occured while getting values via regex');
    }
  });
  let messageTransactionValues = {
    allNew: valuesFromAllMessageTransactions,
    newCompleted: newCompletedMessageTransactions
  };
  return messageTransactionValues;
}

// got a lot of this from chatgpt, make sure it works
function getTransactionType(section, bank) {
  const matchingTransType = Object.entries(bank.TRANS_TYPE).find(([typeKey, regex]) => regex.test(section));
  if (matchingTransType) {
    const [typeKey, regex] = matchingTransType;
    const matchingName = Object.entries(TRANSACTION_NAMES).find(([nameKey]) => nameKey === typeKey);
    return matchingName ? matchingName[1] : null;
  }
  return null;
}

function transactionIsPending(transactionType) {
  if ([TRANSACTION_NAMES.PENDING_EXPENSE, TRANSACTION_NAMES.PENDING_DEPOSIT].includes(transactionType)) {
    return true;
  }
  return false;
}

function writeToTransactionsSheet(transactionValues, sheet) {
  sheet.insertRowBefore(2);
  sheet.getRange("A2:F2").setValues([transactionValues]);
}

function reviewPendingTransactionsFromSheet(newCompletedTransactions) {
  if (newCompletedTransactions.length > 0) {
    const allRowsFromTransactionSheet = GLOBAL_CONST.TRANSACTIONS_SHEET.getDataRange().getValues();
    let currentPendingTransactions = getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet);
    if (currentPendingTransactions.length > 0) {
      var anyPendingTransactionWasResolved = resolveAnyCompletedPendingTransactions(
        newCompletedTransactions,
        currentPendingTransactions
      );
    }
  }
  if (anyPendingTransactionWasResolved === false) {Logger.log('No pending transactions were completed');}
}

function getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet) {
  let currentPendingTransactions = [];
  allRowsFromTransactionSheet.forEach((thisTransactionFromSheet, index) => {
    let transType = thisTransactionFromSheet[3];
    if (transactionIsPending(transType)) {
      let rowNumber = (index + 1);
      let bankName = thisTransactionFromSheet[1];
      let accountNum = thisTransactionFromSheet[2].toString();
      let dollarAmount = thisTransactionFromSheet[4].toFixed(2);
      let transDescription = thisTransactionFromSheet[5];
      currentPendingTransactions.push([
        rowNumber,
        [bankName, accountNum, transType, dollarAmount, transDescription]
      ]);
    }
  });
  return currentPendingTransactions;
}

function resolveAnyCompletedPendingTransactions(newCompletedTransactions, currentPendingTransactions) {
  let anyPendingTransactionWasResolved = false;
  newCompletedTransactions.forEach(thisNewCompletedTransaction => {
    thisNewCompletedTransaction[3] = thisNewCompletedTransaction[3].replace(/,/g, '');
    for (let i = 0; i < currentPendingTransactions.length; i++) {
      let thisCurrentPendingTransaction = currentPendingTransactions[i];
      let currentPendingTransactionForComp = [...thisCurrentPendingTransaction[1]];
      currentPendingTransactionForComp[1] = currentPendingTransactionForComp[1].replace('Pending ', '');
      if (JSON.stringify(currentPendingTransactionForComp) === JSON.stringify(thisNewCompletedTransaction)) {
        Logger.log('Found completed pending transaction:');
        Logger.log(thisCurrentPendingTransaction[1]);
        Logger.log(thisNewCompletedTransaction);
        GLOBAL_CONST.TRANSACTIONS_SHEET.deleteRow(thisCurrentPendingTransaction[0]);
        currentPendingTransactions.splice(i, 1);
        i--;
        anyPendingTransactionWasResolved = true;
        Logger.log('Entry for pending transaction deleted from sheet');
        break;
      }
    }
  });
  return anyPendingTransactionWasResolved;
}

function updateLabels() {
  GLOBAL_CONST.UNPROCESSED_ALERTS.forEach(thisThread => {
    thisThread.addLabel(GLOBAL_CONST.POST_PROCESS_LABEL);
    thisThread.removeLabel(GLOBAL_CONST.PRE_PROCESS_LABEL);
  });
  Logger.log('Email labels updated');
}