'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {LogTailer} from '../lib/LogTailer';
import {Observable, Subject} from 'rxjs';

describe('LogTailer', () => {

  it('invokes the running callback when there\'s no "starting" status', () => {
    const logTailer = new LogTailer({
      name: 'test',
      messages: Observable.never(),
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    logTailer.start({onRunning: handleRunning});
    expect(handleRunning).toHaveBeenCalled();
  });

  it('invokes the running callback when there\'s a "starting" status', () => {
    const ready = new Subject();
    const logTailer = new LogTailer({
      name: 'test',
      messages: Observable.never(),
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    logTailer.start({onRunning: handleRunning});
    expect(handleRunning).not.toHaveBeenCalled();
    ready.next();
    expect(handleRunning).toHaveBeenCalled();
  });

  it("doesn't show an error notification when every start call has a running callback", () => {
    spyOn(atom.notifications, 'addError');
    const ready = new Subject();
    const messages = new Subject();
    const err = new Error('Uh oh');
    const logTailer = new LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    const handleRunning2 = jasmine.createSpy();
    logTailer.start({onRunning: handleRunning});
    logTailer.start({onRunning: handleRunning2});
    messages.error(err);
    expect(handleRunning).toHaveBeenCalledWith(err);
    expect(handleRunning2).toHaveBeenCalledWith(err);
    expect(atom.notifications.addError).not.toHaveBeenCalled();
  });

  it("shows an error notification when a running callback isn't registered", () => {
    spyOn(atom.notifications, 'addError');
    const ready = new Subject();
    const messages = new Subject();
    const err = new Error('Uh oh');
    const logTailer = new LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    logTailer.start({onRunning: handleRunning});
    logTailer.start();
    messages.error(err);
    expect(handleRunning).toHaveBeenCalledWith(err);
    expect(atom.notifications.addError).toHaveBeenCalled();
  });

  it('invokes the running callback with a cancelation error when stopped before ready', () => {
    const ready = new Subject();
    const messages = new Subject();
    const logTailer = new LogTailer({
      name: 'test',
      messages,
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    logTailer.start({onRunning: handleRunning});
    logTailer.stop();
    expect(handleRunning).toHaveBeenCalled();
    const err = ((handleRunning.calls[0].args[0]): any);
    expect(err.name).toBe('ProcessCancelledError');
  });

  it("invokes the running callback immediately if it's already running", () => {
    const ready = new Subject();
    const logTailer = new LogTailer({
      name: 'test',
      messages: Observable.never(),
      ready,
      trackingEvents: {
        start: 'logtailer-test-start',
        stop: 'logtailer-test-stop',
        restart: 'logtailer-test-restart',
      },
    });
    const handleRunning = jasmine.createSpy();
    logTailer.start();
    ready.next();
    logTailer.start({onRunning: handleRunning});
    expect(handleRunning).toHaveBeenCalled();
  });

});
