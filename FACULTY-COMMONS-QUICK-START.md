# LACCD English Faculty Commons: quick start

The public directory page is already built as `faculty.html`. It will show a friendly setup state until the Faculty Commons Apps Script is connected.

## One-time setup

1. Create a new standalone Google Apps Script project named **LACCD English Faculty Commons**.
2. Keep the file name `Code.gs`.
3. Paste in `faculty-apps-script/Code.gs`.
4. Save and run `setupFacultyCommons()` once.
5. Open the generated private Sheet and the two generated Forms to review them.
6. Deploy the project as a Web app: **Execute as Me**, access **Anyone**.
7. Run `getSetupInfo()`.
8. Paste the returned URLs into this block in `config.js`:

```js
window.LACCD_ENGLISH_FACULTY = {
  feedUrl: "PASTE_WEB_APP_URL_HERE",
  joinUrl: "PASTE_PUBLIC_JOIN_FORM_URL_HERE",
  changeUrl: "PASTE_PUBLIC_UPDATE_REMOVE_FORM_URL_HERE"
};
```

## Normal workflow

**Faculty submits -> private Sheet -> Karen reviews -> Approved = Yes -> profile appears publicly.**

To remove a profile, change Approved to No or blank. Faculty can also use the public update/remove request form.

## Privacy design

- The directory is public and opt-in.
- Verification email stays private unless the faculty member explicitly selects Yes to display it. The form warns that a publicly displayed address may be copied, indexed, or scraped.
- Moderator notes, timestamps, consent records, and change requests are never returned by the public feed.
- No photo is required.
- Adjunct and full-time faculty are presented together in the same directory.

## Change-request verification

Do not update or remove a profile solely because someone submitted the change form. Compare the request with the **original private verification email** in the profile response sheet. If the address does not match, or the requested change is substantial, confirm with the original address before acting.

## Privacy retention

Keep private verification information while the profile is active. After a profile is removed, delete or anonymize the private verification/contact information within **90 days**, unless a legitimate administrative need requires longer retention.

Re-running `setupFacultyCommons()` on an existing installation does not create duplicates; it also reapplies privacy-safe settings to both Faculty Commons Forms.
