/**
 * Geetha Constructions - lead sink.
 *
 * Receives enquiries from the website and appends them to this spreadsheet.
 * Free, owned by the client's own Google account, and exportable because it
 * is already a spreadsheet.
 *
 * Deploy: Extensions > Apps Script, paste this, then Deploy > New deployment
 * > Web app, Execute as "Me", Who has access "Anyone". Copy the /exec URL
 * into ENDPOINT at the top of assets/js/lead-capture.js.
 */

var SHEET_NAME = 'Leads';
var NOTIFY_EMAIL = 'geethaconstructionblr@gmail.com';   // alerted on every new lead

var HEADERS = ['Received', 'Name', 'Phone', 'Email', 'Plot area', 'Stage',
               'Budget', 'Message', 'Page', 'Referrer', 'Status'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = sheet_();
    sh.appendRow([
      new Date(),
      d.name || '', d.phone || '', d.email || '', d.location || '',
      d.stage || '', d.budget || '', d.message || '',
      d.page || '', d.referrer || '',
      'New'
    ]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'New enquiry: ' + (d.name || 'website') + ' - ' + (d.phone || ''),
        body: [
          'Name:   ' + (d.name || '-'),
          'Phone:  ' + (d.phone || '-'),
          'Email:  ' + (d.email || '-'),
          'Plot:   ' + (d.location || '-'),
          'Stage:  ' + (d.stage || '-'),
          'Budget: ' + (d.budget || '-'),
          '',
          (d.message || ''),
          '',
          'Page: ' + (d.page || '-') + '   From: ' + (d.referrer || '-')
        ].join('\n')
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('ok');
}
