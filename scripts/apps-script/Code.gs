/**
 * OSU AI Club — Google Calendar -> website rebuild trigger.
 *
 * Fires a GitHub `repository_dispatch` whenever the club calendar changes, so
 * www.osuaiclub.com rebuilds within a minute or two instead of waiting for the
 * 6-hourly cron in .github/workflows/deploy.yml.
 *
 * THIS FILE IS NOT RUN FROM THE REPO. It is the version-controlled copy of a
 * script that lives at script.google.com. Edit it here, then paste it there —
 * or the two drift and nobody can tell which is live.
 *
 * SETUP — do this signed in as osuaiclub@gmail.com, NOT a personal account.
 * The trigger watches the "AIC Public Calendar", not that account's own calendar.
 * An installable trigger belongs to whoever installed it and stops firing when
 * that person loses access to the calendar, so a trigger installed by a senior
 * dies at graduation. Full walkthrough in docs/calendar-sync.md.
 *
 *   1. script.google.com -> New project -> "AI Club — Calendar to Website"
 *   2. Paste this file into Code.gs.
 *   3. Project Settings -> Script properties -> add GITHUB_TOKEN
 *      (fine-grained PAT, this repo only, Repository permissions ->
 *      Contents: Read and write). Never paste the token into this file.
 *   4. Run installTrigger() once and approve the permissions prompt.
 *   5. Run testDispatch() and check the repo's Actions tab.
 */

var GITHUB_OWNER = 'OSU-AI-Club';
var GITHUB_REPO = 'OSU-AI-Club.github.io';
// MUST match GOOGLE_CALENDAR_ID in src/data/general.ts. This is the "AIC Public
// Calendar", NOT the club account's own "AIC Meetings" calendar — that one holds
// private 1:1s and partner meetings and is deliberately never synced.
var CALENDAR_ID = '9d4d51bcbbf901443d1e32bdb25ed366eff8d8078f2799868c6e8f9b6ed3a943@group.calendar.google.com';
var EVENT_TYPE = 'calendar-updated';

/**
 * Leading-edge debounce. Calendar triggers fire once per changed event, so
 * adding next semester's meetings in one sitting would otherwise queue a dozen
 * deploys that all produce the same artifact.
 */
var DEBOUNCE_MS = 5 * 60 * 1000;

/** Trailing follow-up, so edits made *during* the debounce window still ship. */
var FOLLOW_UP_MS = 7 * 60 * 1000;

/** Run once, by hand, from the Apps Script editor. Safe to re-run. */
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onCalendarChange') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onCalendarChange')
    .forUserCalendar(CALENDAR_ID)
    .onEventUpdated()
    .create();
  console.log('Installed calendar trigger for ' + CALENDAR_ID);
}

/** Fired by Google when an event on the calendar is created, edited or deleted. */
function onCalendarChange(e) {
  var props = PropertiesService.getScriptProperties();
  var now = Date.now();
  var last = Number(props.getProperty('LAST_DISPATCH_MS') || 0);

  if (now - last < DEBOUNCE_MS) {
    scheduleFollowUp();
    console.log('Debounced; follow-up scheduled.');
    return;
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    console.log('Another run holds the lock; skipping.');
    return;
  }
  try {
    props.setProperty('LAST_DISPATCH_MS', String(now));
    dispatch('calendar-change');
  } finally {
    lock.releaseLock();
  }
}

/** One-shot timer that catches edits made inside the debounce window. */
function scheduleFollowUp() {
  var pending = ScriptApp.getProjectTriggers().some(function (t) {
    return t.getHandlerFunction() === 'followUpDispatch';
  });
  if (pending) return;
  ScriptApp.newTrigger('followUpDispatch').timeBased().after(FOLLOW_UP_MS).create();
}

function followUpDispatch() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'followUpDispatch') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().setProperty('LAST_DISPATCH_MS', String(Date.now()));
  dispatch('follow-up');
}

/** POST https://api.github.com/repos/OWNER/REPO/dispatches */
function dispatch(reason) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN script property. See the setup notes at the top of this file.');
  }

  var url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/dispatches';
  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    payload: JSON.stringify({
      event_type: EVENT_TYPE,
      client_payload: { reason: reason, at: new Date().toISOString() }
    }),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  if (code !== 204) {
    // 401 / 403 -> the PAT expired or lacks Contents: Read and write.
    // 404       -> wrong owner/repo, or the token cannot see the repo at all.
    throw new Error('GitHub dispatch failed (' + code + '): ' + response.getContentText());
  }
  console.log('Dispatched ' + EVENT_TYPE + ' (' + reason + ').');
}

/** Manual smoke test. Run from the editor; expect a run in the Actions tab. */
function testDispatch() {
  dispatch('manual-test');
}
