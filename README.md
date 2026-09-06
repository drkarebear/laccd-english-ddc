# LACCD English DDC faculty commons

This prototype includes the eight manuscript marginalia animals, the `Englishfavicon.png` favicon, the belonging-focused homepage, and a new "Nine Colleges" castle map.

## The map works in two modes

1. **No API key:** The site displays its own accessible illustrated Los Angeles map with nine clickable castle markers. Each college card also links directly to Google Maps.
2. **Optional Google Maps enhancement:** Add a Google Maps JavaScript API key to `config.js`. The same section will switch to a real pannable Google map with the manuscript castle markers on top.

If you use a Google Maps API key on GitHub Pages, restrict the key by HTTP referrer in Google Cloud Console. For this site, the allowed referrer can be:

`https://drkarebear.github.io/laccd-english-ddc/*`

Do not commit an unrestricted key.

## Accessibility

The interactive map is optional. All nine colleges, DDC representatives, email links, and Google Maps links are also available in a standard HTML directory below the map. The map uses cooperative scrolling so it is less likely to trap page scrolling.
