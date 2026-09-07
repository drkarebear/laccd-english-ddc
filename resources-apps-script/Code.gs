/**
 * LACCD English DDC Teaching Commons
 * Google Form + private Sheet + public read-only resource feed.
 *
 * Run setupTeachingCommons() once from a standalone Apps Script project.
 * Then deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Only rows marked Approved = Yes are returned by doGet().
 * Verification emails, private submitter names, consent records, and moderator notes are never public.
 */
const RESOURCE_CONFIG={
  formTitle:'Share an LACCD English Teaching Resource',
  sheetTitle:'LACCD English DDC Teaching Commons',
  formDescription:
    'Share an assignment, activity, OER, guide, tool, course idea, or other reusable resource with English colleagues across LACCD.\n\n'+
    'This directory links to public resources rather than uploading or rehosting files. Please share only material you created, have permission to share, or can legally link to as an already-public resource.\n\n'+
    'Adjunct and full-time faculty are equally welcome to contribute. Nothing publishes automatically. Your verification email stays private.',
  confirmationMessage:'Thank you. Your resource was sent for review. Approved resources will appear in the LACCD English Teaching Commons.',
  colleges:[
    'Districtwide / multiple LACCD colleges','East Los Angeles College','Los Angeles City College','Los Angeles Harbor College','Los Angeles Mission College','Los Angeles Pierce College','Los Angeles Southwest College','Los Angeles Trade-Technical College','Los Angeles Valley College','West Los Angeles College','Other / external source'
  ],
  types:[
    'Assignment or activity','Lesson, module, or course material','OER or ZTC resource','Handout, guide, or reference','Teaching tool or website','Accessibility resource','AI or digital pedagogy','Curriculum or course design','Professional learning resource','Other'
  ]
};
const R={
  timestamp:'Timestamp',title:'Resource title',college:'College or source',type:'Resource type',url:'Public resource link',description:'What is it and why might another English faculty member use it?',courses:'Course, area, or audience',tags:'Keywords or topics',accessibility:'Accessibility note (optional)',credit:'Public credit or attribution (optional)',submitterName:'Your name',verificationEmail:'Your LACCD or college email for verification (not published)',permission:'Permission to share or link',consent:'Public-posting confirmation',approved:'Approved',featured:'Featured',moderatorNotes:'Moderator Notes'
};
function setupTeachingCommons(){
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty('RESOURCE_FORM_ID')&&props.getProperty('RESOURCE_SHEET_ID')){const existing=getSetupInfo_();Logger.log(JSON.stringify(existing,null,2));return existing;}
  const ss=SpreadsheetApp.create(RESOURCE_CONFIG.sheetTitle);
  const form=FormApp.create(RESOURCE_CONFIG.formTitle);
  form.setDescription(RESOURCE_CONFIG.formDescription);form.setConfirmationMessage(RESOURCE_CONFIG.confirmationMessage);form.setCollectEmail(false);form.setLimitOneResponsePerUser(false);form.setProgressBar(true);form.setShowLinkToRespondAgain(true);
  if(form.supportsAdvancedResponderPermissions())form.setPublished(true);else form.setAcceptingResponses(true);
  form.addTextItem().setTitle(R.title).setHelpText('Use the title colleagues should see in the public directory.').setRequired(true);
  form.addListItem().setTitle(R.college).setChoiceValues(RESOURCE_CONFIG.colleges).setRequired(true);
  form.addListItem().setTitle(R.type).setChoiceValues(RESOURCE_CONFIG.types).setRequired(true);
  const urlValidation=FormApp.createTextValidation().requireTextIsUrl().setHelpText('Enter a complete public https:// URL. Do not submit private Canvas links, passwords, or links that expose student information.').build();
  form.addTextItem().setTitle(R.url).setHelpText('Use a public or intentionally shared link. The Teaching Commons will link to it rather than copy or host the file.').setValidation(urlValidation).setRequired(true);
  form.addParagraphTextItem().setTitle(R.description).setHelpText('One to three plain-language sentences is ideal.').setRequired(true);
  form.addTextItem().setTitle(R.courses).setHelpText('Examples: ENGL C1000, creative writing, literature, multilingual writers, all English faculty.').setRequired(false);
  form.addTextItem().setTitle(R.tags).setHelpText('Optional. Separate a few useful search terms with commas.').setRequired(false);
  form.addParagraphTextItem().setTitle(R.accessibility).setHelpText('Optional. Note known accessibility features, limitations, or remediation still needed. Please do not claim full compliance unless you have verified it.').setRequired(false);
  form.addTextItem().setTitle(R.credit).setHelpText('Optional public wording, such as Karen Crozer, LAMC or Writing Center at X College. Leave blank if you do not want submitter credit shown.').setRequired(false);
  form.addTextItem().setTitle(R.submitterName).setHelpText('Used for moderation and follow-up. This field is not returned by the public feed.').setRequired(true);
  const emailValidation=FormApp.createTextValidation().requireTextIsEmail().setHelpText('Enter a valid LACCD or college email address.').build();
  form.addTextItem().setTitle(R.verificationEmail).setHelpText('Used only to verify or follow up on the submission. This is not published.').setValidation(emailValidation).setRequired(true);
  form.addMultipleChoiceItem().setTitle(R.permission).setChoiceValues([
    'I created this resource or have permission to share this public link.',
    'I am linking to an already-public resource created by someone else.'
  ]).setRequired(true);
  form.addCheckboxItem().setTitle(R.consent).setChoiceValues(['I understand that the title, description, public link, college/source, resource type, course/area, keywords, accessibility note, and any public credit I entered may appear on a public website after review.']).setRequired(true);
  form.setDestination(FormApp.DestinationType.SPREADSHEET,ss.getId());SpreadsheetApp.flush();Utilities.sleep(1500);
  const responseSheet=getResponseSheet_(ss);addModeratorColumns_(responseSheet);formatSheet_(responseSheet);createSetupSheet_(ss,form,responseSheet);
  props.setProperties({RESOURCE_FORM_ID:form.getId(),RESOURCE_SHEET_ID:ss.getId(),RESOURCE_RESPONSE_SHEET_NAME:responseSheet.getName()});
  const info=getSetupInfo_();Logger.log(JSON.stringify(info,null,2));return info;
}
function getSetupInfo(){const info=getSetupInfo_();Logger.log(JSON.stringify(info,null,2));return info;}
function getSetupInfo_(){
  const props=PropertiesService.getScriptProperties(),formId=props.getProperty('RESOURCE_FORM_ID'),sheetId=props.getProperty('RESOURCE_SHEET_ID');
  const form=formId?FormApp.openById(formId):null,webAppUrl=ScriptApp.getService().getUrl()||'';
  return{submitUrl:form?form.getPublishedUrl():'',formEditUrl:form?form.getEditUrl():'',sheetUrl:sheetId?'https://docs.google.com/spreadsheets/d/'+sheetId+'/edit':'',webAppUrl:webAppUrl,feedUrl:webAppUrl?webAppUrl+'?action=resources':''};
}
function doGet(e){
  const action=String((e&&e.parameter&&e.parameter.action)||'resources').toLowerCase(),callback=String((e&&e.parameter&&e.parameter.callback)||'');
  if(action==='health')return publicResponse_({ok:true,service:'laccd-english-teaching-commons',time:new Date().toISOString()},callback);
  if(action!=='resources')return publicResponse_({ok:false,error:'Unknown action.'},callback);
  return publicResponse_({ok:true,generatedAt:new Date().toISOString(),resources:getPublicResources_()},callback);
}
function getPublicResources_(){
  const props=PropertiesService.getScriptProperties(),sheetId=props.getProperty('RESOURCE_SHEET_ID'),sheetName=props.getProperty('RESOURCE_RESPONSE_SHEET_NAME');if(!sheetId||!sheetName)return[];
  const sheet=SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);if(!sheet||sheet.getLastRow()<2)return[];
  const values=sheet.getDataRange().getValues(),headers=values[0].map(v=>String(v).trim()),index=headerIndex_(headers),out=[];
  for(let r=1;r<values.length;r++){
    const row=values[r];if(!isYes_(cell_(row,index,R.approved)))continue;
    const title=cleanText_(cell_(row,index,R.title)),url=safeHttpUrl_(cell_(row,index,R.url));if(!title||!url)continue;
    const submittedAt=cell_(row,index,R.timestamp),college=cleanText_(cell_(row,index,R.college));
    out.push({id:'res-'+shortHash_([(submittedAt instanceof Date?submittedAt.getTime():r),title,college].join('|')),title:title,college:college,type:cleanText_(cell_(row,index,R.type)),url:url,description:cleanText_(cell_(row,index,R.description)),courses:cleanText_(cell_(row,index,R.courses)),tags:splitTags_(cell_(row,index,R.tags)),accessibility:cleanText_(cell_(row,index,R.accessibility)),credit:cleanText_(cell_(row,index,R.credit)),featured:isYes_(cell_(row,index,R.featured))});
  }
  out.sort((a,b)=>a.title.localeCompare(b.title));return out;
}
function publicResponse_(payload,callback){const json=JSON.stringify(payload);if(callback&&/^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(callback))return ContentService.createTextOutput(callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);}
function getResponseSheet_(ss){const sheet=ss.getSheets().find(s=>/^Form Responses/i.test(s.getName()));if(!sheet)throw new Error('The Google Form response sheet was not created.');return sheet;}
function addModeratorColumns_(sheet){const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);[R.approved,R.featured,R.moderatorNotes].forEach(h=>{if(!headers.includes(h)){sheet.getRange(1,sheet.getLastColumn()+1).setValue(h);headers.push(h);}});const finalHeaders=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);[R.approved,R.featured].forEach(h=>{const c=finalHeaders.indexOf(h)+1;if(c>0){const rule=SpreadsheetApp.newDataValidation().requireValueInList(['Yes','No'],true).setAllowInvalid(false).build();sheet.getRange(2,c,Math.max(sheet.getMaxRows()-1,1),1).setDataValidation(rule);}});}
function formatSheet_(sheet){sheet.setFrozenRows(1);sheet.getRange(1,1,1,sheet.getLastColumn()).setFontWeight('bold').setWrap(true);sheet.getDataRange().setVerticalAlignment('top');sheet.autoResizeColumns(1,Math.min(sheet.getLastColumn(),8));}
function createSetupSheet_(ss,form,responseSheet){let setup=ss.getSheetByName('SETUP');if(!setup)setup=ss.insertSheet('SETUP',0);setup.clear();const rows=[['LACCD English DDC Teaching Commons',''],['Public resource submission form',form.getPublishedUrl()],['Edit the Google Form',form.getEditUrl()],['Private moderation sheet',ss.getUrl()],['Response sheet tab',responseSheet.getName()],['How to publish','Set Approved to Yes. Nothing publishes automatically.'],['Privacy','Verification email, private submitter name, permission response, consent, and moderator notes are never returned by the public feed.'],['Copyright','The directory links out rather than rehosting files. Review submissions for permission and attribution before approving.'],['Accessibility','Accessibility notes may be displayed publicly when provided. Avoid representing a resource as fully accessible without verification.'],['Next step','Deploy this script as a Web app. Execute as Me. Allow Anyone. Then run getSetupInfo() and copy submitUrl and webAppUrl into config.js.']];setup.getRange(1,1,rows.length,2).setValues(rows);setup.getRange(1,1,1,2).merge().setFontWeight('bold').setFontSize(14);setup.setFrozenRows(1);setup.setColumnWidth(1,220);setup.setColumnWidth(2,650);setup.getDataRange().setWrap(true).setVerticalAlignment('top');}
function headerIndex_(headers){const out={};headers.forEach((h,i)=>{out[String(h).trim()]=i;});return out;}
function cell_(row,index,header){const i=index[header];return typeof i==='number'?row[i]:'';}
function isYes_(value){if(value===true)return true;return/^(yes|y|true|approved|1)$/i.test(String(value||'').trim());}
function cleanText_(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
function safeHttpUrl_(value){const url=cleanText_(value);return/^https:\/\//i.test(url)?url:'';}
function splitTags_(value){return cleanText_(value).split(/[,;|]/).map(v=>v.trim()).filter(Boolean).slice(0,12);}
function shortHash_(value){const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8);return bytes.slice(0,8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
