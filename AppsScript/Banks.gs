function setBankData() {
    BANKS = {}
    BANKS.TEST = {
        NAME: 'Test',
        SENDER: 'test',
        ACCOUNT_NUM: /\d{4} \*/,
        TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
        NON_TRANS_TYPE: /(Low Account Balance)/,
        PENDING: /Pending/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        EXPENSE: /Expense/,
        DESCRIPTION: /\(.*\)/,
        OTHER_CONTENT: /12770 Gateway Drive/
    }
    BANKS.TEST.SECTION_DELIMITER = new RegExp(`(?<=${BANKS.TEST.AMOUNT.source})`, "g");

    BANKS.BOFA = {
        NAME: 'Bank of America',
        SENDER: 'onlinebanking@ealerts.bankofamerica.com',
        ACCOUNT_NUM: /\d{4} \*/,
        TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
        NON_TRANS_TYPE: /(Low Account Balance)/,
        PENDING: /Pending/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        EXPENSE: /Expense/,
        DESCRIPTION: /\(.*\)/,
        OTHER_CONTENT: /12770 Gateway Drive/
    }
    BANKS.BOFA.SECTION_DELIMITER = new RegExp(`(?<=${BANKS.BOFA.AMOUNT.source})`, "g");

    BANKS.BECU = {
        NAME: 'BECU',
        SENDER: 'noreply@becualerts.org',
        ACCOUNT_NUM: /\d{4} \*/,
        TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
        NON_TRANS_TYPE: /(Low Account Balance)/,
        PENDING: /Pending/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        EXPENSE: /Expense/,
        DESCRIPTION: /\(.*\)/,
        OTHER_CONTENT: /12770 Gateway Drive/
    }
    BANKS.BECU.SECTION_DELIMITER = new RegExp(`(?<=${BANKS.BECU.AMOUNT.source})`, "g");
    
    Object.freeze(BANKS);
}
