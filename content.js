function colorizePullRequests() {
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
    const isDjangoBackend = row.querySelector('.float-left.col-9.lh-condensed.p-2 a.muted-link').href === 'https://github.com/HyreAS/django-backend';
    const failsTravis = !!row.querySelector('.commit-build-statuses .text-red');
    const passesTravis = !!row.querySelector('.commit-build-statuses .text-green');
    const priorityLowLabel = row.querySelector('.labels a[title="Priority: Low"]');
    const repositoryElement = (row.querySelector('[data-hovercard-type=repository]'));
    const informationLineElement = (row.querySelector('div.text-small.text-gray'));
    const titleElement = row.querySelector('.link-gray-dark.h4');
    const PRIconElement = row.querySelector('div.float-left.pt-2.pl-3');

    if(repositoryElement) {
      const name = repositoryElement.innerText;
      repositoryElement.innerText = name.replace(/^HyreAS\//, '');
      repositoryElement.style.width = '160px';
      repositoryElement.style.marginRight = '32px';
      repositoryElement.style.textAlign = 'right';
      repositoryElement.style.display = 'inline-block';

      repositoryElement.style.setProperty('font-weight', '100', 'important');  
    }
    if(informationLineElement) {
      informationLineElement.style.marginLeft = '197px';
      if(isDraftPR) {
        informationLineElement.style.setProperty('font-weight', '100', 'important');  
      }
    }
    if(PRIconElement) {
      PRIconElement.style.transform = 'translate(190px, 0px)';
    }

    if(titleElement) {
      if(isDraftPR) {
        titleElement.style.setProperty('font-weight', '100', 'important');  
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
