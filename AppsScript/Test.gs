// by default, runAllTests will:
// - reset and use the test spreadsheet
// - use test messages built from the TestData file
// - send error alerts to the test email

function runAllTests() {
  setTestData();
  resetTestSheet();
  checkForNewAlerts("test");
}

function resetTestSheet() {
  const testSheet = getTransactionsSheet(CONFIG.TEST.SPREADSHEET_ID);
  testSheet
    .getRange(2, 1, testSheet.getLastRow() - 1, testSheet.getLastColumn())
    .clearContent();
  TEST_DATA.SHEET_START_VALUES.ROWS.forEach((rowValues) => {
    writeToTransactionsSheet(rowValues, testSheet);
  });
}

function prepMessagesFromTestData() {
  let preppedMessages = [];
  let testMessagesContentStrings = [
    getTestMessageContentForSingleExpenseAllTestAmounts(),
    getTestMessageContentForAllTransactionTypes(),
    getTestMessageContentForResolvePendingFromPreExisting(),
    getTestMessageContentForResolve3PendingFromPreExisting(),
    getTestMessageContentForResolvePendingFromConcurrent(),
    getTestMessageContentForLowBalanceAlert(),
    getTestMessageContentForUnknownEndContent(),
  ];
  const receivedTime = new Date();
  const fromEmail = "noreply@becualerts.org";
  testMessagesContentStrings.forEach((thisContentString) => {
    let thisMessagePrepped = {
      from: fromEmail,
      time: receivedTime,
      content: thisContentString,
    };
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function getTestMessageContentForSingleExpenseAllTestAmounts() {
  let sections = "";
  Object.entries(TEST_DATA.AMOUNTS).forEach((amount) => {
    let thisSection = replaceSectionValues(amount[1], TEST_DATA.TYPE.EXPENSE);
    sections = sections.concat(thisSection);
  });
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(One expense, all amounts)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAllTransactionTypes() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.FOUR_DIGIT,
    TEST_DATA.TYPE.DEPOSIT
  );
  let sections = "".concat(sectionOne, sectionTwo, sectionThree);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(All transaction types)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_ONE,
    TEST_DATA.TYPE.EXPENSE
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sectionOne, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolve3PendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_TWO,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_THREE,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_FOUR,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionOne, sectionTwo, sectionThree);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromConcurrent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionOne, sectionTwo);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Resolve concurrent pending)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForLowBalanceAlert() {
  return "".concat(
    TEST_DATA.SECTIONS.LOW_BALANCE,
    TEST_DATA.SECTIONS.END_CONTENT
  );
}

function getTestMessageContentForUnknownEndContent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let newAdditionContent = TEST_DATA.SECTIONS.END_CONTENT.replace(
    "12770 Gateway Drive",
    "anything else"
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Unknown end content)"
  );
  return "".concat(sectionOne, newAdditionContent);
}

function replaceSectionValues(amount, type) {
  let section = TEST_DATA.SECTIONS.TRANSACTION;
  section = section.replace("replace-type-image-alt", type.IMAGE_ALT);
  section = section.replace("replace-type-copy", type.COPY);
  section = section.replace("replace-amount", amount);
  return section;
}

function removeAllLabels() {
  let processedThreads = GLOBAL_CONST.POST_PROCESS_LABEL.getThreads();
  processedThreads.forEach(removeAllLabels);
  GLOBAL_CONST.UNPROCESSED_ALERTS.forEach(removeAllLabels);
  function removeAllLabels(thread) {
    let labels = thread.getLabels();
    labels.forEach(removeThisLabel);
    function removeThisLabel(thisLabel) {
      thread.removeLabel(thisLabel);
    }
  }
  Logger.log("All labels removed");
}
