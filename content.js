function colorizeAnnotations() {
  for (const element of document.querySelectorAll(".check-annotation code")) {
    const div = document.createElement("div");
    div.classList.add("highlight", "highlight-source-diff");
    const pre = element.firstChild;
    const lines = pre.textContent.split("\n");
    div.appendChild(pre);
    element.replaceWith(div);
    pre.removeChild(pre.firstChild);
    for (const line of lines) {
      const span = document.createElement("span");
      span.textContent = line + "\n";
      if (line[0] === "+") {
        span.classList.add("pl-mi1");
      } else if (line[0] === "-") {
        span.classList.add("pl-md");
      } else if (line[0] === "@") {
        span.classList.add("pl-mdr");
      }
      pre.appendChild(span);
    }
  }
}

function colorizePullRequests() {
  function setUpdateNotification(text) {
    const container = document.querySelector(
      ".page-content .Box .Box-header .table-list-header-toggle"
    );
    const notificationElement = document.createElement("div");
    notificationElement.classList.add(
      "github-pull-request-colorizer--notification"
    );
    container.appendChild(notificationElement);
  }

  const onError = () => {
    setUpdateNotification(
      "Checking for github-pull-request-colorizer updates doesn't work in this browser, it seems :/ Consider investigating and making a pull request!"
    );
  };

  fetch(
    "https://api.github.com/repos/sigvef/github-pull-request-colorizer/contents/manifest.json"
  )
    .then((response) => response.json())
    .then((data) => {
      try {
        const localManifest = chrome.runtime.getManifest();
        const masterManifest = JSON.parse(atob(data.content));
        if (masterManifest.version !== localManifest.version) {
          setUpdateNotification(
            "Update for GitHub Pull Request Colorizer is available!"
          );
        }
      } catch {
        onError();
      }
    })
    .catch(onError);

  const me = document
    .querySelector('summary[aria-label="View profile and more"] img.avatar')
    .alt.slice(1);

  const colorMode = document.querySelector("html").dataset.colorMode;
  let darkMode = false;
  if (colorMode === "auto") {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      darkMode = true;
    }
  } else if (colorMode === "dark") {
    darkMode = true;
  }

  [].forEach.call(document.querySelectorAll(".js-issue-row"), (row) => {
    const isPR = !!row.querySelector('[aria-label="Open pull request"]');
    const isDraftPR = !!row.querySelector(
      '[aria-label="Open draft pull request"]'
    );

    row.classList.add("github-pull-request-colorizer--row");
    if (darkMode) {
      row.classList.add("github-pull-request-colorizer--dark-mode");
    }

    const approved =
      (row.querySelector("a.muted-link.tooltipped") || {}).innerText ===
      "Approved";
    const changesRequested =
      (row.querySelector("a.muted-link.tooltipped") || {}).innerText ===
      "Changes requested";
    const reviewRequired = !(approved || changesRequested);
    const assignee = (
      row.querySelector(".from-avatar") || { alt: "" }
    ).alt.slice(1);
    const author = (row.querySelector(".opened-by .Link--muted") || {})
      .innerText;
    const title = (row.querySelector(".Link--primary.h4") || {}).innerText;
    const failsTravis = !!row.querySelector(".commit-build-statuses .text-red");
    const passesTravis = !!row.querySelector(
      ".commit-build-statuses .text-green"
    );
    const priorityLowLabel = row.querySelector(
      '.labels a[title="Priority: Low"]'
    );
    const repositoryElement = row.querySelector(
      "[data-hovercard-type=repository]"
    );
    const informationLineElement = row.querySelector(
      "div.text-small.text-gray"
    );
    const titleElement = row.querySelector(".link-gray-dark.h4");
    const PRIconElement = row.querySelector("div.flex-shrink-0.pt-2.pl-3");
    const repoFullName = (repositoryElement
      ? repositoryElement.innerText
      : ""
    ).trim();
    const buildStatusElement = row.querySelector(".commit-build-statuses");

    const isGreenPR = !!{
      "HyreAS/bed": true,
      "HyreAS/kvi": true,
      "HyreAS/rep": true,
    }[repoFullName.slice(0, 10)];

    if (repositoryElement) {
      const name = repositoryElement.innerText;
      repositoryElement.innerText = name.replace(/^HyreAS\//, "");
      repositoryElement.classList.add(
        "github-pull-request-colorizer--repository"
      );
    }
    if (informationLineElement) {
      informationLineElement.classList.add(
        "github-pull-request-colorizer--information-line"
      );
    }
    if (PRIconElement) {
      PRIconElement.style.display = "none";
    }

    if (titleElement) {
      titleElement.classList.add("github-pull-request-colorizer--title");
    }

    if (buildStatusElement) {
      const parent = buildStatusElement.parentElement;
      if (parent) {
        parent.classList.add(
          "github-pull-request-colorizer--build-status-parent"
        );
      }
    }

    let highlight = false;
    if (failsTravis && author === me) {
      highlight = true;
    }

    if (changesRequested && author === me) {
      highlight = true;
    }

    if (
      !failsTravis &&
      isPR &&
      reviewRequired &&
      author !== me &&
      (assignee === me || assignee === "")
    ) {
      highlight = true;
    }

    if (approved && passesTravis) {
      highlight = true;
    }

    if (title.slice(0, 3) === "WIP") {
      highlight = true;
    }

    if (title.slice(0, 5) === "[WIP]") {
      highlight = true;
    }

    if (title.slice(0, 3) === "WIP" && author != me) {
      highlight = false;
    }

    if (title.slice(0, 5) === "[WIP]" && author != me) {
      highlight = false;
    }

    if (priorityLowLabel) {
      highlight = false;
    }

    if (highlight) {
      row.classList.add("github-pull-request-colorizer--highlight");
    }

    if (isDraftPR) {
      row.classList.add("github-pull-request-colorizer--draft-pr");
    }

    if (isGreenPR) {
      row.classList.add("github-pull-request-colorizer--green-pr");
    }
  });
}

try {
  colorizePullRequests();
} catch (e) {
  console.log(e);
}
try {
  colorizeAnnotations();
} catch (e) {}

document.addEventListener("DOMContentLoaded", colorizePullRequests);
document.addEventListener("DOMContentLoaded", colorizeAnnotations);

setInterval(colorizeAnnotations, 500);
