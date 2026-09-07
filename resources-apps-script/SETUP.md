# Teaching Commons setup

1. Create a new standalone Google Apps Script project named **LACCD English Teaching Commons**.
2. Replace its `Code.gs` with the included `resources-apps-script/Code.gs`.
3. In Project Settings, use the `appsscript.json` manifest if desired.
4. Run `setupTeachingCommons()` once and approve the requested Google Forms/Sheets permissions.
5. Open the generated form and private spreadsheet. Confirm the form does **not** collect email automatically and does **not** require sign-in.
6. In the private response sheet, test one submission. Set `Approved` to `Yes` only after checking the public link, sharing permission, attribution, student privacy, and obvious accessibility concerns.
7. Deploy the Apps Script as a Web app: **Execute as Me** and **Who has access: Anyone**.
8. Run `getSetupInfo()`. Copy the bare Web app URL ending in `/exec` and the public form URL.
9. Put them in `config.js` under `window.LACCD_ENGLISH_RESOURCES`.
10. Open `resources.html` and confirm the approved test resource appears.

## Existing installation

If the Form and moderation Sheet already exist, do **not** run `setupTeachingCommons()` again. After replacing the Apps Script code, run `repairTeachingCommons()`, then `diagnoseTeachingCommons()`. The diagnostic reports counts only and does not log private submitter information.

## Moderator checklist

Before setting `Approved` to `Yes`, check that:

- the public link opens without requiring a private class login or exposing student information
- the submitter created the resource, has permission to share it, or is intentionally linking to a resource that is already public
- attribution is clear when needed
- the title and description tell another faculty member what the resource is and why it may be useful
- accessibility claims are cautious and specific; do not label something fully accessible unless that has been verified
- the resource is appropriate for a public, districtwide faculty directory

Use `Featured = Yes` sparingly for resources you want to surface more prominently.

## Moderation rule

Nothing publishes automatically. The public feed returns only rows with `Approved = Yes`. It does not return verification emails, private submitter names, permission responses, consent records, or moderator notes.

## Why links instead of uploads

The Teaching Commons is a directory, not a file host. Linking to intentionally public resources keeps ownership and revision control with the original creator, avoids collecting student data or document metadata, and reduces copyright and privacy risk.
