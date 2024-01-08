# What is this?

This is a free and safe solution for pulling bank account transactions into a google spreadsheet that you can customize.

No bank login information required.  This works by scraping emails.

This is made to work with BECU but could be modified to work with any bank that can send email alerts for all transactions.

# Features

Google Apps Script
- Pulls transaction/balance details into Google sheet
    - email datetime
    - bank name
    - account number
    - transaction/balance type
    - dollar amount
    - description
- Checks new transactions against pending transactions to keep balances correct
- Updates email labels after processing
- Uses only functions from this script and those built into Google Apps Script (no external libaries)
- Has automated testing
- Has basic error handling with email alerts

Starter spreadsheet
- Ready to upload to Google Sheets
- Maintains balances in the Balances tab.


# Setup instructions


_NOTE: My preference was to setup a new Gmail account to host the spreadsheet and script. This felt safer and more organized to me. However, I don't know of any specific safety issues related to using only a single personal Gmail account. Modify setup as needed to use one Gmail account that receives bank alerts directly from the bank and hosts the spreadsheet and script._

### 1. Host Gmail account
Create a new Gmail account.  Use whatever name you like.  I recommend using your personal email as the backup email.

Create two new labels:
- `BankTransactionUpdate`
- `TransactionAdded`

Create a filter to label incoming bank alerts.  Use these settings:
- `From: noreply@becualerts.org`
- `Apply the label: BankTransactionUpdate`
- `Never send it to Spam`

### 2. Bank alerts
Setup bank alerts to consider anything over zero dollars as a large transaction.  Have bank alerts sent to your personal email.

### 3. Personal email
Setup rule to REDIRECT large transaction bank alert emails from your personal email to your new host Gmail account.

### 4. Spreadsheet
In your new host Gmail account, create a new spreadsheet by importing the `bank_email_scraper_starter_spreadsheet.ods` file found in this repo.  You may name the spreadsheet whatever you like.  Do not change the name of the "Transactions" tab/sheet.

You can share the spreadsheet with a personal Gmail account as view only.  This makes it easy to view without any worry of accidental edits.

If you would like to use the automated testing, duplicate the spreadsheet and name it as you like for testing.

### 5. Google Apps Script
Go to Google Apps Script at https://script.google.com/home.  Make sure you are in the host Gmail account.

Create a new project. Name it whatever you like.

Create four script files with the below names. Replace the content of each file with the content from the files in the AppsScript folder in this repo.
- `App.gs`
- `Config.gs`
- `Test.gs`
- `TestData.gs`

Update the code at the top of the `Config.gs` file. Enter your spreadsheet IDs and error email addresses. Google spreadsheet IDs can be found in their URL. I like to have production alert emails sent to my personal email and test alert emails sent to the host email.

### 6. Testing and deployment

Save and deploy.  You will need to allow access and should be prompted to do so.

For automated testing with built-in test data:<br>
Run the `runAllTests` function from the `Test.gs` file. I spot check the test by making sure the transactions sheet was filled up, there is only one pending transaction left in the transaction sheet, and there is only the one intended error (Unexpected content in email) in the log.

For production testing:<br>
Make sure you have some bank alert emails in your host Gmail labeled `BankTransactionUpdate`. Run the `checkForNewAlerts` function from the `App.gs` file. Check the log, spreadsheet, and updated email labels to ensure everything is working correctly.

Add a timed trigger for `checkForNewAlerts`.  I went with every five minutes.

Enjoy and let me know if I missed anything.

