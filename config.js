/*
  Optional Google Maps enhancement.
  Leave blank to use the built-in manuscript map and Google Maps links.
  If you add a key, restrict it by HTTP referrer in Google Cloud Console.
  Example allowed referrer:
  https://drkarebear.github.io/laccd-english-ddc/*
*/
window.LACCD_GOOGLE_MAPS_API_KEY = "";

/*
  Around the District event feed.
  After running apps-script/setupEventSystem() and deploying the Apps Script
  as a Web app, paste the two public URLs below.

  feedUrl: bare Web app URL ending in /exec
  submitUrl: public Google Form responder URL
*/
window.LACCD_ENGLISH_EVENTS = {
  feedUrl: "",
  submitUrl: ""
};
