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
    const prIcon = row.querySelector("svg.octicon-git-pull-request");
    const draftPrIcon = row.querySelector("svg.octicon-git-pull-request-draft");
    const isPR = !!prIcon || !!draftPrIcon;
    const isDraftPR = !!draftPrIcon;

    row.classList.add("github-pull-request-colorizer--row");
    if (darkMode) {
      row.classList.add("github-pull-request-colorizer--dark-mode");
    }

    const hasDeferredContent =
      row.querySelector("batch-deferred-content") !== null;

    const approved =
      (row.querySelector("a.Link--muted.tooltipped") || {}).innerText ===
      "Approved";
    const changesRequested =
      (row.querySelector("a.Link--muted.tooltipped") || {}).innerText ===
      "Changes requested";
    const reviewRequired = !(approved || changesRequested);
    const assignees = Array.from(row.querySelectorAll(".from-avatar")).map(
      (assignee) => assignee.alt.slice(1)
    );
    const author = (row.querySelector(".opened-by .Link--muted") || {})
      .innerText;
    const title = (row.querySelector(".Link--primary.h4") || {}).innerText;
    const failsTravis = !!row.querySelector(
      ".commit-build-statuses .color-fg-danger"
    );
    const passesTravis = !!row.querySelector(
      ".commit-build-statuses .color-fg-success"
    );
    const skipLabel = row.querySelector(
      'a.IssueLabel[data-name="Skip colorization"]'
    );
    const repositoryElement = row.querySelector(
      "[data-hovercard-type=repository]"
    );
    const informationLineElement = row.querySelector("span.opened-by");
    const titleElement = row.querySelector(".Link--primary.h4");
    const PRIconElement = row.querySelector("div.flex-shrink-0.pt-2.pl-3");
    const repoFullName = (
      repositoryElement ? repositoryElement.innerText : ""
    ).trim();
    const buildStatusElement = row.querySelector(".commit-build-statuses");

    if (repositoryElement) {
      const name = repositoryElement.innerText;
      repositoryElement.innerText = name.replace(/^HyreAS\//, "");
      repositoryElement.classList.add(
        "github-pull-request-colorizer--repository"
      );
    }
    if (informationLineElement) {
      informationLineElement.parentElement.classList.add(
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
      (assignees.includes(me) || assignees.length === 0)
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

    if (skipLabel) {
      highlight = false;
    }

    if (hasDeferredContent) {
      highlight = false;
    }

    if (highlight) {
      row.classList.add("github-pull-request-colorizer--highlight");
    }

    if (isDraftPR) {
      row.classList.add("github-pull-request-colorizer--draft-pr");
    }
  });

  const hasDeferredContent =
    document.querySelector("batch-deferred-content") !== null;
  if (hasDeferredContent) {
    setTimeout(colorizePullRequests, 100);
  }
}

function checkForUpdates() {
  function setUpdateNotification(text) {
    const container = document.querySelector(
      ".Box .Box-header .table-list-header-toggle"
    );
    const notificationClassName = "github-pull-request-colorizer--notification";

    let notificationElement = container.querySelector(
      "." + notificationClassName
    );
    if (notificationElement) {
      notificationElement.textContent = text;
      return;
    }

    notificationElement = document.createElement("div");
    notificationElement.textContent = text;
    notificationElement.classList.add(notificationClassName);
    container.appendChild(notificationElement);
  }

  function onError() {
    setUpdateNotification(
      "Checking for github-pull-request-colorizer updates doesn't work in this browser, it seems :/ Consider investigating and making a pull request!"
    );
  }

  fetch(
    "https://api.github.com/repos/sigvef/github-pull-request-colorizer/contents/manifest.json"
  )
    .then((response) => {
      if (response.status !== 403) {
        return response.json();
      }
      throw new Error("ratelimited");
    })
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
    .catch((e) => {
      if (e.message !== "ratelimited") {
        onError();
      }
    });
}

checkForUpdates();

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

let currentHref = location.href;
setInterval(() => {
  if (currentHref !== location.href) {
    currentHref = location.href;
    try {
      colorizePullRequests();
    } catch (e) {
      console.log(e);
    }
  }
}, 500);
