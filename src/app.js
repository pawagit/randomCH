const SSID = '14-2Moi9YvR8pipGLInZa2uwm0lpxzNugBBIfstysaeA'; // spreadsheet coordinates are logged to.
const PAGE_TITLE = 'pawaCHbyRandom';
const PAGE_SUBTITLE = 'v1.21';

const TPL_NAME = 'index';

/**
 * Web App doGet() - Main HTTP GET processing function
 */
function doGet(e) {
  
  // Create Template and Add Data
  var tpl = HtmlService.createTemplateFromFile(TPL_NAME);
  tpl.PAGE_TITLE = PAGE_TITLE;
  tpl.PAGE_SUBTITLE = PAGE_SUBTITLE;
 
  // Create HTML Code from Template
  var htmlOutput = tpl.evaluate()
    .setTitle(PAGE_TITLE)
    .setFaviconUrl('https://pawa.ch/favicon.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0,  minimum-scale=1.0, maximum-scale=1.0, user-scalable=no') // viewport for mobile devices
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)  // allow embedding of webapp

  // Return HTML output
  return htmlOutput;
}

/**
 * Custom Function to include content in main Page html output
 * 
 * @param {String} filename - name of file to be included in html template
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}


function getUser() {
  // Try to determine the current user
  var user = Session.getEffectiveUser().getEmail();
  user = (user) ? user.split('@')[0] : '';
  console.log('current user is: ',user)
  return user;
}


/**
 * Saves the data to the spreadsheet
 */
function saveData(dataObj) {
  console.log('SAVE DATA CALLED!')
  
  let res = JSON.parse(dataObj);
  console.log(res)
  let s = (res.user) ? 
    SpreadsheetApp.openById(SSID).getSheetByName('Likes') : 
    SpreadsheetApp.openById(SSID).getSheetByName('Data');
  s.appendRow(res.data);
  
  return 'all done';
}


/**
 * Gets the point data from the spreadsheet, 
 * with MAXROWS as maximum number or rows fetched.
 * It will take the last MAXROWS rows (most recent rows)
 */
function getData(offset) {
  // const NCOLS = 5;
  // let FIRSTROW = 2;

  // const start = new Date();
  // console.log('GET DATA CALLED!')
  

  // // Get the data
  // const ss = SpreadsheetApp.openById(SSID);
  // let s = ss.getSheetByName('Data');
  // FIRSTROW = (offset) ? FIRSTROW + Number(offset) : FIRSTROW;
  // let data = s.getRange(FIRSTROW,1,s.getLastRow()-FIRSTROW+1,NCOLS).getValues();

  const MAXROWS = 10000;
  const NCOLS = 10;
  let FIRSTROW = 2
  
  const start = new Date();
  console.log('GET DATA CALLED!')
  

  // Get the data
  const ss = SpreadsheetApp.openById(SSID);
  let s = ss.getSheetByName('Data');
  let LASTROW = s.getLastRow();
  let NROWS = (LASTROW - FIRSTROW + 1);

  if (NROWS > MAXROWS) {
    console.warn('more data rows than MAXROWS!')
    FIRSTROW = LASTROW - MAXROWS + 1;
    NROWS = MAXROWS;
  }

  let data = s.getRange(FIRSTROW,1,NROWS,NCOLS).getValues();

  // Prepare the Output object
  let out = {};
  data.forEach( (row,i) => {
    if(row[0]) {
      out[new Date(row[0]).valueOf()] = [row[4],row[3],row[8],row[9]];  // LV95 coords, [N,E,Title,Subtitle]
    }
  });
  console.log('it took %s ms to get %s unique elements from %s rows',new Date() - start,Object.keys(out).length,data.length)

  // Get the likes data
  s = ss.getSheetByName('Likes');
  data = s.getRange(2,1,s.getLastRow()-1,NCOLS).getValues();

  let likes = {};
  data.forEach( (row,i) => {
    if(row[0]) {
      likes[new Date(row[0]).valueOf()] = [row[4],row[3],row[8],row[9]];  // LV95 coords, [N,E]
    }
  });
  console.log('it took %s ms to get %s unique likes elements from %s rows',new Date() - start,Object.keys(likes).length,data.length)

  return JSON.stringify({
    positions: out, 
    likes: likes,
    user: getUser()});
}



function convertAllDates() {
  const ss = SpreadsheetApp.openById(SSID);
  let s = ss.getSheetByName('Data');

  let data = s.getRange('A2:A9634').getValues();

  let out = [];
  data.forEach(x => {
    let d = new Date(x[0]);
    out.push([d.valueOf()])
  })

  s.getRange(2,11,out.length,out[0].length).setValues(out)
}

