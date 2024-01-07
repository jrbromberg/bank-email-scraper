function setTestData() {
    const starterEntryDatetime = new Date(2023, 11, 31, 21, 59, 0, 0);
    TEST_DATA = {
        SECTIONS: {
            TRANSACTION: "[BECU]\n\nreplace-type-image-alt\n\nreplace-type-copy\n\nAn amount larger than $0.00 was spent from your 1234 * account.\n\n(Description)\n\n$replace-amount\n\nLog In To Account<link>\n\n",
            LOW_BALANCE: "[BECU]\n\n[Low Account Balance]\n\nLow Account Balance\n\nYour 1234 * Joint Checking account balance has dropped to:\n\n$666.66\n\nLog In To Account<link>\n\n",
            END_CONTENT: "Start reducing debt now\n\nGive us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.\n\nLearn More<link>\n\nYou're receiving this email because you enabled notifications in BECU.\n\nManage Settings<link>\n\nBECU\n\n12770 Gateway Drive\n\n© 2023 All rights reserved"
        },
        AMOUNTS: {
            PENNY: "0.01",
            DIME: "0.10",
            DOLLAR: "1.00",
            TWO_DIGIT: "12.30",
            THREE_DIGIT: "456.78",
            FOUR_DIGIT: "1,234.56",
            SEVEN_DIGIT: "1,234,567.89",
            PENDING_ONE: "500.00",
            PENDING_TWO: "1,000.00",
            PENDING_THREE: "1,500.00",
            PENDING_FOUR: "2,000.00"
        },
        TYPE: {
            EXPENSE: {
                IMAGE_ALT: "[Large Expense]",
                COPY: "Large Expense"
            },
            PENDING_EXPENSE: {
                IMAGE_ALT: "[Large Pending Expense]",
                COPY: "Large Pending Expense"
            },
            DEPOSIT: {
                IMAGE_ALT: "[Large Account Deposit]",
                COPY: "Large Deposit"
            }
        },
        DESCRIPTION_REGEX: /\(Description\)/g,
        SHEET_START_VALUES: {
            ROWS: [
                [starterEntryDatetime, 'BECU', '1234', 'Deposit', '10,000.00', 'Starter entry'],
                [starterEntryDatetime, 'BECU', '1234', 'Pending Expense', '-500.00', 'Test pending exp.'],
                [starterEntryDatetime, 'BECU', '1234', 'Pending Expense', '-1,000.00', 'Test pending exp.'],
                [starterEntryDatetime, 'BECU', '1234', 'Pending Expense', '-1,500.00', 'Test pending exp.'],
                [starterEntryDatetime, 'BECU', '1234', 'Pending Expense', '-2,000.00', 'Test pending exp.']
            ],
            PENDING_DESCRIPTION: "(Test pending exp.)"
        }
    }
    Object.freeze(TEST_DATA);
}
