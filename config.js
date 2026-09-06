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
  feedUrl: "https://script.google.com/macros/s/AKfycbw1wV-_fdW_6MTQKEnhHCUX3FnlLG5ESFCBq-hiCSLqDmVIu-8jaTCtI6oWlAk1ozFy/exec",
  submitUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdhQcGBi2odyj0Aj0pFjjPSua_aeKBdZKRg2Zn6iF6j57-1Ug/viewform"
};
