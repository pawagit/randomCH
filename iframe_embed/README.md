# Embedding a Google Apps Script Web App
## requires you to think about a few points...

The html template hosting the app in an iframe accounts for the following:
- User login status. If a user is not logged in with google, it will simply alert them an open a login page
- Custom URL rewrite for passed URL parameters (adjust to your needs)
- iframe allow: according to your app's requirements
