/** @OnlyCurrentDoc */

function onOpen()
{ const ui = SpreadsheetApp.getUi();
  ui.createMenu("Wizard")
    .addItem('Generate Object Fields', 'popupObjectFields')
    .addItem('Generate Permissions Matrix', 'popupPermissionsMatrix')
    .addToUi();
}
