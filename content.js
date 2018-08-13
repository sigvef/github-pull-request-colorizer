document.addEventListener("DOMContentLoaded", function(event) {
  const me = document.querySelector('summary[aria-label="View profile and more"] img.avatar').alt.slice(1);

  [].forEach.call(document.querySelectorAll('.js-issue-row'), row => {
    const isPR = !!row.querySelector('[aria-label="Open pull request"]');
    const approved = (row.querySelector('a.muted-link.tooltipped') || {}).innerText === 'Approved';
    const changesRequested = (row.querySelector('a.muted-link.tooltipped') || {}).innerText === 'Changes requested';
    const reviewRequired = !(approved || changesRequested);
    const assignee = (row.querySelector('.from-avatar') || {alt: ''}).alt.slice(1);
    const author = (row.querySelector('.opened-by .muted-link') || {}).innerText;
    const title = (row.querySelector('.link-gray-dark.h4') || {}).innerText;
    const isDjangoBackend = row.querySelector('.float-left.col-9.lh-condensed.p-2 a.muted-link').href === 'https://github.com/HyreAS/django-backend';
    const failsTravis = isDjangoBackend
      ? row.querySelector('.commit-build-statuses a.tooltipped').getAttribute('aria-label') !== '2 / 3 checks OK' && !!row.querySelector('.commit-build-statuses .text-red')
      : !!row.querySelector('.commit-build-statuses .text-red');
    const passesTravis = isDjangoBackend
      ? row.querySelector('.commit-build-statuses a.tooltipped').getAttribute('aria-label') === '2 / 3 checks OK' || !!row.querySelector('.commit-build-statuses .text-green')
      : !!row.querySelector('.commit-build-statuses .text-green');
    const priorityLowLabel = row.querySelector('.labels a[title="Priority: Low"]');


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
      row.style.borderColor = "#f2df92";
    }
  });
});
