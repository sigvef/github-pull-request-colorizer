function colorizePullRequests() {

  function setUpdateNotification(text) {
    const container = document.querySelector('.page-content .Box .Box-header .table-list-header-toggle');
    const notificationElement = document.createElement('div');
    notificationElement.textContent = text;
    notificationElement.style.padding = '3px 6px';
    notificationElement.style.padding = '3px 6px';
    notificationElement.style.background = '#f8efc5';
    notificationElement.style.border = '1px solid #dbab09';
    notificationElement.style.color = '#7a5f04';
    notificationElement.style.borderRadius = '2px';
    notificationElement.style.display = 'inline-block';
    notificationElement.style.margin = '-4px 0 -4px 16px';
    container.appendChild(notificationElement);
  }


  try {
    fetch('https://api.github.com/repos/sigvef/github-pull-request-colorizer/contents/manifest.json')
      .then(response => response.json())
      .then(data => {
          const localManifest = chrome.runtime.getManifest();
          const masterManifest = JSON.parse(atob(data.content));
          if(masterManifest.version !== localManifest.version) {
            setUpdateNotification('Update for GitHub Pull Request Colorizer is available!');
          }
      });
  } catch(e) {
    setUpdateNotification('Checking for github-pull-request-colorizer updates doesn\'t work in this browser, it seems :/ Consider investingating and making a pull request!');
  }

  const localStorageVersionKey = 'github-pull-request-colorizer-last-updated';
  fetch('https://api.github.com/repos/sigvef/github-pull-request-colorizer/git/refs/heads/master')
    .then(response => response.json())
    .then(data => {
      fetch(data.object.url)
        .then(response => response.json())
        .then(commit => {
          const masterDate = commit.committer.date;
          const localDate = localStorage.getItem(localStorageVersionKey);
          if(masterDate > localDate) {

          }
        });
    });


  const me = document.querySelector('summary[aria-label="View profile and more"] img.avatar').alt.slice(1);

  [].forEach.call(document.querySelectorAll('.js-issue-row'), row => {
    const isPR = !!row.querySelector('[aria-label="Open pull request"]');
    const isDraftPR = !!row.querySelector('[aria-label="Open draft pull request"]');
    const approved = (row.querySelector('a.muted-link.tooltipped') || {}).innerText === 'Approved';
    const changesRequested = (row.querySelector('a.muted-link.tooltipped') || {}).innerText === 'Changes requested';
    const reviewRequired = !(approved || changesRequested);
    const assignee = (row.querySelector('.from-avatar') || {alt: ''}).alt.slice(1);
    const author = (row.querySelector('.opened-by .muted-link') || {}).innerText;
    const title = (row.querySelector('.link-gray-dark.h4') || {}).innerText;
    const failsTravis = !!row.querySelector('.commit-build-statuses .text-red');
    const passesTravis = !!row.querySelector('.commit-build-statuses .text-green');
    const priorityLowLabel = row.querySelector('.labels a[title="Priority: Low"]');
    const repositoryElement = (row.querySelector('[data-hovercard-type=repository]'));
    const informationLineElement = (row.querySelector('div.text-small.text-gray'));
    const titleElement = row.querySelector('.link-gray-dark.h4');
    const PRIconElement = row.querySelector('div.float-left.pt-2.pl-3');
    const buildStatusElement = row.querySelector('.commit-build-statuses');

    if(repositoryElement) {
      const name = repositoryElement.innerText;
      repositoryElement.innerText = name.replace(/^HyreAS\//, '');
      repositoryElement.style.width = '160px';
      repositoryElement.style.marginRight = '32px';
      repositoryElement.style.textAlign = 'right';
      repositoryElement.style.float = 'left';
      repositoryElement.style.height = '28px';
      repositoryElement.style.setProperty('font-weight', '100', 'important');  
    }
    if(informationLineElement) {
      informationLineElement.style.marginLeft = '193px';
      if(isDraftPR) {
        informationLineElement.style.setProperty('font-weight', '100', 'important');  
      }
    }
    if(PRIconElement) {
      PRIconElement.style.display = 'none';
    }

    if(titleElement) {
      if(isDraftPR) {
        titleElement.style.setProperty('font-weight', '100', 'important');  
      }
    }

    if(buildStatusElement) {
      const parent = buildStatusElement.parentElement;
      if(parent) {
        parent.style.position = 'absolute';
        parent.style.left = '176px';
        parent.style.top = '9px';
      }
    }


    let highlight = false;
    if(failsTravis && author === me) {
      highlight = true;
    }

    if(changesRequested && author === me) {
      highlight = true;
    }

    if(!failsTravis && isPR && reviewRequired && author !== me && (assignee === me || assignee === '')) {
      highlight = true;
    }

    if(approved && passesTravis) {
      highlight = true;
    }

    if(title.slice(0, 3) === 'WIP') {
      highlight = true;
    }

    if(title.slice(0, 5) === '[WIP]') {
      highlight = true;
    }

    if(title.slice(0, 3) === 'WIP' && author != me) {
      highlight = false;
    }

    if(title.slice(0, 5) === '[WIP]' && author != me) {
      highlight = false;
    }

    if(priorityLowLabel) {
      highlight = false;
    }

    if(highlight) {
      row.style.background = '#f8efc5';
    }

    if(isDraftPR) {
      row.classList.add('github-pull-request-colorizer--draft-pr');
    }
  });
}

try {
  colorizePullRequests();
} catch(e) {}

document.addEventListener('DOMContentLoaded', colorizePullRequests);
