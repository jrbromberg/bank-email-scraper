# What is this?

This is a free and safe solution for pulling bank account transactions into a google spreadsheet that you can customize.

No bank login information required.  This works by scraping emails.

This is made to work with BECU but could be modified to work with any bank that can send email alerts for all transactions.

# Features

* Code for Google Apps Script
* A simple starter spreadsheet to upload to Google Sheets
* Setup instructions

# Setup

_NOTE: My preference was to setup a new Gmail account to host the spreadsheet and script. This felt safer to me but I don't see an issue with using only a personal Gmail account.  Modify setup as needed to use one Gmail account that receives bank alerts directly from the bank and hosts the spreadsheet and script._

### 1. Host gmail account
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
In your new host Gmail account, create a new spreadsheet by importing the "bank-email-scraper starter spreadsheet.ods" file found in this repo.  You may name the spreadsheet whatever you like.  Do not change the name of the "Transactions" tab/sheet.

You can share the spreadsheet with a personal Gmail account as view only.  This makes it easy to view without any worry of accidentally making edits.

### 5. Google Apps Script
Go to Google Apps Script at https://script.google.com/home.  Make sure you are in the host Gmail account.

Create a new project. Name it whatever you like.

Paste the code from Code.gs in this repo into the Code.gs file.  Update the code in the first two lines.  Enter your spreadsheet ID which can be found in the spreadsheet URL.  Enter your personal email for error emails.

Save and deploy.  You will need to allow access and should be prompted to do so.
