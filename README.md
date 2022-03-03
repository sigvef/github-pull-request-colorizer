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
- Change the settings of the project to use your team and signing certificate.
- Build and run the project (`⌘ + r`).
- An empty GUI will pop up - ignore this.
- Go to Safari, open settings (`⌘ + .`), click extensions and enable `github-colorizer-safari`.
- Stop the program running in Xcode and close Xcode. The extension is now available in your Safari.
