/**
 * LACCD English DDC Teaching Commons
 * Google Form + private moderation Sheet + public read-only resource feed.
 *
 * FIRST TIME:
 *   Run setupTeachingCommons() once, then deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * EXISTING INSTALLATION:
 *   After replacing this code, run repairTeachingCommons(), then diagnoseTeachingCommons().
 *
 * PRIVACY:
 *   The public feed never returns submitter name, verification email,
 *   permission/consent responses, or moderator notes.
 */

const PUBLIC_CALLBACK = 'LACCDEnglishResourcesReceive';

const RESOURCE_CONFIG = {
  formTitle: 'Share an LACCD English Teaching Resource',
  sheetTitle: 'LACCD English DDC Teaching Commons',
  formDescription:
    'Share an assignment, activity, OER, guide, tool, course idea, or other reusable resource with English colleagues across LACCD.\n\n' +
    'This directory links to public resources rather than uploading or rehosting files. Please share only material you created, have permission to share, or can legally link to as a resource that is already public.\n\n' +
    'Adjunct and full-time faculty are equally welcome to contribute. Nothing publishes automatically. Your verification email stays private.',
  confirmationMessage:
    'Thank you. Your resource was sent for review. Approved resources will appear in the LACCD English Teaching Commons.',
  colleges: [
    'Districtwide / multiple LACCD colleges',
    'East Los Angeles College',
    'Los Angeles City College',
    'Los Angeles Harbor College',
    'Los Angeles Mission College',
    'Los Angeles Pierce College',
    'Los Angeles Southwest College',
    'Los Angeles Trade-Technical College',
    'Los Angeles Valley College',
    'West Los Angeles College',
    'Other / external source'
  ],
  types: [
    'Assignment or activity',
    'Lesson, module, or course material',
    'OER or ZTC resource',
    'Handout, guide, or reference',
    'Teaching tool or website',
    'Accessibility resource',
    'AI or digital pedagogy',
    'Curriculum or course design',
    'Professional learning resource',
    'Other'
  ]
};

const R = {
  timestamp: 'Timestamp',
  title: 'Resource title',
  college: 'College or source',
  type: 'Resource type',
  url: 'Public resource link',
  description: 'What is it and why might another English faculty member use it?',
  courses: 'Course, area, or audience',
  tags: 'Keywords or topics',
  accessibility: 'Accessibility note (optional)',
  credit: 'Public credit or attribution (optional)',
  submitterName: 'Your name',
  verificationEmail: 'Your LACCD or college email for verification (not published)',
  permission: 'Permission to share or link',
  consent: 'Public-posting confirmation',
  approved: 'Approved',
  featured: 'Featured',
  moderatorNotes: 'Moderator Notes'
};

const HEADER_ALIASES = {
  timestamp: ['Timestamp'],
  title: ['Resource title', 'Title', 'Resource name'],
  college: ['College or source', 'College/source', 'College', 'Source'],
  type: ['Resource type', 'Type'],
  url: ['Public resource link', 'Resource link', 'Public link', 'URL', 'Resource URL'],
  description: [
    'What is it and why might another English faculty member use it?',
    'Description',
    'Resource description'
  ],
  courses: [
    'Course, area, or audience',
    'Course / area / audience',
    'Course area or audience',
    'Course or audience'
  ],
  tags: ['Keywords or topics', 'Keywords/topics', 'Keywords', 'Topics', 'Tags'],
  accessibility: ['Accessibility note (optional)', 'Accessibility note', 'Accessibility'],
  credit: [
    'Public credit or attribution (optional)',
    'Public credit or attribution',
    'Public credit',
    'Attribution'
  ],
  submitterName: ['Your name', 'Submitter name', 'Name'],
  verificationEmail: [
    'Your LACCD or college email for verification (not published)',
    'Verification email',
    'Email'
  ],
  permission: ['Permission to share or link', 'Permission'],
  consent: ['Public-posting confirmation', 'Public posting confirmation', 'Consent'],
  approved: ['Approved', 'Approval', 'Publish', 'Published'],
  featured: ['Featured', 'Feature'],
  moderatorNotes: ['Moderator Notes', 'Moderator notes', 'Notes']
};

function setupTeachingCommons() {
  const props = PropertiesService.getScriptProperties();

  // Protect an existing installation from duplicate Form/Sheet creation.
  if (props.getProperty('RESOURCE_FORM_ID') && props.getProperty('RESOURCE_SHEET_ID')) {
    Logger.log('Existing installation found. Repairing it instead of creating duplicates.');
    return repairTeachingCommons();
  }

  const ss = SpreadsheetApp.create(RESOURCE_CONFIG.sheetTitle);
  const form = FormApp.create(RESOURCE_CONFIG.formTitle);

  form
    .setDescription(RESOURCE_CONFIG.formDescription)
    .setConfirmationMessage(RESOURCE_CONFIG.confirmationMessage)
    .setCollectEmail(false)
    .setPublishingSummary(false)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setProgressBar(true)
    .setShowLinkToRespondAgain(true);

  if (
    typeof form.supportsAdvancedResponderPermissions === 'function' &&
    form.supportsAdvancedResponderPermissions()
  ) {
    form.setPublished(true);
  } else {
    form.setAcceptingResponses(true);
  }

  form.addTextItem()
    .setTitle(R.title)
    .setHelpText('Use the title colleagues should see in the public directory.')
    .setRequired(true);

  form.addListItem()
    .setTitle(R.college)
    .setChoiceValues(RESOURCE_CONFIG.colleges)
    .setRequired(true);

  form.addListItem()
    .setTitle(R.type)
    .setChoiceValues(RESOURCE_CONFIG.types)
    .setRequired(true);

  const urlValidation = FormApp.createTextValidation()
    .requireTextIsUrl()
    .setHelpText(
      'Enter a complete public URL. Prefer https://. Do not submit private Canvas links, passwords, or links that expose student information.'
    )
    .build();

  form.addTextItem()
    .setTitle(R.url)
    .setHelpText(
      'Use a public or intentionally shared link. The Teaching Commons will link to it rather than copy or host the file.'
    )
    .setValidation(urlValidation)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle(R.description)
    .setHelpText('One to three plain-language sentences is ideal.')
    .setRequired(true);

  form.addTextItem()
    .setTitle(R.courses)
    .setHelpText(
      'Examples: ENGL C1000, creative writing, literature, multilingual writers, all English faculty.'
    )
    .setRequired(false);

  form.addTextItem()
    .setTitle(R.tags)
    .setHelpText('Optional. Separate a few useful search terms with commas.')
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle(R.accessibility)
    .setHelpText(
      'Optional. Note known accessibility features, limitations, or remediation still needed. Please do not claim full compliance unless you have verified it.'
    )
    .setRequired(false);

  form.addTextItem()
    .setTitle(R.credit)
    .setHelpText(
      'Optional public wording, such as Karen Crozer, LAMC or Writing Center at X College. Leave blank if you do not want submitter credit shown.'
    )
    .setRequired(false);

  form.addTextItem()
    .setTitle(R.submitterName)
    .setHelpText('Used for moderation and follow-up. This field is not returned by the public feed.')
    .setRequired(true);

  const emailValidation = FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText('Enter a valid LACCD or college email address.')
    .build();

  form.addTextItem()
    .setTitle(R.verificationEmail)
    .setHelpText('Used only to verify or follow up on the submission. This is not published.')
    .setValidation(emailValidation)
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(R.permission)
    .setChoiceValues([
      'I created this resource or have permission to share this public link.',
      'I am linking to a resource that is already public and was created by someone else.'
    ])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle(R.consent)
    .setChoiceValues([
      'I understand that the title, description, public link, college/source, resource type, course/area, keywords, accessibility note, and any public credit I entered may appear on a public website after review.'
    ])
    .setRequired(true);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  Utilities.sleep(2000);

  const responseSheet = resolveResponseSheet_(ss);
  addModeratorColumns_(responseSheet);
  formatSheet_(responseSheet);

  props.setProperties({
    RESOURCE_FORM_ID: form.getId(),
    RESOURCE_SHEET_ID: ss.getId(),
    RESOURCE_RESPONSE_SHEET_NAME: responseSheet.getName()
  });

  createSetupSheet_(ss, form, responseSheet);

  const info = getSetupInfo_();
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

/**
 * Repairs the CURRENT installation.
 * It does not create a new Form or Sheet and does not delete responses.
 */
function repairTeachingCommons() {
  const props = PropertiesService.getScriptProperties();
  const formId = props.getProperty('RESOURCE_FORM_ID');
  const sheetId = props.getProperty('RESOURCE_SHEET_ID');

  if (!formId || !sheetId) {
    throw new Error(
      'Existing Form/Sheet IDs are missing from Script Properties. Do not run this repair in a different Apps Script project.'
    );
  }

  const ss = SpreadsheetApp.openById(sheetId);
  const form = FormApp.openById(formId);
  form.setCollectEmail(false);
  form.setPublishingSummary(false);
  form.setAllowResponseEdits(false);
  const responseSheet = resolveResponseSheet_(ss);

  addModeratorColumns_(responseSheet);
  formatSheet_(responseSheet);
  props.setProperty('RESOURCE_RESPONSE_SHEET_NAME', responseSheet.getName());
  createSetupSheet_(ss, form, responseSheet);
  SpreadsheetApp.flush();

  const info = getSetupInfo_();
  Logger.log('Teaching Commons repair complete.');
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

function getSetupInfo() {
  const info = getSetupInfo_();
  Logger.log(JSON.stringify(info, null, 2));
  return info;
}

function getSetupInfo_() {
  const props = PropertiesService.getScriptProperties();
  const formId = props.getProperty('RESOURCE_FORM_ID');
  const sheetId = props.getProperty('RESOURCE_SHEET_ID');
  const sheetName = props.getProperty('RESOURCE_RESPONSE_SHEET_NAME') || '';
  const form = formId ? FormApp.openById(formId) : null;
  const webAppUrl = ScriptApp.getService().getUrl() || '';

  return {
    submitUrl: form ? form.getPublishedUrl() : '',
    formEditUrl: form ? form.getEditUrl() : '',
    sheetUrl: sheetId
      ? 'https://docs.google.com/spreadsheets/d/' + sheetId + '/edit'
      : '',
    responseSheetName: sheetName,
    webAppUrl: webAppUrl,
    feedUrl: webAppUrl ? webAppUrl + '?action=resources' : ''
  };
}

function doGet(e) {
  const action = String(
    (e && e.parameter && e.parameter.action) || 'resources'
  ).toLowerCase();

  const callback = String(
    (e && e.parameter && e.parameter.callback) || ''
  );

  if (action === 'health') {
    return publicResponse_(
      {
        ok: true,
        service: 'laccd-english-teaching-commons',
        time: new Date().toISOString()
      },
      callback
    );
  }

  if (action !== 'resources') {
    return publicResponse_({ ok: false, error: 'Unknown action.' }, callback);
  }

  return publicResponse_(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      resources: getPublicResources_()
    },
    callback
  );
}

function getPublicResources_() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('RESOURCE_SHEET_ID');
  if (!sheetId) return [];

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = resolveResponseSheet_(ss);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getDisplayValues();
  const index = buildHeaderIndex_(values[0]);
  const out = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];

    if (!isYes_(field_(row, index, 'approved'))) continue;

    const title = cleanText_(field_(row, index, 'title'));
    const url = safeHttpUrl_(field_(row, index, 'url'));

    if (!title || !url) continue;

    const college = cleanText_(field_(row, index, 'college'));
    const timestamp = cleanText_(field_(row, index, 'timestamp'));

    out.push({
      id: 'res-' + shortHash_([timestamp || r, title, college].join('|')),
      title: title,
      college: college,
      type: cleanText_(field_(row, index, 'type')),
      url: url,
      description: cleanText_(field_(row, index, 'description')),
      courses: cleanText_(field_(row, index, 'courses')),
      tags: splitTags_(field_(row, index, 'tags')),
      accessibility: cleanText_(field_(row, index, 'accessibility')),
      credit: cleanText_(field_(row, index, 'credit')),
      featured: isYes_(field_(row, index, 'featured'))
    });
  }

  out.sort(function(a, b) {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  return out;
}

function publicResponse_(payload, callback) {
  const json = JSON.stringify(payload);

  if (callback === PUBLIC_CALLBACK) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Safe diagnostic. It logs counts only, never private submitter data.
 */
function diagnoseTeachingCommons() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('RESOURCE_SHEET_ID');

  if (!sheetId) {
    throw new Error('RESOURCE_SHEET_ID is missing from Script Properties.');
  }

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = resolveResponseSheet_(ss);
  const values = sheet.getDataRange().getDisplayValues();
  const index = buildHeaderIndex_(values.length ? values[0] : []);

  const missingRequiredHeaders = ['title', 'url', 'approved'].filter(function(key) {
    return findHeaderColumn_(index, key) === -1;
  });

  let submittedRows = 0;
  let approvedRows = 0;
  let publishableRows = 0;
  let approvedMissingTitle = 0;
  let approvedWithUnusableUrl = 0;

  for (let r = 1; r < values.length; r++) {
    const row = values[r];

    if (!row.some(function(v) { return cleanText_(v) !== ''; })) continue;
    submittedRows++;

    if (!isYes_(field_(row, index, 'approved'))) continue;
    approvedRows++;

    const title = cleanText_(field_(row, index, 'title'));
    const url = safeHttpUrl_(field_(row, index, 'url'));

    if (!title) {
      approvedMissingTitle++;
      continue;
    }

    if (!url) {
      approvedWithUnusableUrl++;
      continue;
    }

    publishableRows++;
  }

  const report = {
    spreadsheet: ss.getName(),
    responseSheet: sheet.getName(),
    submittedRows: submittedRows,
    approvedRows: approvedRows,
    publishableRows: publishableRows,
    approvedMissingTitle: approvedMissingTitle,
    approvedWithUnusableUrl: approvedWithUnusableUrl,
    missingRequiredHeaders: missingRequiredHeaders,
    publicFeedCount: getPublicResources_().length
  };

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function resolveResponseSheet_(ss) {
  const props = PropertiesService.getScriptProperties();
  const storedName = props.getProperty('RESOURCE_RESPONSE_SHEET_NAME');

  if (storedName) {
    const stored = ss.getSheetByName(storedName);
    if (stored) return stored;
  }

  const formResponseSheet = ss.getSheets().find(function(sheet) {
    return /^Form Responses/i.test(sheet.getName());
  });

  if (formResponseSheet) {
    props.setProperty(
      'RESOURCE_RESPONSE_SHEET_NAME',
      formResponseSheet.getName()
    );
    return formResponseSheet;
  }

  const candidate = ss.getSheets().find(function(sheet) {
    if (sheet.getLastColumn() < 1) return false;

    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getDisplayValues()[0];

    const index = buildHeaderIndex_(headers);

    return (
      findHeaderColumn_(index, 'title') !== -1 &&
      findHeaderColumn_(index, 'url') !== -1
    );
  });

  if (candidate) {
    props.setProperty(
      'RESOURCE_RESPONSE_SHEET_NAME',
      candidate.getName()
    );
    return candidate;
  }

  throw new Error(
    'Could not locate the Google Form response sheet in the Teaching Commons spreadsheet.'
  );
}

function addModeratorColumns_(sheet) {
  ensureColumn_(sheet, 'approved', R.approved);
  ensureColumn_(sheet, 'featured', R.featured);
  ensureColumn_(sheet, 'moderatorNotes', R.moderatorNotes);

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getDisplayValues()[0];

  const index = buildHeaderIndex_(headers);

  ['approved', 'featured'].forEach(function(key) {
    const zeroBasedColumn = findHeaderColumn_(index, key);
    if (zeroBasedColumn === -1) return;

    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Yes', 'No'], true)
      .setAllowInvalid(false)
      .build();

    sheet
      .getRange(
        2,
        zeroBasedColumn + 1,
        Math.max(sheet.getMaxRows() - 1, 1),
        1
      )
      .setDataValidation(rule);
  });
}

function ensureColumn_(sheet, key, preferredHeader) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);

  const headers = sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0];

  const index = buildHeaderIndex_(headers);
  if (findHeaderColumn_(index, key) !== -1) return;

  sheet
    .getRange(1, sheet.getLastColumn() + 1)
    .setValue(preferredHeader);
}

function formatSheet_(sheet) {
  sheet.setFrozenRows(1);

  sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setWrap(true);

  sheet.getDataRange().setVerticalAlignment('top');
  sheet.autoResizeColumns(1, Math.min(sheet.getLastColumn(), 8));
}

function createSetupSheet_(ss, form, responseSheet) {
  let setup = ss.getSheetByName('SETUP');
  if (!setup) setup = ss.insertSheet('SETUP', 0);

  setup.clear();

  const webAppUrl = ScriptApp.getService().getUrl() || '';

  const rows = [
    ['LACCD English DDC Teaching Commons', ''],
    ['Public resource submission form', form.getPublishedUrl()],
    ['Edit the Google Form', form.getEditUrl()],
    ['Private moderation sheet', ss.getUrl()],
    ['Response sheet tab', responseSheet.getName()],
    ['Public web app', webAppUrl || 'Deploy the Apps Script project as a Web app.'],
    ['Public feed', webAppUrl ? webAppUrl + '?action=resources' : 'Deploy the Apps Script project first.'],
    ['How to publish', 'Set Approved to Yes. Nothing publishes automatically.'],
    ['Moderator check', 'Before approval: open the public link; confirm permission/attribution; check for student or private information; keep accessibility claims specific and cautious; make sure the title and description are useful to another faculty member.'],
    ['Privacy', 'Verification email, private submitter name, permission response, consent, and moderator notes are never returned by the public feed.'],
    ['Copyright', 'The directory links out rather than rehosting files. Review submissions for permission and attribution before approving.'],
    ['Accessibility', 'Accessibility notes may be displayed publicly when provided. Avoid representing a resource as fully accessible without verification.'],
    ['Repair', 'If approved resources do not appear, run repairTeachingCommons(), then diagnoseTeachingCommons().']
  ];

  setup.getRange(1, 1, rows.length, 2).setValues(rows);
  setup.getRange(1, 1, 1, 2).merge().setFontWeight('bold').setFontSize(14);
  setup.setFrozenRows(1);
  setup.setColumnWidth(1, 220);
  setup.setColumnWidth(2, 650);
  setup.getDataRange().setWrap(true).setVerticalAlignment('top');
}

function normalizeHeader_(value) {
  return String(value == null ? '' : value)
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildHeaderIndex_(headers) {
  const index = {};

  headers.forEach(function(header, i) {
    const normalized = normalizeHeader_(header);

    if (normalized && typeof index[normalized] !== 'number') {
      index[normalized] = i;
    }
  });

  return index;
}

function findHeaderColumn_(index, key) {
  const aliases = HEADER_ALIASES[key] || [];

  for (let i = 0; i < aliases.length; i++) {
    const normalized = normalizeHeader_(aliases[i]);

    if (typeof index[normalized] === 'number') {
      return index[normalized];
    }
  }

  return -1;
}

function field_(row, index, key) {
  const column = findHeaderColumn_(index, key);
  return column === -1 ? '' : row[column];
}

function isYes_(value) {
  if (value === true) return true;

  return /^(yes|y|true|approved|1)$/i.test(
    cleanText_(value)
  );
}

function cleanText_(value) {
  return String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Accepts HTTPS URLs only. If someone entered a normal domain without a
 * scheme, the feed adds https://. HTTP and other schemes are rejected.
 */
function safeHttpUrl_(value) {
  let url = cleanText_(value);
  if (!url) return '';

  if (!/^https:\/\//i.test(url)) {
    if (/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:[/:?#].*)?$/i.test(url)) {
      url = 'https://' + url;
    } else {
      return '';
    }
  }

  return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
}

function splitTags_(value) {
  return cleanText_(value)
    .split(/[,;|]/)
    .map(function(v) { return v.trim(); })
    .filter(Boolean)
    .slice(0, 12);
}

function shortHash_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );

  return bytes
    .slice(0, 8)
    .map(function(b) {
      return ('0' + ((b + 256) % 256).toString(16)).slice(-2);
    })
    .join('');
}
