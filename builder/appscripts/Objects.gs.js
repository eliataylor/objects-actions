function callMenuForObjects()
{ popupObjectFields(false);
}



function createNewObjects(objects)
{ //add new objects
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sObjects = ss.getSheetByName("Object Fields");
  if(!sObjects) throw new Error("Sheet 'Object Fields' not found.");
  const colLast = sObjects.getLastColumn();
  var rowLast = null;
  const copyFrom = sObjects.getRange(2,1,3,colLast);

  for(var i=0; i<objects.length; i++)
  { rowLast = sObjects.getLastRow();

    sObjects.appendRow([objects[i]]);
    sObjects.appendRow(["","ID","","Text",1,1]);
    sObjects.appendRow(["","Name","","Text",1,1]);

    copyFrom.copyTo(sObjects.getRange(rowLast+1,1,3),{formatOnly: true});
    //sObjects.getRange(2,1,1).copyTo(sObjects.getRange(rowLast+1,1,1),{formatOnly: true});
    sObjects.getRange(`${rowLast+1}:${rowLast+1}`).setBackground(sObjects.getRange("2:2").getBackground());
    //sObjects.getRange(3,1,1).copyTo(sObjects.getRange(rowLast+2,1,1),{formatOnly: true});
    //sObjects.getRange(`${rowLast+2}:${rowLast+2}`).setBackground(sObjects.getRange("3:3").getBackground());
    //sObjects.getRange(3,1,1).copyTo(sObjects.getRange(rowLast+3,1,1),{formatOnly: true});
    //sObjects.getRange(`${rowLast+3}:${rowLast+3}`).setBackground(sObjects.getRange("3:3").getBackground());
    sObjects.insertRowAfter(rowLast);
  }
}




function popupObjectFields(doPrompt = true)
{ const ui = SpreadsheetApp.getUi();
  let objects;

  // Prompt the user for a comma-separated list of objects
  if(doPrompt)
  { const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Generate Object Fields',
      'Enter a comma-separated list of objects (e.g., Users, Orders, Products, Reports):',
      ui.ButtonSet.OK_CANCEL
    );

    // Handle the user's response
    if (response.getSelectedButton() !== ui.Button.OK) {
      ui.alert('Operation cancelled.');
      return;
    }

    objects = response.getResponseText().split(',').map(obj => obj.trim());
    if (objects.length === 0 || objects.some(obj => obj === '')) {
      ui.alert('Invalid input. Please provide a list of object names.');
      return;
    }
  }else
  { objects = ["Farms", "Bookings", "Reports"];
  }

  //add new objects
  Logger.log("Objects list:\n%s",objects);
  createNewObjects(objects);

  ui.alert('Object Fields generated successfully!');
}




function generateObjectFieldsFromInput()
{ const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sInput = ss.getSheetByName("Inputs");
  if(!sInput) throw new Error("Sheet 'Inputs' not found.");

  //get input data provided by user
  var arrActions = sInput.getRange("A:A").getValues().flat();
  arrActions = arrActions.filter(val => {return val !=""});
  arrActions.shift();

  var arrObjects = sInput.getRange("B:B").getValues().flat();
  arrObjects = arrObjects.filter(val => {return val !=""});
  arrObjects.shift();

  //add new objects
  Logger.log("Actions list:\n%s\n\nObjects list:\n%s",arrActions,arrObjects);
  createNewObjects(arrObjects);

/*
  //create objects in the ObjectFields sheet
  const sObjects = ss.getSheetByName("Object Fields");
  if(!sObjects) throw new Error("Sheet 'Object Fields' not found.");
  var templObjects = sObjects.getDataRange().getValues();
  templObjects.shift();
  var startRow = null;
  var endRow = null;
  if(templObjects.length)
  { Logger.log("exisiting rows in objects sheet: %s",templObjects.length+1);
    for(var i=0; i<templObjects.length; i++)
    { if(!startRow && templObjects[i][0] != "") startRow = i+2;
      else if(startRow && !endRow && templObjects[i][1] == "") endRow = i+2;

      if(startRow && endRow)  break;
    }
    Logger.log("rows for new object template is b/w: %s and %s",startRow,endRow);
    templObjects = sObjects.getRange(startRow,1,endRow-startRow+1,sObjects.getLastColumn());
    Logger.log("template to copy is:\n%s",templObjects.getValues());
  }
*/
}



