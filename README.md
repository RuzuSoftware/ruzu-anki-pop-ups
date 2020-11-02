
# Ruzu Anki Pop-ups

Ruzu Anki Pop-ups is a Chrome extension that periodically presents Anki cards via notifications
This Chrome extension allows you to review Anki decks whilst working on other important tasks by harnessing the power of desktop notifications! Cards from your chosen deck will periodically pop up for you to review.

Some of the main features include:
- Deck select
- Set how often cards pop up (every 5 mins, 10 mins etc)
- Turn on and off with the flick of a switch
- Check the status of the app with a glance (pop-ups enabled/disabled etc)
- Shortcuts to to enable / disable pop-ups or show the next card early
- Currently supports text based Anki decks and models only.
- Configure how card fields are displayed for each model.

### Requirements
Ruzu Anki Pop-ups requires the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) Anki plugin to be installed in order to function. More technical information on AnkiConnect can be found in the [AnkiConnect Github Repo](https://github.com/FooSoft/anki-connect).

## Chrome Web Store
The extension can be installed for free by visiting the Chrome Web Store via this [link](https://chrome.google.com/webstore/detail/ruzu-anki-pop-ups/mpjdjilfcgmndfnailloidpemknemeno)

## Development

### Getting Started
Ruzu Anki Pop-ups can was developed using [Chrome Extension generator (v0.6.1)](https://github.com/yeoman/generator-chrome-extension/tree/v0.6.1) and can be built locally using glup and loaded into Chrome web browser as an 'unpacked extension' for local testing.

### Initial setup
- Ensure `gulp` and `bower` are installed on your system
`npm install --global yo gulp bower`

- Install local requirements
`npm install && bower install`

### Build extension
To build the extension locally as an 'unpacked extension' in the `dist` directory, use the following command:
`gulp` or `gulp build`

Use watch command to update source continuously
`gulp watch`

Package code into a zip, ready for publishing
`gulp package`
