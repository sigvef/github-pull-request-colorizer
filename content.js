function colorizeAnnotations() {
  for (const element of document.querySelectorAll(
    'div[class*="Annotation-module__annotationMessage--"]',
  )) {
    const div = document.createElement("div");
    div.classList.add("highlight", "highlight-source-diff");
    const lines = element.textContent
      .split("\n")
      .filter((x) => x !== "--- " && x !== "+++ " && x[0] !== "@");
    div.style.whiteSpace = "pre";
    div.style.fontFamily = "monospace";
    element.replaceWith(div);
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
      div.appendChild(span);
    }
  }
}

function colorizePullRequests() {
  const me = document.querySelector('meta[name="user-login"]').content;
  const isMultiRepoView =
    document
      .querySelector('meta[name="selected-link"]')
      .getAttribute("value") === "/pulls";

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
    if (isMultiRepoView) {
      row.classList.add("github-pull-request-colorizer--multi-repo");
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
      (assignee) => assignee.alt.slice(1),
    );
    const author = (row.querySelector(".opened-by .Link--muted") || {})
      .innerText;
    const title = (row.querySelector(".Link--primary.h4") || {}).innerText;
    const failsTravis = !!row.querySelector(
      ".commit-build-statuses .color-fg-danger",
    );
    const passesTravis = !!row.querySelector(
      ".commit-build-statuses .color-fg-success",
    );
    const skipLabel = row.querySelector(
      'a.IssueLabel[data-name="Skip colorization"]',
    );
    const repositoryElement = row.querySelector(
      "[data-hovercard-type=repository]",
    );
    const informationLineElement = row.querySelector("span.opened-by");
    const titleElement = row.querySelector(".Link--primary.h4");
    const PRIconElement = row.querySelector("div.flex-shrink-0.pt-2.pl-3");
    const buildStatusElement = row.querySelector(".commit-build-statuses");

    if (repositoryElement) {
      const name = repositoryElement.innerText;
      repositoryElement.innerText = name.replace(/^HyreAS\//, "");
      repositoryElement.classList.add(
        "github-pull-request-colorizer--repository",
      );
    }
    if (informationLineElement) {
      informationLineElement.parentElement.classList.add(
        "github-pull-request-colorizer--information-line",
      );
    }
    if (isMultiRepoView && PRIconElement) {
      PRIconElement.style.display = "none";
    }

    if (titleElement) {
      titleElement.classList.add("github-pull-request-colorizer--title");
    }

    if (buildStatusElement) {
      buildStatusElement.classList.add(
        "github-pull-request-colorizer--build-status",
      );
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

    const updatedClock = row.querySelector(".octicon-clock");
    if (updatedClock) {
      updatedClock.style.width = "12px";
      updatedClock.style.paddingBottom = "2px";
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
      ".Box .Box-header .table-list-header-toggle",
    );
    const notificationClassName = "github-pull-request-colorizer--notification";

    let notificationElement = container.querySelector(
      "." + notificationClassName,
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
      "Checking for github-pull-request-colorizer updates doesn't work in this browser, it seems :/ Consider investigating and making a pull request!",
    );
  }

  fetch(
    "https://api.github.com/repos/sigvef/github-pull-request-colorizer/contents/manifest.json",
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
            "Update for GitHub Pull Request Colorizer is available!",
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
    try {
      autoFetchCheckSummary();
    } catch (e) {
      console.log(e);
    }
  }
}, 500);

// GitHub Check Fetcher
console.log("GitHub Pull Request Colorizer: Check fetcher loaded");

function extractRepoInfoFromUrl() {
  const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) {
    return null;
  }
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3],
  };
}

async function fetchStatusChecks(owner, repo, pullNumber) {
  const url = `https://github.com/${owner}/${repo}/pull/${pullNumber}/page_data/status_checks`;
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub internal API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching status checks:", error);
    return null;
  }
}

async function fetchCheckDetails(targetUrl) {
  const fullUrl = `https://github.com${targetUrl}`;
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch check page: ${response.status}`);
    }
    const html = await response.text();

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    let summaryHtml = null;
    let summaryText = null;

    // Look for the check run summary section
    const summarySection = doc.querySelector(
      '[aria-label="Check run summary"]',
    );
    if (summarySection) {
      const markdownBody = summarySection.querySelector(".markdown-body");
      if (markdownBody) {
        summaryHtml = markdownBody.cloneNode(true); // Clone the HTML element with formatting
        summaryText = markdownBody.textContent.trim();
      }
    }

    // Also try to find the check annotation messages
    const annotations = [];
    doc.querySelectorAll('[data-testid="check-annotation"]').forEach((ann) => {
      annotations.push(ann.textContent.trim());
    });

    return {
      summaryHtml, // The actual HTML element with formatting
      summaryText, // Plain text version
      annotations,
      fullHtml: html, // Include full HTML for debugging
    };
  } catch (error) {
    console.error("Error fetching check details:", error);
    return null;
  }
}

function getCommitShaFromPage() {
  // Try multiple selectors to find the commit SHA
  const selectors = [
    'a[data-hovercard-type="commit"]',
    '.commit-ref.current-branch a[href*="/commit/"]',
    '.head-ref a[href*="/commit/"]',
    'span.commit-ref a[href*="/commits/"]',
    '[data-url*="/commit/"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.href) {
      const match = element.href.match(/\/commits?\/([a-f0-9]{40})/);
      if (match) {
        return match[1];
      }
    }
  }

  // Try to find it in the timeline
  const timelineCommit = document.querySelector(".TimelineItem .commit-id");
  if (timelineCommit && timelineCommit.textContent) {
    const sha = timelineCommit.textContent.trim();
    if (sha.length >= 7) {
      return sha;
    }
  }

  return null;
}

async function fetchCheckSummary(checkName) {
  const repoInfo = extractRepoInfoFromUrl();
  if (!repoInfo) {
    console.log("Not on a PR page");
    return;
  }

  console.log(
    `Fetching status checks for ${repoInfo.owner}/${repoInfo.repo} #${repoInfo.pullNumber}`,
  );

  const data = await fetchStatusChecks(
    repoInfo.owner,
    repoInfo.repo,
    repoInfo.pullNumber,
  );
  if (!data) {
    console.log("Failed to fetch status checks");
    return;
  }

  console.log("Status checks data:", data);

  // GitHub's internal API returns {statusChecks: [...], statusRollup: {...}, aliveChannels: {...}}
  const checks = data.statusChecks || [];

  if (!checks.length) {
    console.log("No status checks found");
    return;
  }

  console.log(`Found ${checks.length} checks`);

  if (checkName) {
    // Try to find by displayName or description (case-insensitive)
    const check = checks.find(
      (run) =>
        run.displayName?.toLowerCase().includes(checkName.toLowerCase()) ||
        run.description?.toLowerCase().includes(checkName.toLowerCase()),
    );
    if (check) {
      console.log(`\n=== Check: ${check.displayName} ===`);
      console.log(`Description: ${check.description}`);
      console.log(`State: ${check.state}`);
      console.log(`Duration: ${check.durationInSeconds}s`);
      console.log(`Changed at: ${check.stateChangedAt}`);
      console.log(`Is Required: ${check.isRequired}`);
      console.log(`Additional Context: ${check.additionalContext || "None"}`);
      console.log(`Target URL: ${check.targetUrl}`);

      if (check.copilotCheckRunFailureContext) {
        console.log(
          "\nCopilot Failure Context:",
          check.copilotCheckRunFailureContext,
        );
      }

      console.log("\nFull check data:", check);

      // Fetch the detailed check page
      if (check.targetUrl) {
        console.log("\nFetching detailed check output...");
        const details = await fetchCheckDetails(check.targetUrl);
        if (details) {
          if (details.summaryHtml) {
            console.log("\n=== Check Output/Summary ===");
            console.log(details.summaryText);

            // Inject the summary into the PR timeline
            injectCheckSummaryIntoTimeline(
              check.displayName,
              details.summaryHtml,
            );
            console.log("✓ Summary injected into PR timeline");
          } else {
            console.log("\nNo summary found in standard locations.");
            console.log("Full HTML length:", details.fullHtml.length);
            console.log(
              "You can inspect the HTML to find where the summary is located.",
            );
            // Log a snippet of the HTML for debugging
            const snippet = details.fullHtml.substring(0, 1000);
            console.log("HTML snippet (first 1000 chars):", snippet);
          }

          if (details.annotations && details.annotations.length > 0) {
            console.log("\n=== Annotations ===");
            details.annotations.forEach((ann, i) => {
              console.log(`${i + 1}. ${ann}`);
            });
          }
        }
      }

      return check; // Return the check for the button handler
    } else {
      console.log(`Check matching "${checkName}" not found`);
      console.log("\nAvailable checks:");
      checks.forEach((run, i) => {
        console.log(
          `${i + 1}. ${run.displayName} - ${run.state} (${run.description})`,
        );
      });
    }
  } else {
    // List all checks
    console.log("\nAvailable checks:");
    checks.forEach((run, i) => {
      const duration = run.durationInSeconds
        ? ` (${run.durationInSeconds}s)`
        : "";
      console.log(`${i + 1}. ${run.displayName} - ${run.state}${duration}`);
      console.log(`   ${run.description}`);
    });

    // Show rollup summary
    if (data.statusRollup) {
      console.log("\nStatus Rollup:");
      console.log(`Combined State: ${data.statusRollup.combinedState}`);
      if (data.statusRollup.summary) {
        data.statusRollup.summary.forEach((s) => {
          console.log(`  ${s.state}: ${s.count}`);
        });
      }
    }
  }
}

function showGlobalSpinner() {
  const spinnerId = "check-summaries-global-spinner";

  // Don't create if already exists
  if (document.getElementById(spinnerId)) {
    return;
  }

  // Find the merge box - it's typically at the end of the timeline
  const mergeBox = document.querySelector(".merge-pr");
  if (!mergeBox) {
    console.log("Could not find merge box to inject spinner");
    return;
  }

  // Create a simple centered spinner container
  const container = document.createElement("div");
  container.id = spinnerId;
  container.style.padding = "16px";
  container.style.textAlign = "center";
  container.style.marginBottom = "16px";
  container.innerHTML = `
    <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="32" height="32" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke"></circle>
      <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke">
        <animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  `;

  // Insert before the merge box
  mergeBox.parentNode.insertBefore(container, mergeBox);

  // Remove border-top from discussion-timeline-actions to make it flow better
  const timelineActions = document.querySelector(
    ".discussion-timeline-actions",
  );
  if (timelineActions) {
    timelineActions.style.borderTop = "none";
  }
}

function hideGlobalSpinner() {
  const spinner = document.getElementById("check-summaries-global-spinner");
  if (spinner) {
    spinner.remove();
  }
}

function injectCheckSummaryIntoTimeline(checkName, summaryHtml, checkData) {
  // Create a unique ID for this check summary
  const safeName = checkName.replace(/[^a-zA-Z0-9]/g, "-");
  const containerId = `check-summary-${safeName}`;

  // Remove any existing summary for this check
  const existingSummary = document.getElementById(containerId);
  if (existingSummary) {
    existingSummary.remove();
  }

  // Find where to insert - before the global spinner if it exists, otherwise before merge box
  const spinner = document.getElementById("check-summaries-global-spinner");
  const mergeBox = document.querySelector(".merge-pr");

  let insertBefore;
  if (spinner) {
    insertBefore = spinner;
  } else if (mergeBox) {
    insertBefore = mergeBox;
  } else {
    console.log("Could not find merge box to inject summary");
    return;
  }

  // Create a simple container for the summary (no timeline graphics)
  const container = document.createElement("div");
  container.id = containerId;
  container.style.marginBottom = "16px";
  container.style.marginLeft = "56px";

  // Create a box similar to GitHub's comment boxes
  const box = document.createElement("div");
  box.className = "Box";
  box.style.maxHeight = "448px";
  box.style.display = "flex";
  box.style.flexDirection = "column";

  // Header with avatar
  const header = document.createElement("div");
  header.className = "Box-header";
  header.style.padding = "8px 16px";
  header.style.fontWeight = "600";
  header.style.flexShrink = "0";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "8px";

  // Add avatar if available
  if (checkData && checkData.avatarUrl) {
    const avatar = document.createElement("img");
    avatar.src = checkData.avatarUrl;
    avatar.alt = checkName;
    avatar.width = 20;
    avatar.height = 20;
    avatar.style.borderRadius = "3px";
    header.appendChild(avatar);
  }

  // Add check name
  const nameSpan = document.createElement("span");
  nameSpan.textContent = checkName;
  nameSpan.style.flex = "1";
  header.appendChild(nameSpan);

  // Add status indicator if available
  if (checkData && checkData.state) {
    const statusBadge = document.createElement("span");
    statusBadge.style.fontSize = "12px";
    statusBadge.style.padding = "2px 8px";
    statusBadge.style.borderRadius = "12px";
    statusBadge.style.fontWeight = "500";

    // Style based on state
    if (checkData.state === "FAILURE") {
      statusBadge.style.background = "#d1242f";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Failed";
    } else if (checkData.state === "SUCCESS") {
      statusBadge.style.background = "#1a7f37";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Passed";
    } else if (checkData.state === "PENDING") {
      statusBadge.style.background = "#bf8700";
      statusBadge.style.color = "white";
      statusBadge.textContent = "Pending";
    } else {
      statusBadge.style.background = "#6e7781";
      statusBadge.style.color = "white";
      statusBadge.textContent = checkData.state;
    }

    header.appendChild(statusBadge);
  }

  // Body with the summary
  const summaryBody = document.createElement("div");
  summaryBody.className = "Box-body";
  summaryBody.style.padding = "16px";
  summaryBody.style.overflowY = "auto";
  summaryBody.style.overflowX = "hidden";
  summaryBody.style.flex = "1";
  summaryBody.style.minHeight = "0";
  summaryBody.appendChild(summaryHtml);

  box.appendChild(header);
  box.appendChild(summaryBody);
  container.appendChild(box);

  // Insert before the spinner or merge box
  insertBefore.parentNode.insertBefore(container, insertBefore);

  // Remove border-top from discussion-timeline-actions to make it flow better
  const timelineActions = document.querySelector(
    ".discussion-timeline-actions",
  );
  if (timelineActions) {
    timelineActions.style.borderTop = "none";
  }
}

async function waitForChecksToLoad(maxWaitMs = 10000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    // Look for the Checks section
    const checksSection = document.querySelector(
      'section[aria-label="Checks"]',
    );

    if (checksSection) {
      console.log("Checks section found in DOM");
      return true;
    }

    // Wait 100ms before checking again (faster polling)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("Timeout waiting for checks to load");
  return false;
}

async function fetchAllInterestingCheckSummaries(priorityCheckNames = []) {
  const repoInfo = extractRepoInfoFromUrl();
  if (!repoInfo) {
    console.log("Not on a PR page");
    return;
  }

  console.log(
    `Fetching status checks for ${repoInfo.owner}/${repoInfo.repo} #${repoInfo.pullNumber}`,
  );

  const data = await fetchStatusChecks(
    repoInfo.owner,
    repoInfo.repo,
    repoInfo.pullNumber,
  );
  if (!data) {
    console.log("Failed to fetch status checks");
    return;
  }

  const checks = data.statusChecks || [];
  if (!checks.length) {
    console.log("No status checks found");
    return;
  }

  console.log(`Found ${checks.length} checks`);

  const checksToFetch = [];
  const addedCheckNames = new Set();

  // First, add all FAILURE checks
  for (const check of checks) {
    if (
      check.state === "FAILURE" &&
      check.targetUrl &&
      !addedCheckNames.has(check.displayName)
    ) {
      console.log(`Adding failed check: ${check.displayName}`);
      checksToFetch.push(check);
      addedCheckNames.add(check.displayName);
    }
  }

  // Then, add priority checks if they're not SUCCESS (and not already added)
  for (const checkName of priorityCheckNames) {
    if (addedCheckNames.has(checkName)) {
      continue; // Already added as a failed check
    }

    const check = checks.find((run) => run.displayName === checkName);

    if (check && check.targetUrl) {
      if (check.state === "SUCCESS") {
        console.log(
          `Priority check "${check.displayName}" has SUCCESS status, skipping`,
        );
      } else {
        console.log(
          `Adding priority check: ${check.displayName} (${check.state})`,
        );
        checksToFetch.push(check);
        addedCheckNames.add(check.displayName);
      }
    } else {
      console.log(`Priority check "${checkName}" not found`);
    }
  }

  if (checksToFetch.length === 0) {
    console.log("No checks to fetch");
    return;
  }

  // Show global spinner
  showGlobalSpinner();

  // Fetch the actual details for each check
  for (const check of checksToFetch) {
    console.log(`\n=== Fetching details: ${check.displayName} ===`);
    const details = await fetchCheckDetails(check.targetUrl);
    if (details && details.summaryHtml) {
      injectCheckSummaryIntoTimeline(
        check.displayName,
        details.summaryHtml,
        check,
      );
      console.log(`✓ Summary injected for ${check.displayName}`);
    }
  }

  // Hide global spinner when all checks are loaded
  hideGlobalSpinner();
}

async function autoFetchCheckSummary() {
  const repoInfo = extractRepoInfoFromUrl();
  if (!repoInfo) {
    return; // Not on a PR page
  }

  // Check if we've already fetched for this page (look for any check summary)
  const summaryExists = document.querySelector('[id^="check-summary-"]');
  if (summaryExists) {
    return; // Already fetched
  }

  console.log("Waiting for checks to load...");
  const checksLoaded = await waitForChecksToLoad();

  if (!checksLoaded) {
    console.log("Checks didn't load in time, skipping auto-fetch");
    return;
  }

  console.log("Auto-fetching check summaries...");
  try {
    // Fetch all failed checks, plus Mypy and GDPR if they're not successful
    await fetchAllInterestingCheckSummaries(["Mypy", "GDPR"]);
  } catch (error) {
    console.error("Error auto-fetching check summary:", error);
  }
}

// Auto-fetch when on PR page
try {
  autoFetchCheckSummary();
} catch (e) {
  console.error("Error auto-fetching check summary:", e);
}

document.addEventListener("DOMContentLoaded", autoFetchCheckSummary);
