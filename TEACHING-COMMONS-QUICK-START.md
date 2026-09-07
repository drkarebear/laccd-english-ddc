# Teaching Commons quick start

The website side is already built. The only remaining setup is the same Google Apps Script pattern used for Events and Faculty Commons.

1. Go to Google Apps Script and create a **new standalone project** named `LACCD English Teaching Commons`.
2. Open `resources-apps-script/Code.gs` from this repository and paste its full contents into the Apps Script project's `Code.gs`.
3. Run `setupTeachingCommons()` once. Approve the Google Forms and Google Sheets permissions.
4. Open the generated public form and private moderation spreadsheet.
5. In the form settings, confirm:
   - email collection is off
   - sign-in is not required
   - respondents are not limited to one response
6. Submit one test resource. In the private response Sheet, set `Approved` to `Yes`.
7. Deploy the script as a Web app:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Run `getSetupInfo()` and copy the values for `submitUrl` and the bare `webAppUrl` ending in `/exec`.
9. Put those into `config.js`:

```js
window.LACCD_ENGLISH_RESOURCES = {
  feedUrl: "YOUR_WEB_APP_EXEC_URL",
  submitUrl: "YOUR_PUBLIC_FORM_URL"
};
```

10. Upload the updated site to GitHub Pages and open `resources.html`. The approved test resource should appear.

Nothing publishes until you set `Approved` to `Yes`.

## If the Teaching Commons is already set up

Keep the existing Form, Sheet, and `/exec` deployment URL. Replace the Apps Script code with the current `resources-apps-script/Code.gs`, run `repairTeachingCommons()`, then run `diagnoseTeachingCommons()`. If the diagnostic shows a publishable resource count greater than zero, update the existing Web app deployment to a new version rather than creating a separate deployment.
