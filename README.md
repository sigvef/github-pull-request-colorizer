# GitHub Pull Request Colorizer

WebExtension that tries to colorize lists of pull requests according to some rules.

## Installation

### Google Chrome

To install the project in Google Chrome do the following.

- Clone this repo
- Go to "Settings" in Google Chrome and choose "Extensions".
- Ensure that you have "Developer mode" activated to allow installing and keeping local extensions.
- Click the "Load Unpacked" button.
- Navigate to the folder you cloned this repo into and select it.
- The extension is now installed in Chrome, navigate to the pull request list to see your colorized pull requests.

### Safari

To install the project in safari do the following.

- Clone this repo.
- Open the Xcode project located in `safari-extension/github-colorizer/`.
- Build and run the project (`⌘ + r`).
- An empty GUI will pop up - press the button that says to close the app and open safari extensions.
- Stop the program if it's not stopped yet.
- Go to Safari, open settings `⌘ + .` (this might be open)
- Go to the "Advanced" tab and select "Enable developer menu", as of the time of writing this, it's at the bottom
- Go to your new "Developer" menu and select "Allow unsigned extensions"
- Go back to settings, click extensions and enable `github-colorizer-safari`.
