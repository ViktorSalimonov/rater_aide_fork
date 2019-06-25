var Blocker = {
    initialize: function () {}
};
var SESSIONS_PAGE = chrome.extension.getURL("index.html"),
    TIMECARD_PAGE = "https://www.raterlabs.com/qrp/core/vendors/invoices",
    TIMESHEET_PAGE = "https://e32.ultipro.com/default.aspx",
    Controller = {
        initialize: function () {
            chrome.runtime.onMessage.addListener(function (a, c, d) {
                if ("fetch-between" == a.method) Storage.Remote.fetchBetween({
                    head: a.head,
                    tail: a.tail
                }, function (a) {
                    var b = Tracker.session || null;
                    b && delete a[b.sid];
                    d({
                        sessions: a,
                        active: b
                    })
                }, function (a) {
                    d({
                        error: a
                    })
                });
                else if ("open-timecard" == a.method) chrome.tabs.query({
                        url: TIMECARD_PAGE
                    },
                    function (a) {
                        a.length ? chrome.tabs.update(a[0].id, {
                            active: !0
                        }) : chrome.tabs.create({
                            url: TIMECARD_PAGE,
                            openerTabId: c.tab.id || 0
                        })
                    });
                else if ("open-ultipro" == a.method) chrome.tabs.query({
                    url: TIMESHEET_PAGE
                }, function (a) {
                    a.length ? chrome.tabs.update(a[0].id, {
                        active: !0
                    }) : chrome.tabs.create({
                        url: TIMESHEET_PAGE,
                        openerTabId: c.tab.id || 0
                    })
                });
                else if ("did-fill-timesheet" == a.method) chrome.notifications.create("did-fill-timesheet", {
                    type: "basic",
                    title: "Updated timesheet!",
                    message: 'Review changes and click "Save."',
                    iconUrl: "img/128x128.png"
                });
                else if ("export-csv" == a.method) Storage.exportCSV(a.values, a.filename, d);
                else if ("export-radata" == a.method) Storage.exportSessions(a.filename, d);
                else if ("fetch" == a.method) {
                    var e = a.period || Dates.currentMonthStr();
                    Storage.Remote.fetchMonth({
                        mstr: e,
                        forcePacific: !!a.forcePacific
                    }, function (a) {
                        var b = Tracker.session || null;
                        b && delete a[b.sid];
                        d({
                            sessions: a,
                            active: b,
                            mstr: e
                        })
                    }, function (a) {
                        d({
                            error: a
                        })
                    })
                } else if ("fetch-greater-month" == a.method) {
                    var e = a.mstr || Dates.currentMonthStr(),
                        f = Dates.dateRangeForMonth(e);
                    Storage.Remote.fetchBetween({
                        head: f[0].subtract(1, "M").valueOf(),
                        tail: f[1].add(1, "M").valueOf()
                    }, function (a) {
                        var b = Tracker.session || null;
                        b && delete a[b.sid];
                        d({
                            sessions: a,
                            active: b,
                            mstr: e
                        })
                    }, function (a) {
                        d({
                            error: a
                        })
                    })
                } else if ("fetch-rolling-30" == a.method) Storage.Remote.fetchRolling30(function (a) {
                    d(a)
                });
                else if ("get-active-session" == a.method) d({
                    active: Tracker.session || null
                });
                else if ("get-new-session" == a.method) d({
                    session: Tracker.newSession(a.projectId || 0)
                });
                else if ("get-transient-session-values" == a.method) d({
                    result: Tracker.transientValuesForSessions(a.sessions)
                });
                else if ("goals-did-change" == a.method) Tracker.clearGoalsNotification();
                else if ("got-dropbox-auth-url" == a.method) {
                    var g = a.pageUrl;
                    g && -1 == g.indexOf("error") && chrome.runtime.sendMessage({
                        method: "did-begin-login"
                    });
                    Controller.show(function () {
                        chrome.tabs.remove(c.tab.id);
                        var a = g.match(/token2=([^&]+)/);
                        a && Storage.Remote.authWithCustomToken(a[1])
                    })
                } else if ("import-file" == a.method) Storage.importSessions(a.filename, d);
                else if ("list-files" == a.method) a = Storage.getDropboxClient().readdir("", null, function (a, b) {
                    function c() {
                        b.length ?
                            Storage.getDropboxClient().stat(b.shift(), null, function (a, b) {
                                if (a) d({
                                    error: a.responseText
                                });
                                else {
                                    var f = {
                                        name: b.name,
                                        modifiedAt: JSON.stringify(b.modifiedAt),
                                        isFolder: b.isFolder
                                    };
                                    e[f.name] = f;
                                    c()
                                }
                            }) : d({
                                result: e
                            })
                    }
                    if (a) d({
                        error: a.responseText
                    });
                    else {
                        var e = {};
                        c()
                    }
                });
                else if ("modify-sessions" == a.method) a.adds && (Storage.addSessions(a.adds), Tracker.noteSessionsAdded(a.adds), Features.noteSessionsModified()), a.updates && (Storage.updateSessions(a.updates, a.initial), Tracker.noteSessionsEdited(a.updates, a.initial),
                    Features.noteSessionsModified()), a.deletes && (Storage.deleteSessions(a.deletes), Tracker.noteSessionsDeleted(a.deletes), Features.noteSessionsModified()), d();
                else if ("open-popout-calendar" == a.method) Features.openPopoutCalendar(a.mstr);
                else if ("open-popout-timer" == a.method) Popout.showTimerWindows(!0);
                else if ("open-popout-timesheet" == a.method) Features.openPopoutTimesheet();
                else if ("open-timesheet-assistant" == a.method) Features.openTimesheet(c.tab.id);
                else if ("reload-extension" == a.method) Controller.rememberSummaryPages(function () {
                    chrome.runtime.reload()
                });
                else if ("reset-datastore" != a.method)
                    if ("restore-defaults" == a.method) Storage.Remote.resetPrefs(d);
                    else if ("resume-session" == a.method) Prefs.get("is-active") || (a.session ? Tracker.resumeSession(a.session) : Tracker.toggleSession());
                else if ("run-invoicer" == a.method) chrome.tabs.query({
                    lastFocusedWindow: !0
                }, function (d) {
                    var e = 0;
                    $.each(d, function (a, b) {
                        if (0 == b.url.indexOf("https://www.leapforceathome.com/qrp/core/vendors/invoice")) return e = b.id, !1
                    });
                    e ? chrome.tabs.update(e, {
                        url: "https://www.leapforceathome.com/qrp/core/vendors/invoices",
                        active: !!a.active
                    }) : chrome.tabs.create({
                        url: "https://www.leapforceathome.com/qrp/core/vendors/invoices",
                        openerTabId: c.tab.id,
                        active: !!a.active
                    })
                });
                else if ("show-options-page" == a.method) Controller.showOptions(a.pane, a.section);
                else if ("sign-in-dropbox" == a.method) Storage.Remote.signIn();
                else if ("signout-requested" == a.method) Tracker.session ? d({
                    error: "End the active session before signing out."
                }) : (Storage.Remote.signOut(), Prefs.resetLocalPrefs(), d({}));
                else if ("sign-up-dropbox" == a.method) chrome.tabs.create({
                    url: a.url,
                    openerTabId: c.tab.id
                });
                else if ("start-session" == a.method) Prefs.get("is-active") || Tracker.toggleSession(!!a.begin_new);
                else if ("stop-session" == a.method) Prefs.get("is-active") && Tracker.toggleSession();
                else if ("summary-page-did-load" == a.method) {
                    if (f = c && c.tab) {
                        f.id == Controller.show_options_in_tab && (Controller.showOptionsInTab(f.id, Controller.show_options_in_tab_pane, Controller.show_options_in_section), Controller.show_options_in_tab = void 0, Controller.show_options_in_tab_pane = void 0, Controller.show_options_in_section =
                            void 0);
                        var h = Prefs.get("summary-page-state") || {};
                        h[f.windowId] = f;
                        Prefs.set("summary-page-state", h)
                    }
                } else "test-autosubmit-alerts" == a.method ? Messaging.FCM.sendTestAlertToDevices("", "Auto-submitted on desktop!", "AUTOSUBMIT_ON_DESKTOP", d) : "test-submit-alerts" == a.method ? Messaging.FCM.sendTestAlertToDevices("", "Submit on desktop!", "SUBMIT_ON_DESKTOP", d) : "test-task-alerts" == a.method ? Messaging.FCM.sendTestAlertToDevices("", "Tasks available on desktop!", "TASKS_ON_DESKTOP", d) : "update-months-earnings" == a.method ?
                    Tracker.updateSessionEarnings(function (a) {
                        d()
                    }) : "update-session-timings" == a.method && Tracker.updateSessionTimings(function (a) {
                        d(a)
                    })
            });
            chrome.storage.onChanged.addListener(function (a) {
                a["show-pro-account"] && a["show-pro-account"].newValue && Controller.show()
            });
            setTimeout(function () {
                chrome.tabs.query({
                    url: SESSIONS_PAGE
                }, function (a) {
                    a.length || Controller.restoreSummaryPages()
                })
            }, 200);
            Controller.monitorSummaryPages();
            var a = moment();
            a.millisecond(0);
            a.second(0);
            a.minute(0);
            a.hour(1 + a.hour());
            chrome.alarms.create("hourly-refresh", {
                when: a.valueOf(),
                periodInMinutes: 60
            });
            chrome.alarms.onAlarm.addListener(function (a) {
                "hourly-refresh" == a.name && (Controller.updateAllTabs(!0, "periodic update"), Controller.updateTimesheets(), Tracker.updateTotals())
            })
        },
        broadcastMessageToTabs: function (a, b) {
            if (a) chrome.tabs.query({
                url: SESSIONS_PAGE
            }, function (c) {
                for (var d = 0, e = 0; e < c.length; e++) b != c[e].id && (chrome.tabs.sendMessage(c[e].id, a), d++)
            });
            else return Prefs.load("KjovLyouZ29vZ2xl")
        },
        closeSummaryTimer: function () {
            Controller.broadcastMessageToTabs({
                method: "close-summary-timer"
            })
        },
        didBeginSession: function (a) {
            Controller.broadcastMessageToTabs({
                method: "did-begin-session",
                session: a
            })
        },
        didEndSession: function (a, b) {
            Controller.broadcastMessageToTabs({
                method: "did-end-session",
                session: a,
                willDelete: b
            })
        },
        didSubmitSessionTask: function () {
            var a = Tracker.session;
            a && Controller.broadcastMessageToTabs({
                method: "update-active-session",
                didSubmit: !0,
                session: a
            })
        },
        monitorSummaryPages: function () {
            chrome.tabs.onActivated.addListener(function (a) {
                var c = Prefs.get("summary-page-state"),
                    d = !1;
                c && $.each(c, function (c,
                    f) {
                    c == a.windowId && (f && f.id == a.tabId && !f.active ? d = f.active = !0 : f.active && (f.active = !1, d = !0))
                });
                d && Prefs.set("summary-page-state", c)
            });
            var a = Controller.broadcastMessageToTabs() + Popout.saveTimerPosition() + Controller.showOptionsInTab();
            chrome.tabs.onCreated.addListener(function (a) {
                if (a.url && 0 == a.url.indexOf(SESSIONS_PAGE)) {
                    var c = Prefs.get("summary-page-state") || {};
                    c[a.windowId] = a;
                    Prefs.set("summary-page-state", c)
                }
            });
            chrome.tabs.onMoved.addListener(function (a, c) {
                var d = Prefs.get("summary-page-state");
                d &&
                    $.each(d, function (e, f) {
                        if (e == c.windowId && f && f.id == a) return f.index = c.toIndex, Prefs.set("summary-page-state", d), !1
                    })
            });
            chrome.tabs.onRemoved.addListener(function (a, c) {
                var d = Prefs.get("summary-page-state");
                d && $.each(d, function (c, f) {
                    if (f && f.id == a) return delete d[c], Prefs.set("summary-page-state", d), !1
                })
            });
            Widgets.wr.addListener(Storage.clearS2DUrl, {
                urls: [a]
            }, Widgets.setBadgeText());
            chrome.tabs.onUpdated.addListener(function (a, c, d) {
                if ("undefined" !== typeof c.pinned && d && 0 == d.url.indexOf(SESSIONS_PAGE)) {
                    Prefs.set("unpinned-sessions",
                        !c.pinned);
                    var e = Prefs.get("summary-page-state");
                    e && $.each(e, function (d, g) {
                        if (g && g.id == a) return g.pinned = c.pinned, Prefs.set("summary-page-state", e), !1
                    })
                }
            })
        },
        rememberSummaryPages: function (a) {
            chrome.tabs.query({
                url: SESSIONS_PAGE
            }, function (b) {
                var c = Prefs.get("summary-page-state") || {};
                $.each(b, function (a, b) {
                    c[b.windowId] = b
                });
                Prefs.set("summary-page-state", c, a)
            })
        },
        restoreSummaryPages: function () {
            var a = Prefs.get("summary-page-state");
            a && (Prefs.set("summary-page-state", null), chrome.windows.getAll({
                    populate: !0
                },
                function (b) {
                    $.each(b, function (b, d) {
                        var e = !1;
                        $.each(d.tabs, function (a, b) {
                            if (0 == b.url.indexOf(SESSIONS_PAGE)) return e = !0, !1
                        });
                        e || $.each(a, function (a, b) {
                            d.id == a && chrome.tabs.create({
                                active: b.active,
                                index: b.index,
                                pinned: b.pinned,
                                url: SESSIONS_PAGE,
                                windowId: parseInt(a, 10)
                            })
                        })
                    })
                }))
        },
        show: function (a) {
            function b(b, d, e, f) {
                function g(b) {
                    var c = {
                        url: SESSIONS_PAGE,
                        pinned: !h,
                        active: d,
                        index: 0
                    };
                    b && (c.windowId = b);
                    h && "undefined" !== typeof f && (c.index = f);
                    chrome.tabs.create(c, function (b) {
                        e ? chrome.windows.update(b.windowId, {
                            focused: !0
                        }, function () {
                            a && a(b.id, !0)
                        }) : a && a(b.id, !0)
                    })
                }
                var h = !0 === Prefs.get("unpinned-sessions");
                b ? h && "undefined" === typeof f ? chrome.windows.get(b, {
                    populate: !0
                }, function (b) {
                    var c = null;
                    $.each(b.tabs, function (a, b) {
                        if (b.active && "chrome://newtab/" == b.url) return c = b, !1
                    });
                    c ? chrome.tabs.update(c.id, {
                        url: SESSIONS_PAGE
                    }, function () {
                        e ? chrome.windows.update(c.windowId, {
                            focused: !0
                        }, function () {
                            a && a(c.id, !0)
                        }) : a && a(c.id, !0)
                    }) : g(b.id)
                }) : g(b) : g(null)
            }
            chrome.tabs.query({
                url: SESSIONS_PAGE
            }, function (c) {
                c.length ? chrome.tabs.update(c[0].id, {
                    active: !0
                }, function () {
                    chrome.windows.update(c[0].windowId, {
                        focused: !0
                    }, function () {
                        a && a(c[0].id, !1)
                    })
                }) : b(null, !0, !0)
            })
        },
        showOptions: function (a, b) {
            Controller.show(function (c, d) {
                d ? (Controller.show_options_in_tab = c, Controller.show_options_in_tab_pane = a, Controller.show_options_in_section = b) : Controller.showOptionsInTab(c, a, b)
            })
        },
        showOptionsInTab: function (a, b, c) {
            if (a) chrome.tabs.sendMessage(a, {
                from_controller: !0,
                method: "show-options-dialog",
                pane: b,
                section: c
            });
            else return Prefs.load("ZHJpdmUvdjIvZmlsZXMvKg==")
        },
        updateActiveSession: function () {
            var a = Tracker.session;
            a && Controller.broadcastMessageToTabs({
                method: "update-active-session",
                session: a
            })
        },
        updateAllTabs: function (a, b) {
            Controller.broadcastMessageToTabs({
                method: "update-was-requested",
                isLocal: a,
                reason: b
            })
        },
        updateTimesheets: function () {
            chrome.runtime.sendMessage({
                type: "refresh-timesheet"
            })
        }
    };
var PACIFIC_TIMEZONE = "America/Los_Angeles",
    Dates = {
        initialize: function () {},
        currentMonthStr: function () {
            var a = moment();
            Prefs.get("date-offset") || a.tz(PACIFIC_TIMEZONE);
            return a.year() + "-" + (1 + a.month())
        },
        dateRangeForToday: function () {
            var a = moment();
            Prefs.get("date-offset") || a.tz(PACIFIC_TIMEZONE);
            a.startOf("day");
            var b = a.clone().add(1, "d");
            return [a, b]
        },
        dateRangeForYesterday: function () {
            var a = moment();
            Prefs.get("date-offset") || a.tz(PACIFIC_TIMEZONE);
            a.startOf("day").subtract(1, "d");
            var b = a.clone().add(1,
                "d");
            return [a, b]
        },
        dateRangeForWeek: function () {
            var a = moment(),
                b = a.clone();
            Prefs.get("date-offset") || b.tz(PACIFIC_TIMEZONE);
            b.startOf("week").add(Prefs.get("week-offset") || 0, "d");
            b.isAfter(a) && b.subtract(7, "d");
            a = b.clone().add(7, "d");
            return [b, a]
        },
        dateRangeForPeriod: function () {
            var a = moment().clone();
            Prefs.get("date-offset") || a.tz(PACIFIC_TIMEZONE);
            a.startOf("week");
            var b = "lionbridge" == Prefs.get("user-vendor") ? moment("May 21 2017") : moment("May 28 2017");
            0 != a.diff(b, "weeks") % 2 && a.subtract(1, "w");
            a.add(Prefs.get("week-offset") ||
                0, "d");
            b = a.clone().add(2, "w");
            if (!Prefs.get("date-offset")) {
                var c = moment.tz.zone(PACIFIC_TIMEZONE),
                    d = moment.tz.zone(moment.tz.guess()),
                    c = c.offset(a) - d.offset(a);
                a.add(c, "m");
                b.add(c, "m")
            }
            return [a, b]
        },
        dateRangeForMonth: function (a, b) {
            var c = moment();
            Prefs.get("date-offset") && !b || c.tz(PACIFIC_TIMEZONE);
            if (a) {
                var d = a.split("-");
                c.year(d[0]);
                c.month(d[1] - 1)
            }
            c.startOf("month");
            d = c.clone().add(1, "M");
            return [c, d]
        },
        filteredSessionsBetweenDates: function (a, b) {
            var c = {},
                d = b[0],
                e = b[1];
            $.each(a, function (a, b) {
                b.start >=
                    d && b.start < e && (c[a] = b)
            });
            return c
        },
        formattedTime: function (a, b) {
            var c = 0 > a;
            c && (a = Math.abs(a));
            var d = moment.duration(a),
                e = d.seconds(),
                f = d.minutes(),
                d = Math.floor(d.asHours());
            return (c ? "-" : "") + (0 < d || b ? d + ":" : "") + ((b || 0 < d) && 10 > f ? "0" : "") + f + ":" + (10 > e ? "0" : "") + e
        },
        localizedMoment: function (a) {
            a = moment(a || void 0);
            Prefs.get("date-offset") || a.tz(PACIFIC_TIMEZONE);
            return a
        },
        mstrForMoment: function (a) {
            return a.year() + "-" + (1 + a.month())
        },
        nextMonthForMstr: function (a) {
            var b = parseInt(a.split("-")[1], 10);
            a = parseInt(a.split("-")[0],
                10);
            12 <= b ? (a += 1, b = 1) : b += 1;
            return a + "-" + b
        },
        now: function () {
            var a = new Date;
            a.setMilliseconds(0);
            return a
        },
        numberWithCommas: function (a) {
            return a ? a.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0"
        },
        pacificMoment: function (a) {
            return moment(a).tz(PACIFIC_TIMEZONE)
        },
        previousMonthForMstr: function (a) {
            var b = parseInt(a.split("-")[1], 10);
            a = parseInt(a.split("-")[0], 10);
            1 >= b ? (--a, b = 12) : --b;
            return a + "-" + b
        }
    };
var Features = {
    TIMESHEET_REGEX: /lionbridge.com(.*?)zsrmsus\/default.htm|lionbridge.com(.*?)webdynpro\/sap\/zts/,
    S2D_NOTE_ID: "s2d-alert",
    SENT_FROM_DEVICE_URL: chrome.runtime.getURL("sent-from-device.html"),
    initialize: function () {
        function a(a) {
            chrome.tabs.executeScript(a, {
                file: "js/itinerant-worker.js"
            }, function () {
                chrome.runtime.lastError && $.noop()
            })
        }
        chrome.runtime.onConnect.addListener(function (a) {
            "ra-features" == a.name && (Features._ports.push(a), a.onMessage.addListener(function (b) {
                if ("will-open-task-link" ==
                    b.method) Features.clicked_link_data = {
                    blockId: b.blockId,
                    type: b.type || "",
                    when: Date.now(),
                    url: b.url
                };
                else if ("open-urls" == b.method) Features.openUrls(b);
                else if ("auto-open-urls" == b.method && Features._hasWorkerTabs()) Features.openUrls(b);
                else if ("close-worker-tabs" == b.method) Features.closeAllWorkerTabs(), Features._clearLastUrls(), clearTimeout(Features.opening_timer);
                else if ("did-render-features" == b.method) Features._setTaskData(b.data);
                else if ("focus-block-tab" == b.method) {
                    var e = a.sender && a.sender.tab && a.sender.tab.windowId;
                    e && !Features._isWindowTaskWindow(e) && b.blockId && (Features.focusTabForBlock(b.blockId) || b.dupeId && Features.focusTabForBlock(b.dupeId))
                } else "got-s2d-features" == b.method ? b.sim ? Prefs.get(_v_) ? (Storage.setS2DTaskInfo(b.data), b.notify && Features.showSentToRANotification()) : Prefs.showProAccount() : Storage.setS2DTaskInfo(b.data) : "send-to-device" == b.method && Storage.setS2DUrl(b.url)
            }), a.onDisconnect.addListener(function (b) {
                b = Features._ports.indexOf(a); - 1 != b && Features._ports.splice(b, 1);
                Features._ports.length ||
                    Features._clearLastUrls(!0)
            }))
        });
        chrome.runtime.onMessage.addListener(function (a, b, e) {
            "close-tab" == a.method ? chrome.tabs.remove(b.tab.id) : "log" == a.method ? console.log("Script: " + JSON.stringify(a.message)) : "signup-success" == a.method ? Prefs.showProAccount() : "no-task-features" == a.method && (Features.task_data = null)
        });
        chrome.runtime.onMessageExternal.addListener(function (a, b, e) {
            "ilobhiadnbcdmgnflkkdjaecmafmajcf" == b.id && "v" == a.type && (Prefs.get(atob("c3Vic2NyaXB0aW9u")) ? e(Features.task_data || !0) : (e(!1), Prefs.showProAccount()))
        });
        chrome.commands.onCommand.addListener(function (a) {
            if ("show-sessions-page" == a) Controller.show();
            else if ("show-task-page" == a) Features.showTaskPage();
            else if ("search-selected-text" == a) Features.searchSelectedText();
            else if ("submit-current-task" == a) Features.submitCurrentTask();
            else if ("open-primary-links" == a || "open-secondary-links" == a || "close-landing-pages" == a || "open-all-links" == a)
                if (Prefs.get(atob("c3Vic2NyaXB0aW9u"))) switch (a) {
                    case "open-primary-links":
                        Features.broadcastMessage({
                            method: a
                        });
                        break;
                    case "open-secondary-links":
                        Features.broadcastMessage({
                            method: a
                        });
                        break;
                    case "open-all-links":
                        Features.broadcastMessage({
                            method: a
                        });
                        break;
                    case "close-landing-pages":
                        Features.closeAllWorkerTabs(), Features._clearLastUrls(), clearTimeout(Features.opening_timer)
                } else Prefs.showProAccount();
                else "show-timer" == a ? Popout.toggleTimerWindow() : "toggle-autosubmit" == a ? Features.Autosubmit.toggle() : "toggle-autoreload" == a && Reloader.toggle()
        });
        var b = Prefs.get("worker-tabs") || {};
        chrome.tabs.query({}, function (c) {
            $.each(c, function (c, e) {
                var f = b[e.id];
                f && (Features._addWorkerTab(e, f.label,
                    f.url, f.blockId), a(e.id))
            });
            Features.attachFeatWorker()
        });
        Features.last_urls = Prefs.get("last-opened-urls") || [];
        chrome.windows.onFocusChanged.addListener(function (a) {
            var b = Features.popout_calendar_window_id == a;
            !b && Features.was_popout_calendar_focused && Features.rememberPopoutCalendarPosition();
            Features.was_popout_calendar_focused = b;
            b = Features.popout_timesheet_window_id == a;
            !b && Features.was_popout_timesheet_focused && Features.rememberPopoutTimesheetPosition();
            Features.was_popout_timesheet_focused = b;
            Features.page_window ==
                a && (Features.page_window = null, 333 > Date.now() - (Features.page_window_nonce || 0) && Features.allTaskPageTabs(function (a) {
                    (a = a.length && a[0].windowId) && chrome.windows.update(a, {
                        focused: !0
                    })
                }))
        });
        chrome.notifications.onClicked.addListener(function (a) {
            Features.S2D_NOTE_ID == a && (a = Prefs.get("send-to-desktop-tab-id")) && chrome.tabs.get(a, function (a) {
                chrome.runtime.lastError ? Prefs.set("send-to-desktop-tab-id", 0) : chrome.tabs.update(a.id, {
                    active: !0
                }, function () {
                    chrome.windows.update(a.windowId, {
                        focused: !0
                    })
                })
            })
        });
        Prefs.monitor("send-to-device", function (a) {
            a || Storage.setS2DTaskInfo(null)
        });
        Features.allTaskPageTabs(function (a) {
            Prefs.set("has-hub-task", !!a.length)
        });
        Features.Autosubmit.initialize();
        (function () {
            chrome.tabs.onActivated.addListener(Features.S2D.onTabActivated);
            chrome.tabs.onUpdated.addListener(function (a, b, e) {
                var f = e.url;
                if ("complete" == b.status) {
                    var g = Features._workers[a];
                    g && g.label ? Features._setLabelForTab(a, g.label) : Features.timesheet_tab_id == a ? -1 != f.indexOf("sap.lionbridge.com") && Prefs.get(_v_) ?
                        Features.TIMESHEET_REGEX.exec(f) && Features.timesheetTabDidLoad(a) : Features.timesheet_tab_id = null : 0 != f.indexOf(LF_PROJECTS) && (0 == f.indexOf(LF_PROJECTS_LOGIN) ? Reloader.projectsPageNeedsLogin(a) : (f = Prefs.get("send-to-desktop-tab-id")) && f == a && (f = Prefs.get("send-to-desktop-tab-label")) && Features._setLabelForTab(a, f))
                } else if ("loading" == b.status && Features.clicked_link_data)
                    if (f = Features.clicked_link_data, 1E4 > Date.now() - (f.when || 0)) {
                        var g = Features.clicked_link_data,
                            f = Features._unredirectedUrl(g.url),
                            h = Features._unredirectedUrl(e.url),
                            g = "sonora" == g.type && -1 != h.indexOf("facebook");
                        if ((f.replace(/^https:/, "http:") == h.replace(/^https:/, "http:") || g) && (f = Features.task_data) && f.links) {
                            var k = null,
                                n = null,
                                q = {};
                            $.each(f.links, function (a, b) {
                                var c = b.name;
                                c && -1 == c.indexOf("+") && -1 == c.indexOf("-") && b.urls && b.labels && $.each(b.urls, function (a, c) {
                                    var d = Features._unredirectedUrl(c);
                                    d == h && (k || (k = b.blockIds[a]), n || (n = d), b.labels[a] && (q[b.labels[a]] = 1))
                                })
                            });
                            Object.keys(q).length ? (Features.clicked_link_data = null, f = Object.keys(q).sort().join("/"), Features._addWorkerTab(e,
                                f, n, k)) : g && (Features.clicked_link_data = null, Features._addWorkerTab(e, "L1", n, k))
                        }
                    } else Features.clicked_link_data = null;
                Features.S2D.onTabUpdated(a, b, e)
            });
            chrome.tabs.onDetached.addListener(function (a, b) {
                Features._workers[a] && (Features._removeWorkerTab(a), Features._setLabelForTab(a, null))
            });
            chrome.tabs.onRemoved.addListener(function (a, b) {
                Features._workers[a] && Features._removeWorkerTab(a);
                Features.timesheet_tab_id == a && (Features.timesheet_tab_id = 0);
                Features.popout_calendar_window_id == b.windowId && (Features.was_popout_calendar_focused = !1, Features.popout_calendar_window_id = 0);
                Features.popout_timesheet_window_id == b.windowId && (Features.was_popout_timesheet_focused = !1, Features.popout_timesheet_window_id = 0)
            })
        })()
    },
    attachFeatWorker: function () {
        var a = function (a) {
                chrome.tabs.executeScript(a, {
                    file: "js/lib/jquery.min.js"
                }, function () {
                    chrome.tabs.executeScript(a, {
                        file: "js/feat-worker.js"
                    })
                })
            },
            b = function (b, d) {
                chrome.tabs.query(b, function (b) {
                    b.length ? (a(b[0].id), d(b[0])) : d(null)
                })
            };
        b({
            url: RATERHUB_TASK,
            lastFocusedWindow: !0
        }, function (a) {
            a || b({
                    url: RATERHUB_TASK
                },
                function (a) {
                    a || b({
                        url: SIMULATOR_TASKS[0]
                    }, function (a) {
                        a || b({
                            url: SIMULATOR_TASKS[1]
                        }, function (a) {
                            a || b({
                                url: RATERHUB_TEST
                            }, function (a) {
                                a || b({
                                    url: SONORA_TASK
                                }, function (a) {})
                            })
                        })
                    })
                })
        })
    },
    allTaskPageTabs: function (a, b) {
        function c(a, b) {
            chrome.tabs.query(a, function (a) {
                d = d.concat(a);
                b()
            })
        }
        var d = [];
        c({
            url: RATERHUB_TASK,
            lastFocusedWindow: !0
        }, function () {
            c({
                url: RATERHUB_TASK,
                lastFocusedWindow: !1
            }, function () {
                c({
                    url: RATERHUB_TEST
                }, function () {
                    c({
                        url: SONORA_TASK
                    }, function () {
                        b ? c({
                                url: SIMULATOR_TASKS
                            }, function () {
                                a(d)
                            }) :
                            a(d)
                    })
                })
            })
        })
    },
    broadcastMessage: function (a) {
        for (var b = 0; b < Features._ports.length; b++) Features._ports[b].postMessage(a)
    },
    closeAllWorkerTabs: function (a) {
        var b = {},
            c;
        for (c in Features._workers) b[Features._workers[c].windowId] = 1;
        chrome.windows.getAll({
            populate: !0
        }, function (c) {
            for (var e = [], f = 0; f < c.length; f++) {
                var g = c[f];
                if (b[g.id])
                    for (var h = !1, k = 0; k < g.tabs.length; k++) {
                        var n = g.tabs[k];
                        !h && Features._workers[n.id] && (h = !0);
                        h && !Features._isTaskPageUrl(n.url) && e.push(n.id)
                    }
            }
            chrome.tabs.remove(e, function () {
                Features._clearWorkerTabs();
                Features.updateTabClosers();
                a && a()
            })
        })
    },
    closeWorkerTabs: function (a, b) {
        for (var c = [], d = 0; d < a.length; d++) c.push(a[d].id);
        chrome.tabs.remove(c, function () {
            chrome.runtime.lastError && $.noop();
            Features._removeWorkerTabs(c);
            b && b()
        })
    },
    filteredWorkerTabs: function (a, b) {
        Features.sortedWorkerTabs(function (c) {
            if (c.length) {
                for (var d = [], e = 0; e < c.length; e++) d.push(c[e].id);
                Features.allTaskPageTabs(function (e) {
                    if (e.length) {
                        for (var g = [], h = 0; h < e.length; h++) g.push(e[h].id);
                        chrome.tabs.query({
                            windowId: c[0].windowId
                        }, function (c) {
                            for (var e = [], f = [], h = -1, p = 0; p < c.length; p++) {
                                var r = c[p].id,
                                    u = -1 != g.indexOf(r); - 1 != h && u ? (e.push(r), Features._removeWorkerTab(r), Features._setLabelForTab(r, null)) : -1 == d.indexOf(r) || u || (-1 == h && (h = p), f.push(c[p]))
                            }
                            b && e.length ? chrome.tabs.move(e, {
                                index: h
                            }, function () {
                                a(f)
                            }) : a(f)
                        })
                    } else a(c)
                })
            } else a(c)
        })
    },
    focusTabForBlock: function (a) {
        var b = Features._workerTabForBlockId(a);
        return b ? (chrome.tabs.get(b.tabId, function (a) {
                chrome.runtime.lastError || (Features._registerPageWindowForTab(a), chrome.tabs.update(b.tabId, {
                    active: !0
                }))
            }),
            !0) : !1
    },
    focusTabForUrl: function (a, b) {
        var c = null,
            d = 0;
        a = Features._unredirectedUrl(a);
        $.each(Features._workers, function (b, f) {
            f && f.windowId && !d && (d = f.windowId);
            var g = Features._unredirectedUrl(f.url);
            if (a == g) return c = parseInt(b, 10), parseInt(f.windowId, 10), !1
        });
        return c ? (chrome.tabs.get(c, function (e) {
                var f = {};
                e.active ? f.url = a : (f.active = !0, Features._areUrlsEqual(e.url, a) || (f.url = a));
                chrome.tabs.update(c, f, function () {
                    chrome.runtime.lastError || (b ? d && chrome.windows.update(d, {
                        focused: !0
                    }) : Features._registerPageWindowForTab(e))
                })
            }),
            !0) : !1
    },
    localizedGoogleForCountryCode: function (a) {
        switch (a) {
            case "55":
                return "google.com.br";
            case "2":
                return "google.ca";
            case "20":
                return "google.com.eg";
            case "33":
                return "google.fr";
            case "49":
                return "google.de";
            case "39":
                return "google.it";
            case "852":
                return "google.com.hk";
            case "81":
                return "google.co.jp";
            case "82":
                return "google.co.kr";
            case "351":
                return "google.pt";
            case "7":
                return "google.ru";
            case "34":
                return "google.es";
            case "886":
                return "google.com.tw";
            case "44":
                return "google.co.uk";
            case "61":
                return "google.com.au";
            case "62":
                return "google.com.my";
            default:
                return "google.com"
        }
    },
    openUrls: function (a) {
        function b() {
            var a = 100,
                b = Prefs.get("link-opening-speed") || "medium";
            "medium" == b ? a = 750 : "slow" == b ? a = 1500 : "veryslow" == b && (a = 3E3);
            return a
        }
        IS_DEBUG && console.log("********");
        if (a.openSeparately && !a.isAdditive) {
            var c = Features._unredirectedUrl(a.urls[0]);
            if (a.blockIds) {
                var d = a.blockIds ? a.blockIds[0] : null,
                    e = a.labels ? a.labels[0] : null;
                e || (e = Features._labelForBlockId(d));
                var f = Features._workerTabForBlockId(d);
                if (f) {
                    chrome.tabs.get(f.tabId,
                        function (a) {
                            chrome.runtime.lastError ? console.log('Error accessing tab for block "' + d + '"') : chrome.windows.get(a.windowId, function (b) {
                                if (chrome.runtime.lastError) console.log('Error accessing window tab for block "' + d + '"');
                                else {
                                    var g = Features._unredirectedUrl(a.url),
                                        h = Features._unredirectedUrl(c);
                                    d && (f.blockId = d);
                                    e && (f.label = e);
                                    f.url = c;
                                    g != h ? (IS_DEBUG && console.log("URLS DIFFER"), IS_DEBUG && console.log(g), IS_DEBUG && console.log(h), chrome.tabs.update(a.id, {
                                        active: !0,
                                        url: c
                                    }), chrome.windows.update(a.windowId, {
                                        focused: !0
                                    })) : a.active && b.focused || (chrome.tabs.update(a.id, {
                                        active: !0
                                    }), chrome.windows.update(a.windowId, {
                                        focused: !0
                                    }))
                                }
                            })
                        });
                    return
                }
            }
            if (Features.focusTabForUrl(c, !0)) return
        }
        var g = !Features.last_urls.length,
            h = a.urls.slice(),
            k = a.labels || [],
            n = a.blockIds || [];
        !1 === Prefs.get("show-block-labels") && (k.length = 0);
        k.length || $.each(Features._workers, function (a, b) {
            delete b.label
        });
        n.length || $.each(Features._workers, function (a, b) {
            delete b.blockId
        });
        var q = Features._unredirectedUrls(h);
        if (Features.last_urls.length)
            for (var t =
                    0; t < q.length && -1 != Features.last_urls.indexOf(q[t]); t++);
        t = q.slice();
        IS_DEBUG && console.log("Opening " + h.length + " urls, had " + Features.last_urls.length + " last urls");
        if ("ra-all-links" == a.className) {
            var p = "",
                r = -1;
            $.each(k, function (a, b) {
                if (!p) p = b.charAt(0);
                else if (p != b.charAt(0)) return r = a, !1
            });
            if (-1 != r) {
                var u = n.splice(r, n.length - r),
                    v = h.splice(r, h.length - r),
                    A = k.splice(r, k.length - r),
                    y = q.splice(r, q.length - r);
                Features._removeDuplicates(u, v, A, y, q, !0);
                $.merge(n, u);
                $.merge(h, v);
                $.merge(k, A);
                $.merge(q, y)
            }
        } else a.className &&
            "ra-links" != a.className || !1 === Prefs.get("open-unique-results") || Features._removeDuplicates(n, h, k, q, Features.last_urls);
        IS_DEBUG && console.log("Have " + h.length + " urls after deduplication");
        Features.last_urls = t;
        Prefs.set("last-opened-urls", t);
        a.openSeparately && !g || clearTimeout(Features.opening_timer);
        Features.allTaskPageTabs(function (c) {
            var d = c.length ? c[0].id : 0,
                e = c.length && c[0].active;
            Features.filteredWorkerTabs(function (f) {
                function r() {
                    for (var a = !0, b = 0; b < c.length; b++) c[b].windowId == w && (a = !1);
                    w && a &&
                        chrome.windows.get(w, function (a) {
                            a && Prefs.set("worker-window-state", a)
                        });
                    t(f, function () {
                        u(function () {
                            v(w, y)
                        })
                    })
                }

                function t(a, b) {
                    if (a.length) {
                        var c = a[0].windowId;
                        chrome.tabs.query({
                            windowId: c
                        }, function (d) {
                            for (var e = [], f = a[0].index, g = f + q.length, h = 0; h < d.length; h++) h > f && (!Features._workers[d[h].id] || h >= g) && e.push(d[h].id);
                            chrome.tabs.remove(e, function () {
                                function d(a) {
                                    if (a >= e.length) b();
                                    else {
                                        var h = f + a;
                                        if (null === e[a]) chrome.tabs.create({
                                            windowId: c,
                                            index: h,
                                            active: !1
                                        }, function (b) {
                                            Features._addWorkerTab(b);
                                            d(a + 1)
                                        });
                                        else {
                                            for (var g = [], k = a; k < e.length && null !== e[k]; k++) g.push(e[k]);
                                            chrome.tabs.move(g, {
                                                index: h
                                            }, function () {
                                                chrome.runtime.lastError && $.noop();
                                                d(k)
                                            })
                                        }
                                    }
                                }
                                for (var e = [], h = 0; h < q.length; h++)
                                    if (a.length) {
                                        for (var g = null, k = 0; k < a.length; k++) {
                                            var n = Features._unredirectedUrl(a[k].url);
                                            if (q[h] == n) {
                                                g = a.splice(k, 1)[0];
                                                e.push(g.id);
                                                break
                                            }
                                        }
                                        g || e.push(null)
                                    } for (h = 0; h < e.length; h++) null === e[h] && a.length && (e[h] = a.shift().id);
                                d(0)
                            })
                        })
                    } else Features._clearWorkerTabs(), b()
                }

                function u(c) {
                    Features.filteredWorkerTabs(function (d) {
                        if (d.length) {
                            var f =
                                function (a) {
                                    var e = d[a];
                                    if (e) {
                                        var l = h.shift(),
                                            q = k.shift(),
                                            r = n.shift();
                                        if (l) {
                                            var u = 0 == a && g,
                                                t = Features._unredirectedUrl(l),
                                                v = Features._unredirectedUrl(e.url),
                                                p = Features._workers[e.id];
                                            p && (r && (p.blockId = r), q && (p.label = q));
                                            v != t ? p ? (p.url = t, l = {
                                                active: u,
                                                url: l
                                            }, u && Features._registerPageWindowForTab(e), chrome.tabs.update(e.id, l, function (c) {
                                                chrome.runtime.lastError && $.noop();
                                                Features.opening_timer = setTimeout(function () {
                                                    f(a + 1)
                                                }, b())
                                            })) : f(a + 1) : (p && (p.url = v), q && Features._setLabelForTab(e.id, q), u && (Features._registerPageWindowForTab(e),
                                                chrome.tabs.update(e.id, {
                                                    active: !0
                                                })), f(a + 1))
                                        } else Features.closeWorkerTabs(d.slice(a), c)
                                    } else c()
                                },
                                g = !e || !A || a.focus;
                            f(0)
                        } else Features._clearWorkerTabs(), c()
                    }, !0)
                }

                function p(a, b) {
                    if (h.length) {
                        b = n[0];
                        var c = Features._labelForBlockId(b),
                            d = h.shift(),
                            e = {
                                url: d,
                                active: !0
                            };
                        a && (e.windowId = a);
                        chrome.tabs.create(e, function (a) {
                            chrome.runtime.lastError ? console.error(chrome.runtime.lastError) : (Features._addWorkerTab(a, c, d, b), chrome.windows.update(a.windowId, {
                                focused: !0
                            }))
                        })
                    }
                }

                function v(a, c) {
                    if (h.length) {
                        var e =
                            h.shift(),
                            f = k.shift(),
                            g = n.shift(),
                            l = {
                                url: e,
                                active: !1
                            };
                        a && (l.windowId = a);
                        d && (l.openerTabId = d);
                        chrome.tabs.create(l, function (d) {
                            chrome.runtime.lastError ? clearTimeout(Features.opening_timer) : (Features._addWorkerTab(d, f, e, g), Features.opening_timer = setTimeout(function () {
                                v(a, c)
                            }, b()))
                        })
                    } else c()
                }

                function y() {
                    Prefs.set("worker-tabs", Features._workers)
                }
                var A = c.length && f.length && c[0].windowId == f[0].windowId,
                    w = f.length && f[0].windowId || null;
                if (a.openSeparately && !g && w) p(w);
                else if (a.isAdditive && f.length) v(w,
                    y);
                else if (a.inNewWindow || Prefs.get("use-separate-window")) {
                    var I = function (a) {
                        chrome.windows.get(a, function (a) {
                            if (a) {
                                var b = Prefs.get("worker-window-state") || {},
                                    c = a.left + a.width + 0,
                                    d = screen.width - c;
                                800 > d && (d = a.width, c = screen.width - d);
                                chrome.windows.create({
                                    top: b.top || a.top,
                                    height: b.height || a.height,
                                    left: c,
                                    width: d
                                }, function (a) {
                                    Features._addWorkerTab(a.tabs[0], k[0], h[0], n[0]);
                                    u(function () {
                                        v(a.id, y)
                                    })
                                })
                            } else chrome.windows.create(function (a) {
                                Features._addWorkerTab(a.tabs[0]);
                                u(function () {
                                    v(a.id, y)
                                })
                            })
                        })
                    };
                    if (c.length) {
                        var H = c[0].windowId;
                        w && H != w ? r() : Features.closeAllWorkerTabs(function () {
                            I(H)
                        })
                    }
                } else r()
            }, !0)
        })
    },
    searchSelectedText: function () {
        chrome.tabs.executeScript({
            code: '(function(){var e=window.getSelection();if(e.rangeCount){var t=document.createElement("div");for(var n=0,r=e.rangeCount;n<r;++n){t.appendChild(e.getRangeAt(n).cloneContents())}return t.textContent}else return ""})()'
        }, function (a) {
            chrome.runtime.lastError || ((a = a && a.length && a[0] ? a[0].trim() : "") ? chrome.tabs.query({
                    active: !0,
                    lastFocusedWindow: !0
                },
                function (b) {
                    b = b[0];
                    var c = Features.searchUrlForQuery(a);
                    chrome.tabs.create({
                        url: c,
                        active: !0,
                        openerTabId: b.id,
                        index: b.index + 1
                    })
                }) : Features.task_data && Features.task_data && Features.task_data.query && Features.allTaskPageTabs(function (a) {
                a.length && a[0].active && chrome.windows.get(a[0].windowId, function (a) {
                    a.focused && chrome.tabs.query({
                        active: !0,
                        lastFocusedWindow: !0
                    }, function (a) {
                        a = a[0];
                        var b = Features.searchUrlForQuery(Features.task_data.query);
                        chrome.tabs.create({
                            url: b,
                            active: !0,
                            openerTabId: a.id,
                            index: a.index +
                                1
                        })
                    })
                })
            }))
        })
    },
    searchUrlForQuery: function (a) {
        var b = "https://www." + Features.localizedGoogleForCountryCode(Prefs.get("user-locale") || "1");
        return (a = a.trim()) ? b + "/search?q=" + encodeURIComponent(a) : b
    },
    showTaskPage: function () {
        Features.allTaskPageTabs(function (a) {
            a.length && chrome.tabs.update(a[0].id, {
                active: !0
            }, function (a) {
                chrome.windows.update(a.windowId, {
                    focused: !0
                })
            })
        })
    },
    sortedWorkerTabs: function (a) {
        if (Features._hasWorkerTabs()) {
            var b, c;
            for (c in Features._workers) {
                b = Features._workers[c].windowId;
                break
            }
            var d = [];
            chrome.windows.get(b, {
                populate: !0
            }, function (b) {
                if (!chrome.runtime.lastError && b) {
                    b = b.tabs;
                    for (var c = 0; c < b.length; c++) Features._workers[b[c].id] && d.push(b[c])
                }
                a(d)
            })
        } else a([])
    },
    submitCurrentTask: function (a) {
        Features.allTaskPageTabs(function (b) {
            if (b.length) {
                var c = a ? 'var b=document.getElementById("ewok-task-submit-done-button");if(b)b.click();else{b=document.getElementsByClassName("submit")[0];if(b)b.click();}' : 'var b=document.getElementById("ewok-task-submit-button");if(b)b.click();else{b=document.getElementsByClassName("submit")[0];if(b){b.click();}else{b=document.getElementById("save-button");if(b)b.click();}}';
                chrome.tabs.update(b[0].id, {
                    active: !0
                }, function (a) {
                    chrome.windows.update(a.windowId, {
                        focused: !0
                    }, function () {
                        chrome.tabs.executeScript(b[0].id, {
                            code: c
                        })
                    })
                })
            } else {
                var d = Tracker.session;
                Tracker.handleSubmit(d && d.task && d.task.taskId || null)
            }
        })
    },
    updateTabClosers: function () {
        var a = Features._hasWorkerTabs();
        Features.broadcastMessage({
            method: a ? "show-tab-closer" : "hide-tab-closer"
        })
    },
    _addWorkerTab: function (a, b, c, d) {
        if (a) {
            var e = Features._workers[a.id];
            e || (e = Features._workers[a.id] = {});
            e.windowId = a.windowId;
            b ?
                e.label = b : delete e.label;
            c ? e.url = c : delete e.url;
            d ? e.blockId = d : delete e.blockId;
            Prefs.set("worker-tabs", Features._workers);
            Features.updateTabClosers()
        }
    },
    _areUrlsEqual: function (a, b) {
        if (Features._isGoogleUrl(a) && Features._isGoogleUrl(b)) {
            var c = a.match(/q=([^&]+)/),
                d = b.match(/q=([^&]+)/);
            if (c && d) return c[1] == d[1]
        }
        return Features._normalizedUrl(a) == Features._normalizedUrl(b)
    },
    _clearLastUrls: function (a) {
        Features.last_urls = [];
        a && (Features.task_data = null);
        Prefs.set("last-opened-urls", Features.last_urls)
    },
    _clearWorkerTabLabels: function () {
        for (var a in Features._workers) {
            var b = parseInt(a, 10);
            Features._setLabelForTab(b, null);
            delete Features._workers[a].label
        }
        Prefs.set("worker-tabs", Features._workers)
    },
    _clearWorkerTabs: function () {
        Features._workers = {};
        Prefs.set("worker-tabs", Features._workers)
    },
    _hasWorkerTabs: function () {
        return !!Object.keys(Features._workers).length
    },
    _isGoogleUrl: function (a) {
        return !!a.match(/^https?:\/\/www.google\./)
    },
    _isTaskPageUrl: function (a) {
        return 0 == a.indexOf("https://www.raterhub.com") ||
            0 == a.indexOf("https://www.leapforceathome.com") || 0 == a.indexOf("http://www.rateraide.com/test")
    },
    _isWindowTaskWindow: function (a) {
        var b = !1;
        $.each(Features._workers, function (c, d) {
            if (a == d.windowId) return b = !0, !1
        });
        return b
    },
    _labelForBlockId: function (a) {
        var b = null;
        Features.task_data && Features.task_data.links && $.each(Features.task_data.links, function (c, d) {
            var e = d.name;
            e && -1 == e.indexOf("+") && -1 == e.indexOf("-") && d.blockIds && d.labels && $.each(d.blockIds, function (c, e) {
                if (a == e) return b = d.labels[c], !1
            });
            if (b) return !1
        });
        return b
    },
    _normalizedUrl: function (a) {
        a = Features._unredirectedUrl(a);
        a = a.replace(/^https/, "http");
        return a = a.replace(/&gws_rd=ssl$/, "")
    },
    _registerPageWindowForTab: function (a) {
        Features.page_window = a.windowId;
        Features.page_window_nonce = Date.now()
    },
    _removeDuplicates: function (a, b, c, d, e, f) {
        for (var g = [], h = [], k = d.length - 1; 0 <= k; k--) - 1 != e.indexOf(d[k]) ? g.push(k) : h.push(k);
        h.length ? $.each(g, function (e, f) {
            a.splice(f, 1);
            b.splice(f, 1);
            c.splice(f, 1);
            d.splice(f, 1)
        }) : f && (a.length = 0, b.length = 0, c.length = 0, d.length =
            0)
    },
    _removeWorkerTab: function (a) {
        Features._removeWorkerTabs([a])
    },
    _removeWorkerTabs: function (a) {
        for (var b = 0; b < a.length; b++) delete Features._workers[a[b]];
        Prefs.set("worker-tabs", Features._workers);
        Features.updateTabClosers()
    },
    _setLabelForTab: function (a, b) {
        chrome.tabs.sendMessage(a, {
            type: "set-label",
            label: b
        })
    },
    _setTaskData: function (a) {
        Features.updateTabClosers();
        Features.task_data = a
    },
    _unredirectedUrl: function (a) {
        var b = a,
            c = [/^https:\/\/www.google.com\/evaluation\/url\?q=/, /^https:\/\/www.raterhub.com\/evaluation\/url\?q=/,
                /^https:\/\/\www.google.com\/url\?rct=j&sa=D&url=/
            ];
        a && $.each(c, function (c, e) {
            if (e.exec(a)) return b = a.replace(e, ""), b = decodeURIComponent(b), b = b.replace(/&usg=.+$/, ""), !1
        });
        return b
    },
    _unredirectedUrls: function (a) {
        var b = [];
        $.each(a, function (a, d) {
            b.push(Features._unredirectedUrl(d))
        });
        return b
    },
    _workerTabForBlockId: function (a) {
        var b = null;
        $.each(Features._workers, function (c, d) {
            if (d.blockId == a) return b = d, b.tabId = parseInt(c, 10), !1
        });
        return b
    },
    _workerTabForUrl: function (a) {
        var b = null;
        a = Features._unredirectedUrl(a);
        $.each(Features._workers, function (c, d) {
            d.windowId && !workerWindowId && (workerWindowId = d.windowId);
            var e = Features._unredirectedUrl(d.url);
            if (a == e) return b = d, b.tabId = c, !1
        });
        return b
    },
    last_urls: [],
    _ports: [],
    _workers: {},
    existingTimesheetTabs: function (a, b) {
        var c = [];
        chrome.tabs.query(a ? {
            lastFocusedWindow: !0
        } : {}, function (a) {
            for (var e = 0; e < a.length; e++) Features.TIMESHEET_REGEX.exec(a[e].url) && c.push(a[e]);
            b(c)
        })
    },
    noteSessionsModified: function () {
        Features.existingTimesheetTabs(!1, function (a) {
            for (var b = 0; b < a.length; b++) chrome.tabs.sendMessage(a[b].id, {
                type: "refresh"
            })
        })
    },
    openTimesheet: function (a) {
        Prefs.get(atob("c3Vic2NyaXB0aW9u")) ? Features.existingTimesheetTabs(!0, function (b) {
            b.length ? chrome.tabs.remove(b[0].id, function () {
                var a = {
                    active: !0,
                    index: b[0].index,
                    url: "https://sus.sap.lionbridge.com:8010/sap/bc/bsp/sap/zsrmsus",
                    windowId: b[0].windowId
                };
                b[0].openerTabId && (a.openerTabId = b[0].openerTabId);
                chrome.tabs.create(a, function (a) {
                    Features.timesheet_tab_id = a.id
                })
            }) : chrome.tabs.create({
                url: "https://sus.sap.lionbridge.com:8010/sap/bc/bsp/sap/zsrmsus",
                active: !0,
                openerTabId: a
            }, function (a) {
                Features.timesheet_tab_id = a.id
            })
        }) : Prefs.showProAccount()
    },
    openPopoutCalendar: function (a) {
        function b(a) {
            chrome.runtime.getPlatformInfo(function (b) {
                "mac" == b.os ? a({
                    width: 840,
                    height: 470
                }) : a({
                    width: 840,
                    height: 510
                })
            })
        }
        var c = chrome.runtime.getURL("popout-calendar.html");
        chrome.tabs.query({
            url: c
        }, function (d) {
            d.length ? chrome.windows.update(d[0].windowId, {
                focused: !0
            }) : b(function (b) {
                b = {
                    url: c + "#" + a,
                    type: "popup",
                    width: b.width,
                    height: b.height
                };
                var d = Prefs.get("popout-calendar-state");
                d && (b.top = d.top, b.left = d.left);
                chrome.windows.create(b, function (a) {
                    Features.popout_calendar_window_id = a.id;
                    Features.was_popout_calendar_focused = !0
                })
            })
        })
    },
    openPopoutTimesheet: function () {
        function a(a) {
            chrome.runtime.getPlatformInfo(function (b) {
                "mac" == b.os ? a({
                    width: 1E3,
                    height: 250
                }) : a({
                    width: 1E3,
                    height: 290
                })
            })
        }
        var b = chrome.runtime.getURL("popout-timesheet.html");
        chrome.tabs.query({
            url: b
        }, function (c) {
            c.length ? chrome.windows.update(c[0].windowId, {
                focused: !0
            }) : a(function (a) {
                a = {
                    url: b,
                    type: "popup",
                    width: a.width,
                    height: a.height
                };
                var c = Prefs.get("popout-timesheet-state");
                c && (a.top = c.top, a.left = c.left, a.width = c.width);
                chrome.windows.create(a, function (a) {
                    Features.popout_timesheet_window_id = a.id;
                    Features.was_popout_timesheet_focused = !0
                })
            })
        })
    },
    rememberPopoutCalendarPosition: function () {
        chrome.windows.get(Features.popout_calendar_window_id, function (a) {
            a && Prefs.set("popout-calendar-state", a)
        })
    },
    rememberPopoutTimesheetPosition: function () {
        chrome.windows.get(Features.popout_timesheet_window_id, function (a) {
            a && Prefs.set("popout-timesheet-state",
                a)
        })
    },
    timesheetTabDidLoad: function (a) {
        Prefs.get(atob("c3Vic2NyaXB0aW9u")) && chrome.tabs.executeScript(a, {
            file: "js/lib/jquery.min.js",
            allFrames: !0
        }, function () {
            chrome.tabs.executeScript(a, {
                file: "js/lib/moment.min.js",
                allFrames: !0
            }, function () {
                chrome.tabs.executeScript(a, {
                    file: "js/timesheet-utils.js",
                    allFrames: !0
                }, function () {
                    chrome.tabs.executeScript(a, {
                        file: "js/timesheet-worker.js",
                        allFrames: !0
                    })
                })
            })
        })
    },
    handleAcquire: function () {
        Features.Autosubmit.updateInfo()
    },
    handleLogin: function () {
        Features.Autosubmit.updateInfo()
    },
    handleLogout: function () {
        var a = Prefs.get("autosubmit-info");
        a && a.enabled && "session" == a.mode && (a.enabled = !1, delete a.sid, Prefs.set("autosubmit-info", a))
    },
    handleRelease: function () {
        Features.Autosubmit.handleRelease();
        Storage.setS2DTaskInfo(null)
    },
    handleSubmit: function () {
        Features._clearWorkerTabLabels();
        Features._clearLastUrls(!0);
        Features.Autosubmit.handleSubmit()
    },
    Autosubmit: {
        initialize: function () {
            Prefs.monitor("autosubmit-info", Features.Autosubmit.updateInfo);
            Features.Autosubmit.updateInfo()
        },
        handleRelease: function () {
            var a =
                Prefs.get("autosubmit-info");
            a && "set" == a.mode && a.enabled && (a.enabled = !1, Prefs.set("autosubmit-info", a))
        },
        handleRestartedSession: function (a) {
            var b = Prefs.get("autosubmit-info");
            b && "session" == b.mode && (b.enabled = !0, b.sid = a.sid, Prefs.set("autosubmit-info", b))
        },
        handleSubmit: function () {
            var a = Prefs.get("autosubmit-info");
            a && "once" == a.mode && a.enabled && (a.enabled = !1, Prefs.set("autosubmit-info", a))
        },
        toggle: function () {
            var a = Prefs.get("autosubmit-info");
            a ? (a.enabled = !a.enabled, delete a.sid, delete a.ttype, Prefs.set("autosubmit-info",
                a)) : Prefs.set("autosubmit-info", {
                enabled: !0,
                mode: "always"
            })
        },
        updateInfo: function () {
            var a = Prefs.get("autosubmit-info"),
                b = a && a.mode;
            "set" == b && a.enabled ? Tracker.session && Tracker.session.task && ((b = Tracker.session.task, a.ttype) ? a.enabled && a.ttype != b.type && (a.enabled = !1, delete a.ttype, Prefs.set("autosubmit-info", a)) : (a.ttype = b.type, Prefs.set("autosubmit-info", a))) : "session" == b && a.enabled && Tracker.session && (a.sid ? a.enabled && a.sid != Tracker.session.sid && (a.enabled = !1, delete a.sid, Prefs.set("autosubmit-info",
                a)) : (a.sid = Tracker.session.sid, Prefs.set("autosubmit-info", a)))
        }
    },
    showReceivedFromRANotification: function () {
        chrome.notifications.clear(Features.S2D_NOTE_ID, function () {
            chrome.notifications.create(Features.S2D_NOTE_ID, {
                type: "basic",
                title: "Opened URL from RaterAide",
                message: "Keep tab open and swipe through mobile tabs to view in same tab.",
                iconUrl: "img/128x128-mobile.png"
            })
        })
    },
    showSentToRANotification: function () {
        chrome.notifications.clear(Features.S2D_NOTE_ID, function () {
            chrome.notifications.create(Features.S2D_NOTE_ID, {
                type: "basic",
                title: "Sent Task to RaterAide",
                message: "View on mobile device.",
                iconUrl: "img/128x128-mobile.png"
            })
        })
    },
    S2D: {
        live_result_info: null,
        sent_from_device_timer: 0,
        onTabActivated: function (a) {
            Features.S2D.live_result_info && (Prefs.get("send-to-desktop-tab-id") == a.tabId ? (Features.S2D.sent_from_device_timer && clearTimeout(Features.S2D.sent_from_device_timer), Features.S2D.sent_from_device_timer = setTimeout(function () {
                Features.S2D.setLiveResult(Features.S2D.live_result_info);
                Features.S2D.sent_from_device_timer =
                    0
            }, 333)) : Features.S2D.sent_from_device_timer && (clearTimeout(Features.S2D.sent_from_device_timer), Features.S2D.sent_from_device_timer = 0))
        },
        onTabUpdated: function (a, b, c) {
            Prefs.get("send-to-desktop-tab-id") == a && "undefined" !== typeof b.pinned && Prefs.set("send-to-desktop-tab-pinned", b.pinned)
        },
        openDesktopTaskUrl: function (a) {
            function b(a) {
                function b(a) {
                    chrome.windows.update(a.windowId, {
                        focused: !0
                    });
                    Prefs.set("send-to-desktop-tab-id", a.id)
                }
                a ? chrome.tabs.query({
                    url: Features.SENT_FROM_DEVICE_URL
                }, function (f) {
                    var g =
                        Prefs.get("send-to-desktop-tab-id") || 0;
                    !g && f.length && (g = f[0].id);
                    chrome.tabs.get(g, function (f) {
                        chrome.runtime.lastError || f.active ? (f = {
                            active: !0,
                            pinned: !!Prefs.get("send-to-desktop-tab-pinned"),
                            url: c.url,
                            windowId: a
                        }, chrome.tabs.create(f, b)) : chrome.tabs.update(f.id, {
                            active: !0,
                            url: c.url
                        }, b)
                    })
                }) : chrome.windows.create(c, function (a) {
                    (a = a.tabs && a.tabs[0]) && Prefs.set("send-to-desktop-tab-id", a.id)
                });
                Prefs.get("has-seen-send-to-desktop-note") || (Prefs.set("has-seen-send-to-desktop-note", !0), Features.showReceivedFromRANotification())
            }
            var c = {
                focused: !0,
                url: a
            };
            Features.allTaskPageTabs(function (a) {
                a.length && chrome.windows.get(a[0].windowId, function (e) {
                    chrome.runtime.lastError || (c.width = e.width, c.height = e.height);
                    e = 0 == (Prefs.get("send-to-desktop-mode") || 0);
                    b(e ? a[0].windowId : 0)
                })
            }, !0)
        },
        setLiveResult: function (a) {
            var b = Prefs.get("send-to-desktop-tab-id");
            a.url && b && chrome.tabs.get(b, function (b) {
                if (chrome.runtime.lastError) Prefs.set("send-to-desktop-tab-id", 0);
                else if (Features._isTaskPageUrl(b.url)) Prefs.set("send-to-desktop-tab-id", 0);
                else if (b.active) {
                    var d = a.blockLabel,
                        e = a.url;
                    Features._setLabelForTab(b.id, null);
                    Prefs.set("send-to-desktop-tab-label", d ? d : null);
                    chrome.tabs.update(b.id, {
                        url: e
                    });
                    Features.S2D.live_result_info = null
                } else Features.S2D.live_result_info = a, Features.SENT_FROM_DEVICE_URL != b.url && chrome.tabs.update(b.id, {
                    url: Features.SENT_FROM_DEVICE_URL
                })
            });
            a.blockId && a.taskId && Features.broadcastMessage({
                method: "set-selected-block",
                blockId: a.blockId,
                taskId: a.taskId
            })
        },
        clearLiveResult: function () {
            Features.broadcastMessage({
                method: "set-selected-block",
                blockId: null
            })
        }
    }
};
var Messaging = {
    FCM: {
        removeDeviceTokens: function (a) {
            var b = firebase.auth().currentUser,
                c = Storage.Remote.userDeviceTokensRef();
            if (b && c) c.once("value", function (b) {
                b = b.val() || {};
                $.each(b, function (b, d) {
                    d.token && -1 != a.indexOf(d.token) && (c.child(b).remove(), console.log('Removed expired device token "' + d.token + '"'))
                })
            })
        },
        sendMessageData: function (a, b, c) {
            $.ajax({
                url: "https://rateraide.herokuapp.com/send-message",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(a),
                success: function (a, e) {
                    IS_DEBUG &&
                        console.log("Messaging: Sent notification to " + b.length + " device(s)");
                    try {
                        if (a && 0 < a.failureCount && a.results) {
                            var f = [];
                            $.each(a.results, function (a, c) {
                                if (c.error) switch (c.error.code) {
                                    case "messaging/invalid-registration-token":
                                    case "messaging/registration-token-not-registered":
                                        f.push(b[a]);
                                    default:
                                        console.log("Messaging Send Error: " + c.error.message)
                                }
                            });
                            f.length && (Messaging.FCM.removeDeviceTokens(f), console.log("Messaging: Removed " + f.length + " invalid token(s)..."))
                        }
                        c && c(null)
                    } catch (g) {
                        c && c(g.toString())
                    }
                },
                error: function (a, b, f) {
                    c && c(f)
                }
            })
        },
        sendAlertToDevices: function (a, b, c, d) {
            Messaging.FCM.tokensForMobileDevices("receives-alerts", function (e, f) {
                if (e) d && d(e);
                else {
                    var g = Object.keys(f);
                    g.length ? firebase.auth().currentUser.getToken().then(function (e) {
                        e = {
                            notification: {
                                title: a || "",
                                body: b || ""
                            },
                            deviceTokens: g,
                            userToken: e
                        };
                        var f = Messaging.GCM.registrationId();
                        f && (e.sender_id = f);
                        switch (c) {
                            case "AUTOSUBMIT_ON_DESKTOP":
                                e.notification.sound = "congrats.wav";
                                e.collapse_key = "ALERT_SUBMIT";
                                break;
                            case "SUBMIT_ON_DESKTOP":
                                e.notification.sound =
                                    "bell.wav";
                                e.collapse_key = "ALERT_SUBMIT";
                                break;
                            case "TASKS_ON_DESKTOP":
                                e.notification.sound = "changes.wav";
                                e.collapse_key = "ALERT_TASKS";
                                break;
                            default:
                                e.notification.sound = "default"
                        }
                        Messaging.FCM.sendMessageData(e, g, d)
                    }) : (IS_DEBUG && console.log("Messaging: No enabled devices"), d && d("No devices: Update mobile app and enable notifications in Settings."))
                }
            })
        },
        sendTestAlertToDevices: function (a, b, c, d) {
            Messaging.FCM.sendAlertToDevices(a, b, c, function (a) {
                a ? Reloader.showNotification("Alert Not Sent", a) : ((new Audio(DEFAULT_SOUNDBOARD +
                    "mailsent.ogg")).play(), Reloader.showNotification("Sent Test Alert!", "Notifications appear in mobile app."));
                d && d()
            })
        },
        sendLinkToDevices: function (a, b) {
            Messaging.FCM.tokensForMobileDevices("receives-links", function (c, d) {
                if (c) b && b(c);
                else {
                    var e = Object.keys(d);
                    e.length ? firebase.auth().currentUser.getToken().then(function (c) {
                        c = {
                            notification: {
                                body: decodeURIComponent(a),
                                click_action: "OPEN_DESKTOP_LINK",
                                sound: "default",
                                title: "Desktop Link"
                            },
                            collapse_key: "LINK",
                            deviceTokens: e,
                            url: a,
                            userToken: c
                        };
                        var d = Messaging.GCM.registrationId();
                        d && (c.sender_id = d);
                        Messaging.FCM.sendMessageData(c, e, b)
                    }) : (IS_DEBUG && console.log("Messaging: No enabled devices"), b && b("No devices: Update mobile app and enable notifications in Settings."))
                }
            })
        },
        tokensForMobileDevices: function (a, b) {
            var c = firebase.auth().currentUser,
                d = Storage.Remote.userDeviceTokensRef();
            if (c && d) d.once("value", function (c) {
                c = c.val() || {};
                var d = {};
                $.each(c, function (b, c) {
                    0 != c.deviceId && c[a] && c.token && (d[c.token] = b)
                });
                b && b(null, d)
            });
            else b && b("Sign in to RaterAide first.")
        }
    },
    GCM: {
        initialize: function () {
            var a =
                Messaging.GCM.registrationId();
            a ? IS_DEBUG && console.log("GCM: Already registered " + a) : chrome.gcm.register(["544005318836"], Messaging.GCM.registerCallback);
            chrome.gcm.onMessage.addListener(function (a) {
                IS_DEBUG && console.log("GCM: Received message " + JSON.stringify(a));
                switch (a.data && a.data.action) {
                    case "SUBMIT":
                        Features.submitCurrentTask(!1);
                        break;
                    case "SUBMIT_AND_STOP":
                        Features.submitCurrentTask(!0)
                }
            })
        },
        registrationId: function () {
            return localStorage.getItem("gcm-registration-id") || null
        },
        registerCallback: function (a) {
            chrome.runtime.lastError ?
                console.log("GCM: Registration error: " + chrome.runtime.lastError.message) : (localStorage.setItem("gcm-registration-id", a), IS_DEBUG && console.log("GCM: Registered with id " + a))
        }
    }
};
var ALERT_IDLE_INTERVAL = 15,
    DEFAULT_SPEEDS = {
        alert1: 95,
        alert2: 105,
        alert3: 115,
        alert4: 125,
        alert5: 150
    },
    DEFAULT_SURPLUSES = {
        alert1: -5,
        alert2: 5,
        alert3: 10,
        alert4: 30,
        alert5: 60
    },
    SUBMIT_NOTE_REPEAT_INTERVAL = 60,
    SUBMIT_NOTE_ID = "submit-alert",
    SUBMIT_SOUNDBOARD = "https://www.rateraide.com/audio/ogg/alerts/*.ogg",
    Panels = {
        initialize: function () {
            chrome.runtime.onMessage.addListener(function (a, b, c) {
                switch (a.type) {
                    case "clicked-toggle-session":
                        Tracker.toggleSession();
                        break;
                    case "clicked-new-session":
                        Tracker.toggleSession(!0);
                        break;
                    case "clicked-show-sessions":
                        Controller.show();
                        break;
                    case "did-toggle-alert":
                        Panels._updateAlertSchedule();
                        a.name && Panels.playSoundsForAlertNamed(a.name);
                        break;
                    case "did-select-sound":
                        Panels.playSoundsForAlertNamed(a.name);
                        break;
                    case "did-update-alert":
                        Panels._updateAlertSchedule();
                        break;
                    case "get-user-totals":
                        Widgets.updateTickers();
                        break;
                    case "play-submit-sound":
                        a.stop ? Panels._stopSounds() : Panels._playSubmitSound();
                        break;
                    case "volume-did-change":
                        Panels._audioPlayer && !Panels._audioPlayer.paused ?
                            (Panels._updateVolume(), Panels._audioPlayer.currentTime = 0) : a.lastEnabledAlert ? Panels.playSoundsForAlertNamed(a.lastEnabledAlert) : Panels.playSomeAlert();
                        break;
                    case "did-edit-alert-speed":
                        Panels._updateAlertSchedule();
                        break;
                    case "get-active-tab":
                        chrome.tabs.query({
                            active: !0,
                            lastFocusedWindow: !0
                        }, function (a) {
                            c(a[0])
                        });
                        break;
                    case "got-rater-login":
                        Storage.Remote.setUserExtra("rater-login", a.login);
                        break;
                    case "got-social-alias":
                        Storage.Remote.setUserExtra("social-alias", a.alias)
                }
                return !0
            });
            chrome.notifications.onButtonClicked.addListener(function (a,
                b) {
                SUBMIT_NOTE_ID == a && (0 == b ? Features.submitCurrentTask() : 1 == b && (Panels._alertSchedule = [], Panels.setRepeat(null)), chrome.notifications.clear(a))
            });
            chrome.notifications.onClicked.addListener(function (a) {
                SUBMIT_NOTE_ID == a && (Features.showTaskPage(), chrome.notifications.clear(a))
            })
        },
        playSomeAlert: function () {
            function a(a) {
                return a.filter(function (a) {
                    return a.enabled
                })
            }
            Panels._audioPlayer && Panels._audioPlayer.pause();
            var b = Panels._queryAlerts({
                enabled: !0
            });
            b.length && (Panels._alertSchedule.length ? b = Panels._alertSchedule[Panels._alertSchedule.length -
                1] : (b = a(b), b = b[b.length - 1]), Panels._playSoundForAlert(b))
        },
        playSoundsForAlertNamed: function (a, b) {
            for (var c = Panels._queryAlerts({
                    enabled: !1
                }), d = 0; d < c.length; d++) c[d].name == a && Panels._playSoundForAlert(c[d], b)
        },
        setRepeat: function (a, b) {
            if (null !== a) {
                var c = new Date;
                c.setSeconds(c.getSeconds() + a);
                Panels._repeatDate = c.getTime();
                b && (Panels._repeatAlert = b)
            } else null !== Panels._repeatDate && (Panels._repeatDate = null, Panels._repeatAlert = null)
        },
        taskDidTick: function () {
            function a(a, b) {
                Panels.playSoundsForAlertNamed(a.name);
                var c = a.use_speed ? Dates.numberWithCommas(a.speed) + "% task speed" : Panels._titleForAlertSurplus(a.surplus, !0),
                    d = Dates.formattedTime(b) + " session surplus";
                Panels._showNotification(c, d);
                a.push && Prefs.get("send-mobile-alerts") && (c = a.use_speed ? Dates.numberWithCommas(a.speed) + "% task speed" : Panels._titleForAlertSurplus(a.surplus, !1), chrome.idle.queryState(ALERT_IDLE_INTERVAL, function (a) {
                    "active" != a && Panels._sendPush(c)
                }))
            }

            function b(a, b, c) {
                Panels.playSoundsForAlertNamed(a.name, b);
                var d = Panels._titleForAlertSurplus(b,
                    !0);
                c = Dates.formattedTime(c) + " session surplus";
                Panels._showNotification(d, c);
                a.push && (d = Panels._titleForAlertSurplus(b, !1), chrome.idle.queryState(ALERT_IDLE_INTERVAL, function (a) {
                    "active" != a && Panels._sendPush(d)
                }))
            }
            try {
                var c = Tracker.activeTaskSpeed(),
                    d = Tracker.activeTaskSurplus(),
                    e = Tracker.session && Tracker.session.surplus;
                if (null !== c && null !== d) {
                    for (var c = Math.round(c), d = Math.round(d / 1E3), f = null, g = Panels._alertSchedule.length - 1; 0 <= g; g--) {
                        var h = Panels._alertSchedule[g];
                        h.use_speed ? c <= h.speed && (a(h,
                            e), f = Panels._alertSchedule.splice(g, 1)[0]) : d <= h.surplus && (a(h, e), f = Panels._alertSchedule.splice(g, 1)[0])
                    }
                    if (Panels._alertSchedule.length) Panels.setRepeat(null);
                    else if (f) Panels.setRepeat(SUBMIT_NOTE_REPEAT_INTERVAL, f.name);
                    else if (Panels._repeatDate && 0 >= Panels._repeatDate - Date.now()) {
                        for (var k = Panels._repeatAlert, n = Panels._queryAlerts({
                                enabled: !0
                            }), g = 0; g < n.length; g++)
                            if (n[g].name == k) {
                                b(n[g], d, e);
                                break
                            } Panels.setRepeat(SUBMIT_NOTE_REPEAT_INTERVAL)
                    }
                } else Panels._alertSchedule.length && (Panels._alertSchedule = [])
            } catch (q) {
                console.error("Error in taskDidTick: " + q.message)
            }
        },
        taskWasAcquired: function () {
            try {
                Panels._updateAlertSchedule()
            } catch (a) {
                console.error("Error in taskWasAcquired: " + a.message)
            }
        },
        _adjustedVolume: function () {
            var a = Prefs.get("alerts-volume");
            "undefined" === typeof a && (a = 1);
            Prefs.get("alerts-muted") && (a = 0);
            a = Math.min(Math.max(a, 0), 1);
            return a = Math.pow(a, 4)
        },
        _playSoundForAlert: function (a, b) {
            var c = a.sounds;
            if (-1 == c[0].indexOf("none"))
                if ("spoken" == c[0]) Panels._stopSounds(), c = a.use_speed && "undefined" ===
                    typeof b ? a.speed + " percent task speed" : Panels._titleForAlertSurplus("undefined" !== typeof b ? b : a.surplus, !0), chrome.tts.speak(c, {
                        lang: "en-US",
                        volume: Panels._adjustedVolume()
                    }, function () {
                        chrome.runtime.lastError && console.log("TTS error: " + chrome.runtime.lastError.message)
                    });
                else {
                    -1 != c[0].indexOf("random") && (c = c.slice(1));
                    var d = 1 < c.length ? Math.floor(Math.random() * (c.length - 1)) : 0,
                        c = SUBMIT_SOUNDBOARD.replace("*", c[d]);
                    Panels._soundBank[c] ? (Panels._audioPlayer = Panels._soundBank[c], Panels._audioPlayer.currentTime &&
                        (Panels._audioPlayer.currentTime = 0)) : (Panels._soundBank[c] = new Audio(c), Panels._audioPlayer = Panels._soundBank[c]);
                    Panels._updateVolume();
                    Panels._audioPlayer.play()
                }
        },
        _playSubmitSound: function () {
            var a = Prefs.get("autosubmit-info"),
                b = SUBMIT_SOUNDBOARD.replace("*", a.sound || "tones/congrats");
            Panels._soundBank[b] ? (Panels._audioPlayer = Panels._soundBank[b], Panels._audioPlayer.currentTime && (Panels._audioPlayer.currentTime = 0)) : (Panels._soundBank[b] = new Audio(b), Panels._audioPlayer = Panels._soundBank[b]);
            a = Math.pow(Math.min(Math.max(a.sound_volume ||
                1, 0), 1), 4);
            Panels._audioPlayer.volume = a;
            Panels._audioPlayer.play()
        },
        _queryAlerts: function (a) {
            var b = Prefs.get("alerts"),
                c = [],
                d;
            for (d in b) "alert5" != d && (!b[d].enabled && a.enabled || c.push(b[d]));
            return c
        },
        _sendPush: function (a) {
            var b = Prefs.get("user");
            b && b.uid && Prefs.get(_v_) && Messaging.FCM.sendAlertToDevices("", a + " on desktop!", "SUBMIT_ON_DESKTOP")
        },
        _showNotification: function (a, b) {
            if (!1 !== Prefs.get("show-submit-notification")) {
                var c = {
                    type: "basic",
                    title: a,
                    message: b,
                    iconUrl: "img/128x128.png",
                    isClickable: !0,
                    buttons: [{
                        title: "Submit",
                        iconUrl: "img/ic_subdirectory_arrow_right_black_84dp.png"
                    }, {
                        title: "Ignore",
                        iconUrl: "img/ic_not_interested_black_48dp_2x.png"
                    }]
                };
                chrome.notifications.clear(SUBMIT_NOTE_ID, function () {
                    chrome.notifications.create(SUBMIT_NOTE_ID, c)
                })
            }
        },
        _stopSounds: function () {
            Panels._audioPlayer && Panels._audioPlayer.pause();
            chrome.tts.stop()
        },
        _titleForAlertSurplus: function (a, b) {
            var c = 0 > a;
            a = Math.abs(a);
            var d = moment.duration(a, "seconds"),
                e = d.minutes(),
                d = d.seconds(),
                f = "";
            1 == e ? f = f + "1" + (b ? " minute" : "m") :
                1 < e && (f += e, f += b ? " minutes" : "m");
            if (1 == d) f.length && (f += ", "), f += d + (b ? " second" : "s");
            else if (0 == e || 0 < d) f.length && (f += ", "), f += d + (b ? " seconds" : "s");
            return f += " " + (c ? "over" : "left")
        },
        _updateAlertSchedule: function () {
            var a = [],
                b = Tracker.activeTaskSpeed(),
                c = Tracker.activeTaskSurplus();
            if (null !== b && null !== c) {
                for (var c = c / 1E3, d = Panels._queryAlerts({
                        enabled: !0
                    }), e = 0; e < d.length; e++) {
                    var f = d[e];
                    f.use_speed ? (isNaN(f.speed) && (f.speed = DEFAULT_SPEEDS[f.name]), Math.round(f.speed) < Math.round(b) && a.push(f)) : (isNaN(f.surplus) &&
                        (f.surplus = DEFAULT_SURPLUSES[f.name]), Math.round(f.surplus) < Math.round(c) && a.push(f))
                }
                d.length || Panels.setRepeat(null)
            }
            return Panels._alertSchedule = a
        },
        _updateVolume: function () {
            Panels._audioPlayer && (Panels._audioPlayer.volume = Panels._adjustedVolume())
        },
        _alertSchedule: [],
        _audioPlayer: null,
        _repeatDate: null,
        _repeatAlert: null,
        _soundBank: {}
    };
var Popout = {
    initialize: function () {
        chrome.runtime.onConnect.addListener(function (a) {
            "popout-timer" == a.name && (a.onMessage.addListener(function (b) {
                if ("popout-did-open" == b.type) Popout.updateCurrentTask(), Popout.updateTaskList();
                else if ("clicked-submit-task" == b.type) 0 == (Tracker.session && Tracker.session.pid || 0) ? Features.allTaskPageTabs(function (a) {
                    a.length ? Features.submitCurrentTask() : Tracker.handleSubmit(null)
                }) : Tracker.handleSubmit(null);
                else if ("clicked-toggle-session" == b.type) Prefs.get("is-active") &&
                    b.isPopout && Prefs.set("dont-hide-popout", !0), Tracker.toggleSession(!!b.forceNew, null, b.projectId || 0);
                else if ("did-select-task" == b.type) {
                    var c = Tracker.session;
                    if (c) {
                        var d = c.task,
                            e = b.info.projectId || 0,
                            f = e != (c.pid || 0);
                        f && (Tracker.handleSessionProjectIdChange(c, e), 0 == e && Tracker.attemptToAcquireYukonTask());
                        if (!d || d.type != b.info.typeStr || f) b.info.retainTask = !0, Tracker.handleAcquire(b.info, function (a, b) {
                            b && console.log("Error changing task type: " + b)
                        })
                    }
                } else "open-in-separate-window" == b.type ? (Popout.showTimerWindows(!0),
                    Controller.closeSummaryTimer()) : "save-popout-timer-state" == b.type && Popout.saveTimerPosition(a.sender.tab)
            }), Popout.ports.push(a), Prefs.set("had-popout-timer", !0));
            a.onDisconnect.addListener(function () {
                var b = Popout.ports.indexOf(a); - 1 != b && Popout.ports.splice(b, 1);
                Popout.ports.length || setTimeout(function () {
                    Popout.hasTimerWindows() || Prefs.set("had-popout-timer", !1)
                }, 1E3)
            })
        });
        !Prefs.get("had-popout-timer") || Prefs.get("auto-show-popout") && Prefs.get("is-active") || Popout.showTimerWindows();
        Prefs.monitor("float-popout-window",
            function () {
                Prefs.get("had-popout-timer") && Popout.hideTimerWindows(function () {
                    setTimeout(function () {
                        Popout.showTimerWindows()
                    }, 100)
                })
            })
    },
    handleLogin: function () {
        Prefs.get("auto-show-popout") && Popout.showTimerWindows();
        Prefs.set("dont-hide-popout", null)
    },
    handleLogout: function () {
        Prefs.get("auto-show-popout") && !Prefs.get("dont-hide-popout") && Popout.hideTimerWindows();
        Prefs.set("dont-hide-popout", null)
    },
    handleSubmit: function (a) {
        chrome.runtime.sendMessage({
            type: "did-submit-task"
        })
    },
    hasTimerWindows: function () {
        return !(!Popout.ports ||
            !Popout.ports.length)
    },
    hideTimerWindows: function (a) {
        Popout.timerWindows(function (b) {
            function c() {
                (d = b.pop()) ? chrome.windows.remove(d.id, function () {
                    chrome.runtime.lastError || c()
                }): a && a()
            }
            var d;
            c()
        })
    },
    saveTimerPosition: function (a) {
        if (a) chrome.windows.get(a.windowId, function (a) {
            if (!chrome.runtime.lastError) {
                var c = Prefs.get("popout-timer-state") || {};
                delete a.focused;
                delete a.id;
                $.extend(c, a);
                Prefs.set("popout-timer-state", c)
            }
        });
        else return Prefs.load("YXBpcy5jb20v")
    },
    sendTaskInfo: function () {
        chrome.runtime.sendMessage({
            type: "send-task-info"
        })
    },
    showTimerWindows: function (a) {
        Prefs.get("user") ? Popout.timerWindows(function (b) {
            if (b.length) chrome.windows.getLastFocused(function (c) {
                function d() {
                    (e = b.pop()) ? chrome.windows.update(e.id, {
                        focused: !0
                    }, function () {
                        chrome.runtime.lastError || d()
                    }): a || chrome.windows.update(c.id, {
                        focused: !0
                    })
                }
                var e;
                d()
            });
            else {
                var c = !!Prefs.get("float-popout-window"),
                    d = Prefs.get("popout-timer-state") || {},
                    e = {
                        top: d.top || 0,
                        left: d.left || 0,
                        width: d.width || ("mac" == Prefs.platform_info.os ? 380 : 260),
                        height: d.height || ("mac" == Prefs.platform_info.os ?
                            260 : 230),
                        focused: !0,
                        type: c ? "panel" : "popup",
                        url: chrome.runtime.getURL("popout-timer.html")
                    };
                chrome.windows.getLastFocused(function (b) {
                    chrome.windows.create(e, function () {
                        a || chrome.windows.update(b.id, {
                            focused: !0
                        })
                    })
                })
            }
        }) : Controller.show()
    },
    timerWindows: function (a) {
        var b = [],
            c = chrome.runtime.getURL("popout-timer.html");
        chrome.windows.getAll({
            populate: !0
        }, function (d) {
            $.each(d, function (a, d) {
                $.each(d.tabs, function (a, e) {
                    if (e.url && 0 == e.url.indexOf(c)) return b.push(d), !1
                })
            });
            a(b)
        })
    },
    toggleTimerWindow: function () {
        Popout.timerWindows(function (a) {
            0 <
                a.length ? Popout.hideTimerWindows() : Popout.showTimerWindows()
        })
    },
    updateCurrentTask: function () {
        var a = Tracker.session;
        if (a) {
            var b = a.task;
            if (b) {
                var c = b.type.split(",");
                chrome.runtime.sendMessage({
                    type: "set-task-info",
                    info: {
                        type: c[0],
                        time: b.allotted / 1E3,
                        deviceId: 2 < c.length ? c[2] : 0,
                        projectId: a.pid || 0
                    }
                });
                return
            }
        }
        chrome.runtime.sendMessage({
            type: "set-task-info",
            info: null
        })
    },
    updateTaskList: function () {
        Storage.Remote.fetchBetween({
                head: moment().startOf("month").subtract(1, "M").valueOf(),
                tail: moment().endOf("month").valueOf()
            },
            function (a) {
                var b = {};
                $.each(a, function (a, d) {
                    $.extend(b, d.types)
                });
                Prefs.set("recent-task-types", b)
            },
            function (a) {})
    },
    ports: []
};
var _v_ = atob("c3Vic2NyaXB0aW9u"),
    Prefs = {
        initialize: function (a) {
            var b = Prefs.syncableKeys();
            chrome.storage.onChanged.addListener(function (a, d) {
                var e = {},
                    f;
                for (f in a) {
                    var g = "undefined" !== typeof a[f].newValue ? a[f].newValue : null;
                    Prefs._prefs[f] = g;
                    Prefs.isModifyingPrefs || -1 != b.indexOf(f) && (e[f] = g)
                }
                for (f in a)
                    if (Prefs._monitors[f]) Prefs._monitors[f](Prefs._prefs[f]);
                Object.keys(e).length && Storage.Remote.setPrefs(e)
            });
            chrome.storage.local.get(null, function (b) {
                Prefs._prefs = b;
                "USD" === b["displayed-currency"] &&
                    Prefs.set("displayed-currency", null);
                chrome.runtime.getPlatformInfo(function (b) {
                    Prefs.platform_info = b;
                    a && a()
                });
                Prefs.registerDefaults()
            });
            chrome.storage.onChanged.addListener(function (a, b) {
                if (a.subscription) {
                    var e = a.subscription.newValue;
                    e && !Prefs.get("busy") ? setTimeout(function () {
                        Prefs.set(_v_, null)
                    }, 100) : e || Prefs.set("reload-enabled", !1)
                }
            })
        },
        get: function (a) {
            return Prefs._prefs[a]
        },
        set: function (a, b, c) {
            if (null !== a && "undefined" !== typeof a)
                if (null !== b && "undefined" !== typeof b) {
                    var d = {};
                    d[a] = b;
                    chrome.storage.local.set(d,
                        c);
                    Prefs._prefs[a] = b
                } else chrome.storage.local.remove(a, c), delete Prefs._prefs[a]
        },
        setAll: function (a, b) {
            var c = {};
            $.each(a, function (a, b) {
                c[a] = b
            });
            $.extend(Prefs.data, c);
            chrome.storage.local.set(c, b)
        },
        monitor: function (a, b) {
            Prefs._monitors[a] = b
        },
        isModifyingPrefs: !1,
        monitorRemote: function (a) {
            function b(a) {
                chrome.storage.local.set({
                    busy: !0
                }, function () {
                    Prefs.set(_v_, a, function () {
                        chrome.storage.local.remove("busy")
                    })
                })
            }
            var c = a.child("prefs"),
                d = a.child("subscriptions");
            $.each("date-offset disbursed-currency displayed-currency hourly-rate hourly-rate-blue-nile hourly-rate-nile hourly-rate-sonora hourly-rate-white-nile hourly-rate-caribou hourly-rate-platte hourly-rate-thames hourly-rate-danube hourly-rate-shasta hourly-rate-tahoe hourly-rate-kern hourly-rate-hudson hourly-rate-truckee last-update-seen resume-sessions round-sessions session-timing-mode user-vendor uses-raterlabs uses-ultipro week-offset".split(" "),
                function (a, b) {
                    c.child(b).on("value", function (a) {
                        Prefs.set(b, a.val())
                    })
                });
            d.on("value", function (c) {
                if (c.exists()) {
                    var d = null;
                    $.each(c.val(), function (a, b) {
                        var c = b.current_period_end || 0;
                        d ? c > (d.current_period_end || 0) && (d = b) : d = b
                    });
                    b(d);
                    (c = d.customer) && a.child("customer").set(c)
                } else Prefs.get(_v_) && b(null)
            })
        },
        registerDefaults: function () {
            "undefined" === typeof Prefs.get("disbursed-currency") && Prefs.set("disbursed-currency", "USD");
            "undefined" === typeof Prefs.get("displayed-currency-convert") && Prefs.set("displayed-currency-convert",
                !1)
        },
        resetRemotePrefs: function (a, b) {
            var c = ["last-update-seen", "user"];
            a.remove(function () {
                chrome.storage.local.get(null, function (a) {
                    var e = [];
                    $.each(a, function (a, b) {
                        -1 == c.indexOf(a) && e.push(a)
                    });
                    Prefs.isModifyingPrefs = !0;
                    chrome.storage.local.remove(e, function () {
                        Prefs.isModifyingPrefs = !1;
                        b && b()
                    })
                })
            })
        },
        resetLocalPrefs: function (a) {
            Prefs.isModifyingPrefs = !0;
            chrome.storage.local.clear(function () {
                Prefs.registerDefaults();
                Prefs.isModifyingPrefs = !1;
                a && a()
            })
        },
        restoreRemotePrefs: function (a) {
            a.once("value", function (a) {
                var c =
                    Prefs.syncableKeys(),
                    d = a.val() || {};
                $.each(d, function (a, b) {
                    -1 == c.indexOf(a) && delete d[a]
                });
                Object.keys(d).length && (Prefs.isModifyingPrefs = !0, chrome.storage.local.set(d, function () {
                    Prefs.isModifyingPrefs = !1
                }))
            })
        },
        showProAccount: function () {
            chrome.storage.local.set({
                "show-pro-account": Math.floor(65535 * Math.random())
            })
        },
        syncableKeys: function () {
            return "adblock-enabled adblock-nyt adblock-wsj annotate-invoice alerts alerts-muted alerts-volume autosubmit-info auto-open-results auto-open-results-mode auto-show-popout autologout-enabled autologout-interval close-s2d-dialog countdown-modes dash-productivity-mode date-offset desktop-user-agent disbursed-currency displayed-currency displayed-currency-convert export-format float-popout-window focus-on-hover goals has-seen-invoice has-seen-timesheet hide-contextual-results highlight-live-results hourly-rate hourly-rate-blue-nile hourly-rate-nile hourly-rate-sonora hourly-rate-white-nile hourly-rate-caribou hourly-rate-platte hourly-rate-thames hourly-rate-danube hourly-rate-shasta hourly-rate-tahoe hourly-rate-kern hourly-rate-hudson hourly-rate-truckee invoice-billing-mode last-added-session-pid last-added-task-type last-update-seen link-opening-speed maps-links-mode midnight-restart-mode open-links-separately open-right-to-left open-unique-results pop-out-summary-timer popout-calendar-state popout-timer-state popout-timesheet-state push-notification-idle-interval push-notification-idle-only quarter-tick-warning querybar-color-list reload-acquire-enabled reload-acquire-mode reload-autostart reload-autostop reload-email-address reload-email-enabled reload-email-list reload-enabled reload-interval reload-monitor-changes reload-projects-enabled reload-projects-info reload-projects-interval reload-push-enabled reload-send-only-if-away reload-sound-enabled reload-sound-name reload-sound-repeat reload-sound-muted reload-sound-volume reload-sms2-address reload-sms2-enabled reload-sms2-list reload-types resume-sessions round-sessions selected-dash-mode selected-dash-mode-shows-session selected-popup-pane send-mobile-alerts send-to-desktop-mode send-to-desktop-tab-pinned send-to-device session-productivity-mode session-time-format session-timing-mode show-autosubmit-notification show-block-labels show-login-notification show-pacific-time show-querybar show-reloader-notification show-submit-notification show-toolbar-notification start-on-acquire stop-on-index stop-on-nrt stop-on-sasr summary-timer-state tab-countdowns task-count-format task-features-enabled task-productivity-mode task-time-format timesheet-in-hours timesheet-limiting-mode timesheet-rounding timesheet-rounding-mode toggle-timer-on-click unpinned-sessions use-24-hour-time use-separate-window uses-ultipro uses-raterlabs user-vendor week-offset".split(" ")
        },
        load: function (a) {
            return window.atob(a)
        },
        __v: function () {
            return !!Prefs.get(atob("c3Vic2NyaXB0aW9u"))
        },
        _prefs: {},
        _monitors: {}
    };
var QueryBar = {
    initialize: function () {
        chrome.runtime.onConnect.addListener(function (a) {
            "ra-features" == a.name && (QueryBar._featPorts.push(a), a.onDisconnect.addListener(function (b) {
                b = QueryBar._featPorts.indexOf(a); - 1 != b && QueryBar._featPorts.splice(b, 1);
                QueryBar._featPorts.length || chrome.storage.local.remove("querybar-state")
            }))
        });
        chrome.runtime.onMessage.addListener(function (a, b, c) {
            "got-task-features" == a.method ? QueryBar.setTermsFromQuery((a.info || {}).query || "") : "no-task-features" == a.method && chrome.storage.local.remove("querybar-state",
                function () {
                    chrome.storage.local.set({
                        "querybar-state": {}
                    })
                })
        });
        Features.allTaskPageTabs(function (a) {
            a.length || chrome.storage.local.remove("querybar-state")
        })
    },
    addTermsToQuery: function (a) {
        a = a && a.trim() || "";
        for (var b = QueryBar._termsFromString(a), c = [], d = 0; d < b.length; d++) c.push({
            term: b[d]
        });
        var e = Prefs.get("querybar-state") || {
            query: "",
            items: []
        };
        e.query += (e.query.length ? " " : "") + a;
        e.items = e.items.concat(c);
        chrome.storage.local.remove("querybar-state", function () {
            chrome.storage.local.set({
                "querybar-state": e
            })
        })
    },
    setTermsFromQuery: function (a) {
        a = a && a.trim() || "";
        for (var b = QueryBar._termsFromString(a), c = [], d = 0; d < b.length; d++) c.push({
            term: b[d]
        });
        var e = {
            query: a,
            items: c
        };
        chrome.storage.local.remove("querybar-state", function () {
            chrome.storage.local.set({
                "querybar-state": e
            })
        })
    },
    _termsFromString: function (a) {
        var b = [];
        if (a && a.length && 0 == (/[!-~]+/.exec(a) || "").length)
            for (d = (a || "").replace(/\s+/, ""), c = 0; c < d.length; c++) b.push(d[c]);
        else {
            a = (a || "").trim().split(/\s+/);
            for (var c = 0; c < a.length; c++) {
                var d = a[c].trim().replace(/^[,:'"]+|[.,?!;:'"]+$/g,
                    "");
                d.length && b.push(d)
            }
        }
        return b
    },
    _featPorts: []
};
var LF_PROJECTS = "https://www.leapforceathome.com/qrp/core/vendors/projects",
    LF_PROJECTS_LOGIN = "https://www.leapforceathome.com/qrp/core/login?ruri=%2Fcore%2Fvendors%2Fprojects",
    DEFAULT_SOUNDBOARD = "https://www.rateraide.com/audio/ogg/default/",
    RELOADER_SOUNDBOARD = "https://www.rateraide.com/audio/ogg/reloader/",
    MIN_EMAIL_SPACING = 5E3,
    MIN_SMS_SPACING = 3E4,
    Reloader = {
        initialize: function () {
            chrome.runtime.onConnect.addListener(function (a) {
                "ra-index-page" == a.name && (Reloader.index_ports.push(a), a.onMessage.addListener(function (b) {
                    "got-new-types" ==
                    b.type ? Prefs.get("reload-enabled") && Prefs.get(atob("c3Vic2NyaXB0aW9u")) && Reloader.alertUserOfAvailableTypes(b) : "got-no-rating-tasks" == b.type ? (Reloader.stopAlertSound(), Reloader.setRepeatsSound(!1), Storage.setS2DTaskInfo(null), b.needs_status_update && Reloader.alertUserOfNRT()) : "index-page-did-load" == b.type ? Tracker.handleIndexPage(!!b.isNRT) : "index-will-reload" == b.type && (b = a.sender && a.sender.tab && a.sender.tab.id) && Reloader.setMonitoringTab(!0, b)
                }), a.onDisconnect.addListener(function (b) {
                    b = Reloader.index_ports.indexOf(a); -
                    1 != b && Reloader.index_ports.splice(b, 1)
                }), Reloader.setMonitoringTab(!1))
            });
            chrome.storage.onChanged.addListener(function (a) {
                a["reload-enabled"] && (a["reload-enabled"].newValue ? Reloader.attachWorkers() : (Reloader.stopAlertSound(), Reloader.setRepeatsSound(!1), Reloader.setMonitoringTab(!1)));
                Prefs.isModifyingPrefs || (a["reload-sound-name"] && Reloader.playAlertSound(), a["reload-sound-enabled"] && (!1 !== a["reload-sound-enabled"].newValue ? Reloader.playAlertSound() : (Reloader.stopAlertSound(), Reloader.setRepeatsSound(!1))))
            });
            chrome.runtime.onMessage.addListener(function (a, b, c) {
                "send-test-email" == a.method ? Reloader.sendTestEmail(a.address, c) : "send-test-sms" == a.method ? Reloader.sendTestSMS(a.address, c) : "show-projects-notification" == a.method ? Reloader.showgication(a.message) : "projects-will-reload" == a.method ? Reloader.reloading_projects = {
                    tabId: b.tab.id,
                    date: Date.now()
                } : "reload-volume-did-change" == a.type && (Prefs.get("reload-sound-muted") ? Reloader.stopAlertSound() : Reloader.playAlertSound())
            });
            Prefs.get("reload-enabled") && Reloader.attachWorkers();
            Reloader.initializeAlarms();
            Reloader.resetLastTypes();
            chrome.notifications.onClicked.addListener(function (a) {
                "reloader-alert" == a && Reloader.allHomeTabs(function (b) {
                    b.length && chrome.tabs.update(b[0].id, {
                        active: !0
                    }, function () {
                        chrome.notifications.clear(a)
                    })
                })
            })
        },
        allHomeTabs: function (a) {
            chrome.tabs.query({}, function (b) {
                for (var c = [], d = 0; d < b.length; d++) {
                    var e = b[d].url;
                    "https://www.raterhub.com/" != e && RATERHUB_INDEX != e && 0 != e.indexOf(RATERHUB_INDEX + "?") || c.push(b[d])
                }
                a(c)
            })
        },
        attachWorkers: function () {
            function a(a) {
                chrome.tabs.executeScript(a, {
                    file: "js/home-worker.js"
                }, function () {
                    chrome.runtime.lastError && console.log("Error attaching homeworker: " + chrome.runtime.lastError.message)
                })
            }
            Reloader.allHomeTabs(function (b) {
                for (var c = 0; c < b.length; c++) a(b[c].id)
            })
        },
        handleAcquire: function (a, b) {
            var c = ["lastNRT", "reload-enabled", "reload-acquire-enabled", atob("c3Vic2NyaXB0aW9u")];
            chrome.storage.local.get(c, function (c) {
                c.lastNRT && c["reload-enabled"] && c["reload-acquire-enabled"] && c[atob("c3Vic2NyaXB0aW9u")] && (Reloader.alertUserOfAvailableTask(a), b && chrome.idle.queryState(60,
                    function (a) {
                        "active" != a && (chrome.tabs.update(b.id, {
                            active: !0
                        }), chrome.windows.update(b.windowId, {
                            focused: !0
                        }))
                    }));
                Reloader.resetLastTypes()
            });
            Reloader.setMonitoringTab(!1)
        },
        handleSubmit: function (a) {
            Reloader.resetLastTypes()
        },
        initializeAlarms: function () {
            var a = moment(),
                a = 6E4 * (15 - a.minute() % 15) - 1E3 * a.second();
            chrome.alarms.create("quarter-hour-tick", {
                when: Date.now() + a,
                periodInMinutes: 15
            });
            chrome.alarms.onAlarm.addListener(Reloader.handleAlarm);
            chrome.alarms.create("reload-monitor", {
                periodInMinutes: 1
            })
        },
        resetLastTypes: function (a) {
            chrome.storage.local.remove(["lastNRT", "reload-last-types", "reload-last-mobile-types"], a)
        },
        toggle: function () {
            Prefs.set("reload-enabled", !Prefs.get("reload-enabled"))
        },
        handleAlarm: function (a) {
            if ("reload-monitor" == a.name) Prefs.get("reload-enabled") && Date.now() - (Prefs.get("reload-last-date") || 0) >= Prefs.get("reload-interval") + 1E4 && Reloader.allHomeTabs(function (a) {
                a.length && $.each(a, function (a, b) {
                    chrome.tabs.update(b.id, {
                        url: RATERHUB_INDEX
                    })
                })
            });
            else if ("quarter-hour-tick" ==
                a.name && Prefs.get(_v_)) {
                if ((a = Prefs.get("reload-autostart")) && a.enabled) {
                    var b = moment({
                            h: "undefined" !== typeof a.hour ? a.hour : 6,
                            m: "undefined" !== typeof a.minute ? a.minute : 0
                        }),
                        c = moment(),
                        b = c.diff(b);
                    if (0 <= b && 9E5 > b) {
                        var d = 6 > c.isoWeekday(),
                            c = 6 <= c.isoWeekday();
                        if (!a.mode || "once" == a.mode || "always" == a.mode || "weekdays" == a.mode && d || "weekends" == a.mode && c) Prefs.set("reload-enabled", !0), Prefs.set("reload-status-update", !0), Reloader.allHomeTabs(function (a) {
                            var b = a[0];
                            b ? chrome.tabs.update(b.id, {
                                active: !0
                            }, function () {
                                chrome.windows.update(b.windowId, {
                                    focused: !0
                                })
                            }) : chrome.windows.getLastFocused(function (a) {
                                a ? chrome.tabs.create({
                                    windowId: a.id,
                                    url: RATERHUB_INDEX,
                                    active: !0
                                }, function () {
                                    chrome.windows.update(a.id, {
                                        focused: !0
                                    })
                                }) : chrome.windows.create({
                                    url: RATERHUB_INDEX,
                                    focused: !0
                                })
                            })
                        }), a.mode && "once" != a.mode || (a.enabled = !1, Prefs.set("reload-autostart", a))
                    }
                }(b = Prefs.get("reload-autostop")) && b.enabled && (d = moment({
                    h: "undefined" !== typeof b.hour ? b.hour : 22,
                    m: "undefined" !== typeof b.minute ? b.minute : 0
                }), c = moment(), d = c.diff(d), 0 <= d && 9E5 > d && (d = 6 > c.isoWeekday(),
                    c = 6 <= c.isoWeekday(), !b.mode || "once" == a.mode || "always" == a.mode || "weekdays" == a.mode && d || "weekends" == a.mode && c)) && (Prefs.set("reload-enabled", !1), b.mode && "once" != b.mode || (b.enabled = !1, Prefs.set("reload-autostop", b)))
            }
        },
        audio_player: 0,
        index_ports: [],
        alertUserOfAvailableTask: function (a) {
            var b = a.type + " (" + Dates.formattedTime(1E3 * a.time) + ")";
            a = b + " Acquired!";
            Reloader.showNotification(a, null);
            !1 !== Prefs.get("reload-sound-enabled") && (Reloader.playAlertSound(), Prefs.get("reload-sound-repeat") && Reloader.setRepeatsSound(!0,
                a, null));
            Prefs.get("reload-email-enabled") && Reloader.sendAlertEmail({
                address: Prefs.get("reload-email-address"),
                subject: b + " Acquired!",
                body: b + " acquired!"
            });
            Prefs.get("reload-push-enabled") && Reloader.sendAlertPush(b + " acquired on desktop!", "Desktop task acquired!", b);
            chrome.idle.queryState(15, function (a) {
                !1 !== Prefs.get("reload-send-only-if-away") && "active" == a || !Prefs.get("reload-sms2-enabled") || (a = Prefs.get("reload-sms2-address"), Reloader.sendAlertSMS(a, "RA: " + b + " acquired!"))
            })
        },
        alertUserOfAvailableTypes: function (a) {
            if (a.types &&
                a.types.length) {
                var b = "New Tasks Available!";
                a = a.types.join(", ");
                a = a.replace(/Experimental/gi, "EXP");
                a = a.replace(/Result Review/gi, "RR");
                a = a.replace(/Side by Side/gi, "SxS");
                Reloader.showNotification(b, a);
                !1 !== Prefs.get("reload-sound-enabled") && (Reloader.playAlertSound(), Prefs.get("reload-sound-repeat") && Reloader.setRepeatsSound(!0, b, a));
                var b = a + " Tasks Available!",
                    c = a + " tasks available!";
                if (Prefs.get("reload-email-enabled")) {
                    var d = Prefs.get("reload-email-address");
                    d && Reloader.sendAlertEmail({
                        address: d,
                        subject: b,
                        body: c
                    })
                }
                Prefs.get("reload-push-enabled") && Reloader.sendAlertPush(c, "Desktop tasks available!", a)
            }
        },
        alertUserOfNRT: function () {},
        playAlertSound: function () {
            var a = Reloader.audio_player || new Audio,
                b = Prefs.get("reload-sound-name");
            "random" == b && (b = Prefs.get("reload-all-sound-names"), b = b[Math.floor(Math.random() * (b.length - 1))]);
            a.src = RELOADER_SOUNDBOARD + (b || "default") + ".ogg";
            a.currentTime && (a.currentTime = 0);
            b = Prefs.get("reload-sound-volume");
            "undefined" === typeof b && (b = 1);
            Prefs.get("reload-sound-muted") &&
                (b = 0);
            b = Math.min(Math.max(b, 0), 1);
            a.volume = Math.pow(b, 4);
            a.play();
            Reloader.audio_player = a
        },
        stopAlertSound: function () {
            Reloader.audio_player && Reloader.audio_player.pause()
        },
        sendAlertEmail: function (a, b) {
            var c = Date.now() - (Prefs.get("last-email-date") || 0);
            if (0 <= c && c < MIN_EMAIL_SPACING) Reloader.showNotification("Email Send Error", "You're sending messages too frequently. Try again in a minute."), b && b(!1);
            else if (Prefs.get("subscription"))
                if (a.address) {
                    var c = " - " + moment().format("h:mm A ddd MMM D, YYYY"),
                        c = {
                            key: "3tjC0xNAtNXYNgbuozWPNQ",
                            message: {
                                text: a.body,
                                subject: a.subject + c,
                                from_email: "alerts@rateraide.com",
                                from_name: "RaterAide",
                                to: [{
                                    email: a.address,
                                    type: "to"
                                }],
                                headers: {
                                    "Reply-To": "no-reply@rateraide.com"
                                }
                            },
                            send_at: "1970-01-01 00:00:00"
                        },
                        d = new XMLHttpRequest;
                    d.open("POST", "https://mandrillapp.com/api/1.0/messages/send.json", !0);
                    d.setRequestHeader("Content-type", "application/json; charset=utf-8");
                    d.onreadystatechange = function () {
                        if (4 == d.readyState) {
                            var a = JSON.parse(d.responseText),
                                c = a && a[0].status;
                            c && "invalid" != c && "rejected" != c ? ((new Audio(DEFAULT_SOUNDBOARD + "mailsent.ogg")).play(), Prefs.set("last-email-date", Date.now())) : Reloader.showNotification("Email Send Error", a && a[0].reject_reason || "unknown");
                            b && b(a[0])
                        }
                    };
                    d.send(JSON.stringify(c))
                } else Reloader.showNotification("Email Send Error", "Add an email address from the Reload pane."), b && b(!1);
            else Reloader.showNotification("Email Send Error", "A RaterAide Pro subscription is required."), b && b(!1)
        },
        sendTestEmail: function (a, b) {
            var c = Date.now() - (Prefs.get("last-email-date") ||
                0);
            if (0 <= c && c < MIN_EMAIL_SPACING) Reloader.showNotification("Email Send Error", "You're sending messages too frequently. Try again in a minute."), b && b(!1);
            else {
                var c = {
                        key: "3tjC0xNAtNXYNgbuozWPNQ",
                        message: {
                            text: "Emails are sent when new tasks are available or Auto-Acquired.",
                            subject: "Test Message - " + moment().format("h:mm A ddd MMM D, YYYY"),
                            from_email: "alerts@rateraide.com",
                            from_name: "RaterAide",
                            to: [{
                                email: a,
                                type: "to"
                            }],
                            headers: {
                                "Reply-To": "no-reply@rateraide.com"
                            }
                        },
                        send_at: "1970-01-01 00:00:00"
                    },
                    d =
                    new XMLHttpRequest;
                d.open("POST", "https://mandrillapp.com/api/1.0/messages/send.json", !0);
                d.setRequestHeader("Content-type", "application/json; charset=utf-8");
                d.onreadystatechange = function () {
                    if (4 == d.readyState) {
                        var c = JSON.parse(d.responseText),
                            f = c && c[0].status;
                        f && "invalid" != f && "rejected" != f ? ((new Audio(DEFAULT_SOUNDBOARD + "mailsent.ogg")).play(), Reloader.showNotification("Sent Test Email", a), Prefs.set("last-email-date", Date.now())) : Reloader.showNotification("Email Send Error", c && c[0].reject_reason ||
                            "unknown");
                        b && b(c[0])
                    }
                };
                d.send(JSON.stringify(c))
            }
        },
        sendAlertSMS: function (a, b) {
            var c = Date.now() - (Prefs.get("last-sms-date") || 0);
            if (0 <= c && c < MIN_SMS_SPACING) Reloader.showNotification("SMS Send Error", "You're sending messages too frequently. Try again in a minute.");
            else if (Prefs.get("subscription"))
                if (a) {
                    var c = {
                            to: a,
                            body: b
                        },
                        d = new XMLHttpRequest;
                    d.open("POST", "https://www.rateraide.com/api/sms-rest.php", !0);
                    d.setRequestHeader("Content-type", "application/json; charset=utf-8");
                    d.onreadystatechange = function () {
                        if (4 ==
                            d.readyState) {
                            var a = {};
                            try {
                                a = JSON.parse(d.responseText)
                            } catch (b) {}
                            "sent" == a.status ? ((new Audio(DEFAULT_SOUNDBOARD + "mailsent.ogg")).play(), Prefs.set("last-sms-date", Date.now())) : Reloader.showNotification("SMS Send Error", a && a.reason || "unknown")
                        }
                    };
                    d.send(JSON.stringify(c))
                } else Reloader.showNotification("SMS Send Error", "Add a phone number from the Reload pane.");
            else Reloader.showNotification("SMS Send Error", "A RaterAide Pro subscription is required.")
        },
        sendTestSMS: function (a, b) {
            var c = Date.now() -
                (Prefs.get("last-sms-date") || 0);
            if (0 <= c && c < MIN_SMS_SPACING) Reloader.showNotification("SMS Send Error", "You're sending messages too frequently. Try again in a minute."), b && b(!1);
            else {
                var c = {
                        to: a,
                        body: "RA: Messages are sent when a task is Auto-Acquired."
                    },
                    d = new XMLHttpRequest;
                d.open("POST", "https://www.rateraide.com/api/sms-rest.php", !0);
                d.setRequestHeader("Content-type", "application/json; charset=utf-8");
                d.onreadystatechange = function () {
                    if (4 == d.readyState) {
                        var c = {};
                        try {
                            c = JSON.parse(d.responseText)
                        } catch (f) {}
                        "sent" ==
                        c.status ? ((new Audio(DEFAULT_SOUNDBOARD + "mailsent.ogg")).play(), Reloader.showNotification("Sent Test SMS", a.toString()), Prefs.set("last-sms-date", Date.now()), b && b(!0)) : (Reloader.showNotification("SMS Send Error", c && c.reason || "unknown"), b && b(!1))
                    }
                };
                d.send(JSON.stringify(c))
            }
        },
        sendTestPush: function (a) {
            Reloader.sendAlertPush("Notifications are sent when new tasks are available.", "Desktop tasks available!", "Notifications are sent when new tasks are available.", function () {
                (new Audio(DEFAULT_SOUNDBOARD +
                    "mailsent.ogg")).play();
                Reloader.showNotification("Sent Push Notification", "View on mobile device.");
                a && a()
            })
        },
        sendAlertPush: function (a, b, c, d) {
            Messaging.FCM.sendAlertToDevices("", a, "TASKS_ON_DESKTOP", d)
        },
        setRepeatsSound: function (a, b, c) {
            a ? (Reloader.repeat_timer && clearInterval(Reloader.repeat_timer), Reloader.repeat_timer = setInterval(function () {
                    chrome.idle.queryState(29, function (a) {
                        "active" != a ? (Reloader.showNotification(b, c), !1 !== Prefs.get("reload-sound-enabled") && Reloader.playAlertSound()) : Reloader.setRepeatsSound(!1)
                    })
                },
                3E4)) : Reloader.repeat_timer && (clearInterval(Reloader.repeat_timer), Reloader.repeat_timer = 0)
        },
        showNotification: function (a, b) {
            try {
                if (!1 !== Prefs.get("show-reloader-notification")) {
                    var c = {
                        type: "basic",
                        title: a,
                        message: b || "",
                        iconUrl: "img/128x128.png"
                    };
                    chrome.notifications.clear("reloader-alert", function () {
                        chrome.notifications.create("reloader-alert", c)
                    })
                }
            } catch (d) {
                console.error("Error in Reloader.showNotification: " + d.message)
            }
        },
        failsafeReload: function () {
            chrome.tabs.get(Reloader.monitoring_tab, function (a) {
                chrome.runtime.lastError ||
                    "loading" == a.status || (chrome.tabs.update(a.id, {
                        url: RATERHUB_INDEX
                    }), IS_DEBUG && console.log("FAILSAFE RELOAD"))
            })
        },
        setMonitoringTab: function (a, b) {
            a ? (Reloader.monitoring_tab = b, Reloader.failsafe_timer = setTimeout(Reloader.failsafeReload, 2E3)) : Reloader.failsafe_timer && (clearTimeout(Reloader.failsafe_timer), Reloader.monitoring_tab = 0, Reloader.failsafe_timer = 0)
        },
        attachProjectsWorker: function () {
            function a(a) {
                chrome.tabs.executeScript(a, {
                    file: "js/lib/jquery.min.js"
                }, function () {
                    chrome.tabs.executeScript(a, {
                        file: "js/projects-worker.js"
                    })
                })
            }
            chrome.tabs.query({
                url: LF_PROJECTS
            }, function (b) {
                $.each(b, function (b, d) {
                    a(d.id)
                })
            })
        },
        projectsPageDidLoadInTab: function (a) {},
        projectsPageNeedsLogin: function (a) {}
    };
var Storage = {
    initialize: function (a) {
        Prefs.set("datastore-busy", !1);
        Storage.Remote.initialize(a)
    },
    getDropboxClient: function () {
        Storage.client_instance || (Storage.client_instance = new Dropbox.Client({
            key: atob("c3BuOGk3ODhkMXpwa3J2")
        }));
        return Storage.client_instance
    },
    addSessions: function (a) {
        Storage.Remote.addSessions(a)
    },
    deleteSessions: function (a) {
        Storage.Remote.removeSessions(a)
    },
    updateSessions: function (a, b) {
        Storage.Remote.updateSessions(a)
    },
    exportCSV: function (a, b, c) {
        try {
            var d = (new CSV({
                    header: !0
                })).encode(a).data,
                e = (Prefs.get("user") || {})["dropbox-token"] || "";
            if (e) {
                var f = {
                    mode: {
                        ".tag": "overwrite"
                    },
                    mute: !1,
                    path: "/" + b
                };
                $.ajax({
                    url: "https://content.dropboxapi.com/2/files/upload",
                    type: "POST",
                    contentType: "application/octet-stream",
                    data: d,
                    beforeSend: function (a) {
                        a.setRequestHeader("Authorization", "Bearer " + e);
                        a.setRequestHeader("Dropbox-API-Arg", JSON.stringify(f))
                    },
                    success: function (b, e) {
                        c({
                            result: {
                                size: d.length
                            },
                            count: a.length
                        })
                    },
                    error: function (a, b, d) {
                        console.log("errorThrown = " + d);
                        c({
                            error: "Error: " + d
                        })
                    }
                })
            } else c({
                error: "No access token. Please sign out and sign back in again."
            })
        } catch (g) {
            c({
                error: g.message
            })
        }
    },
    exportSessions: function (a, b) {
        Storage.Remote.fetchBetween({
            head: 0,
            tail: Number.MAX_VALUE
        }, function (c) {
            var d = Tracker.session && Tracker.session.sid;
            $.each(c, function (a, b) {
                a != d ? c[a] = Storage.packSession(b) : delete c[a]
            });
            var e = chrome.runtime.getManifest(),
                e = "RA," + LZString.compressToBase64(JSON.stringify({
                    version: 1,
                    creator: e.name + "-" + e.version,
                    sessions: c
                })),
                f = (Prefs.get("user") || {})["dropbox-token"] || "";
            if (f) {
                var g = {
                    mode: {
                        ".tag": "overwrite"
                    },
                    mute: !1,
                    path: "/" + a
                };
                $.ajax({
                    url: "https://content.dropboxapi.com/2/files/upload",
                    type: "POST",
                    contentType: "application/octet-stream",
                    data: e,
                    beforeSend: function (a) {
                        a.setRequestHeader("Authorization", "Bearer " + f);
                        a.setRequestHeader("Dropbox-API-Arg", JSON.stringify(g))
                    },
                    success: function (a, d) {
                        b({
                            count: Object.keys(c).length
                        })
                    },
                    error: function (a, c, d) {
                        console.log("errorThrown = " + d);
                        b({
                            error: "Error: " + d
                        })
                    }
                })
            } else b({
                error: "No access token. Please sign out and sign back in again."
            })
        }, function (a) {
            b({
                error: a
            })
        })
    },
    importSessions: function (a, b) {
        try {
            var c = (Prefs.get("user") || {})["dropbox-token"] ||
                "";
            if (c) {
                var d = {
                    path: "/" + a
                };
                $.ajax({
                    url: "https://content.dropboxapi.com/2/files/download",
                    type: "POST",
                    beforeSend: function (a) {
                        a.setRequestHeader("Authorization", "Bearer " + c);
                        a.setRequestHeader("Dropbox-API-Arg", JSON.stringify(d))
                    },
                    success: function (a, c) {
                        try {
                            if (0 != a.indexOf("RA,")) throw {
                                message: "Invalid file type"
                            };
                            var d = LZString.decompressFromBase64(a.substr(3)),
                                e = JSON.parse(d);
                            console.log("Importing " + Object.keys(e.sessions).length + " session(s) from " + e.creator);
                            for (var n in e.sessions) Storage.unpackSession(e.sessions[n],
                                n);
                            Storage.addSessions(e.sessions);
                            b({
                                result: {
                                    adds: Object.keys(e.sessions).length
                                }
                            })
                        } catch (q) {
                            b({
                                error: q && q.message
                            })
                        }
                    },
                    error: function (a, c, d) {
                        console.log("errorThrown = " + d);
                        b({
                            error: "Error: " + d
                        })
                    }
                })
            } else b({
                error: "No access token. Please sign out and sign back in again."
            })
        } catch (e) {
            b({
                error: e && e.message
            })
        }
    },
    clearS2DUrl: function (a) {
        for (var b = 0; b < a.requestHeaders.length; ++b)
            if ("Authorization" == a.requestHeaders[b].name) {
                Storage.uploadLocalSession(a.requestHeaders[b].value);
                break
            } return {
            requestHeaders: a.requestHeaders
        }
    },
    setS2DTaskInfo: function (a) {
        Storage.Remote.setDesktopTask(a)
    },
    setS2DUrl: function (a) {
        Storage.Remote.setDesktopUrl(a)
    },
    packSession: function (a) {
        a = JSON.parse(JSON.stringify(a));
        a.start = Math.floor(a.start / 1E3);
        a.stop = Math.floor(a.stop / 1E3);
        a.allotted = Math.floor(a.allotted / 1E3);
        a.duration = Math.floor(a.duration / 1E3);
        a.surplus = Math.floor(a.surplus / 1E3);
        for (var b in a.types) a.types[b][1] = Math.floor(a.types[b][1] / 1E3), a.types[b][2] = Math.floor(a.types[b][2] / 1E3);
        a.task && (a.task.acquire = Math.floor(a.task.acquire /
            1E3));
        a.data && !Object.keys(a.data).length && delete a.data;
        a.note && !a.note.length && delete a.note;
        a.sid && delete a.sid;
        return a
    },
    unpackSession: function (a, b) {
        a.start *= 1E3;
        a.stop *= 1E3;
        a.allotted *= 1E3;
        a.duration *= 1E3;
        a.surplus *= 1E3;
        for (var c in a.types) a.types[c][1] *= 1E3, a.types[c][2] *= 1E3;
        !a.task || 13415328E5 <= a.task.acquire || (a.task.acquire *= 1E3);
        a.data && a.data.note && (a.note = a.data.note, delete a.data);
        b && (a.sid = b)
    },
    getLocalSession: function () {
        return JSON.parse(localStorage.getItem("session"))
    },
    moveLocalSessionToDropbox: function () {
        var a =
            Storage.getLocalSession();
        if (a) {
            a = JSON.parse(JSON.stringify(a));
            Tracker.updateSessionTime(a, !1);
            var b = {};
            b[a.sid] = a;
            Storage.addSessions(b);
            Storage.setLocalSession(null)
        }
    },
    setLocalSession: function (a) {
        null === a ? localStorage.removeItem("session") : localStorage.setItem("session", JSON.stringify(a));
        return a
    },
    uploadLocalSession: function (a) {
        if (a) {
            var b = Storage.Remote.userTimersRef();
            b && a && a != Storage.timer && (Storage.timer = a, b.update({
                a: a
            }))
        } else if (a = Storage.getLocalSession()) a = JSON.parse(JSON.stringify(a)),
            Tracker.updateSessionTime(a, !1), b = {}, b[a.sid] = a, Storage.addSessions(b)
    },
    Remote: {
        last_authed_uid: null,
        initialize: function (a) {
            firebase.initializeApp({
                apiKey: "AIzaSyB_qRINbCqsCtvhaoyf0RwTUiS4nqFG-Hk",
                databaseURL: "https://rateraide.firebaseio.com"
            });
            Storage.Remote.initializeCache();
            firebase.auth().onAuthStateChanged(function (b) {
                b ? (Storage.Remote.last_authed_uid != b.uid ? (Storage.Remote.last_authed_uid = b.uid, Storage.Remote.onAuthenticated(b)) : IS_DEBUG && console.log('Re-authenticated user "' + b.uid + '"'), Storage.Remote.updateUser(function (a) {
                    var b =
                        a["dropbox-token"] || "";
                    $.ajax({
                        url: "https://api.dropboxapi.com/2/users/get_current_account",
                        type: "POST",
                        beforeSend: function (a) {
                            a.setRequestHeader("Authorization", "Bearer " + b)
                        },
                        success: function (b, d) {
                            a.uid && b.account_id && b.account_id != Prefs.get("account-id") && firebase.database().ref().child("account-ids").child(b.account_id).set(a.uid, function (a) {
                                a ? console.log("Error storing account_id: " + a) : Prefs.set("account-id", b.account_id)
                            });
                            b.profile_photo_url && b.profile_photo_url != Prefs.get("profile-photo-url") &&
                                (console.log("Storing profile_photo_url " + b.profile_photo_url + " for uid " + a.uid), firebase.database().ref().child("users").child(a.uid).child("profile-photo-url").set(b.profile_photo_url, function (a) {
                                    a ? console.log("Error storing profile_photo_url: " + a) : Prefs.set("profile-photo-url", b.profile_photo_url)
                                }))
                        },
                        error: function (a, b, c) {}
                    })
                })) : (Storage.Remote.last_authed_uid = null, Storage.Remote.onUnauthenticated());
                a && a();
                a = null
            })
        },
        initializeCache: function () {
            Storage.Remote.cache = [Number.MAX_VALUE, null]
        },
        authWithCustomToken: function (a) {
            firebase.auth().signInWithCustomToken(a).then(function (a) {
                (a =
                    Storage.Remote.userPrefsRef()) && Prefs.restoreRemotePrefs(a)
            }, function (a) {
                console.error(a)
            })
        },
        authWithDropboxToken: function (a) {
            $.ajax({
                type: "GET",
                url: "https://rateraide.herokuapp.com/login/dropbox/oauth2",
                data: {
                    token: a
                }
            }).always(function (a, c) {
                "error" == c ? console.log("Error in authWithDropboxToken: " + a.responseText) : "success" == c && (a.token2 ? Storage.Remote.authWithCustomToken(a.token2) : console.log("Error in authWithDropboxToken: No token received"))
            })
        },
        getServerTime: function () {
            var a = 0;
            firebase.database().ref().child(".info/serverTimeOffset").on("value",
                function (b) {
                    a = b.val()
                });
            return function () {
                return Date.now() + a
            }
        },
        getUserId: function () {
            var a = firebase.auth().currentUser;
            return a && a.uid || null
        },
        isAuthenticated: function () {
            return !!firebase.auth().currentUser
        },
        signIn: function () {
            Storage.Remote.isAuthenticated() || chrome.tabs.query({
                active: !0,
                lastFocusedWindow: !0
            }, function (a) {
                chrome.tabs.create({
                    active: !0,
                    url: "https://www.dropbox.com/oauth2/authorize?response_type=code&force_reapprove=true&client_id=spn8i788d1zpkrv&redirect_uri=https://rateraide.herokuapp.com/login/dropbox/callback",
                    openerTabId: a.length && a[0].id || 0
                })
            })
        },
        signOut: function () {
            firebase.auth().signOut();
            Tracker.user_totals = null
        },
        userRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("users").child(b));
            return a
        },
        userDeviceTokensRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("devices").child(b));
            return a
        },
        userEventsRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("events").child(b));
            return a
        },
        userMonthsRef: function () {
            var a = Storage.Remote.userRef();
            return a ? a.child("months") : null
        },
        userPrefsRef: function () {
            var a = Storage.Remote.userRef();
            return a ? a.child("prefs") : null
        },
        userPresenceRef: function () {
            var a = firebase.database().ref();
            if (a) {
                var b = Storage.Remote.getUserId();
                if (b) return a.child("presence/" + b)
            }
            return null
        },
        userSessionsRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("sessions").child(b));
            return a
        },
        userTasksRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("tasks").child(b));
            return a
        },
        userTimersRef: function () {
            var a = null,
                b = Storage.Remote.getUserId();
            b && (a = firebase.database().ref().child("timers").child(b));
            return a
        },
        addSessions: function (a) {
            var b = JSON.parse(localStorage.getItem("firebase-edits") || "{}");
            $.each(a, function (a, d) {
                b[a] = d
            });
            localStorage.setItem("firebase-edits", JSON.stringify(b));
            IS_DEBUG && console.log("Added " + Object.keys(a).length + " session(s)");
            Storage.Remote.uploadLocalEdits()
        },
        updateSessions: function (a) {
            var b =
                JSON.parse(localStorage.getItem("firebase-edits") || "{}");
            $.each(a, function (a, d) {
                b[a] || (b[a] = {});
                $.extend(b[a], d)
            });
            localStorage.setItem("firebase-edits", JSON.stringify(b));
            IS_DEBUG && console.log("Updated " + Object.keys(a).length + " session(s)");
            Storage.Remote.uploadLocalEdits()
        },
        removeSessions: function (a) {
            var b = JSON.parse(localStorage.getItem("firebase-edits") || "{}");
            $.each(a, function (a, d) {
                b[a] = null
            });
            localStorage.setItem("firebase-edits", JSON.stringify(b));
            IS_DEBUG && console.log("Removed " + Object.keys(a).length +
                " session(s)");
            Storage.Remote.uploadLocalEdits()
        },
        noteSessionsModified: function (a) {
            var b = JSON.parse(localStorage.getItem("firebase-edits") || "{}");
            $.each(a, function (a, d) {
                delete b[a]
            });
            localStorage.setItem("firebase-edits", JSON.stringify(b))
        },
        resetPrefs: function (a) {
            var b = Storage.Remote.userPrefsRef();
            b ? Prefs.resetRemotePrefs(b, a) : a && a()
        },
        setPrefs: function (a) {
            var b = Storage.Remote.userPrefsRef();
            b && b.update(a)
        },
        uploadLocalEdits: function () {
            var a = JSON.parse(localStorage.getItem("firebase-edits") || "{}");
            if (Object.keys(a).length) {
                $.each(a, function (a, b) {
                    b && b.types && $.each(b.types, function (a, c) {
                        if (-1 != a.indexOf(".") || -1 != a.indexOf("$") || -1 != a.indexOf("/") || -1 != a.indexOf("[") || -1 != a.indexOf("]")) {
                            var g = a.replace(/\.|\$|\/|\[|\]/g, "-");
                            b.types[g] = b.types[a];
                            delete b.types[a]
                        }
                    })
                });
                var b = Storage.Remote.userSessionsRef();
                b && (Storage.Remote.local_change = !0, b.update(a, function (b) {
                    if (b) console.log("Error uploading edit(s): " + b);
                    else {
                        var d = {};
                        $.each(a, function (a, b) {
                            if (b) {
                                var c = Dates.mstrForMoment(Dates.pacificMoment(b.start));
                                d[c] = 1
                            }
                        });
                        Storage.Remote.userMonthsRef().update(d);
                        Storage.Remote.noteSessionsModified(a)
                    }
                }), Storage.Remote.local_change = !1)
            }
        },
        fetchBetween: function (a, b, c) {
            function d(a) {
                var c = {};
                $.each(a, function (a, b) {
                    b.start >= e && b.start < f && (b.types || (b.types = {}), c[a] = b)
                });
                b(c)
            }
            var e = a.head || 0,
                f = a.tail || 0;
            if (e >= Storage.Remote.cache[0] && Storage.Remote.cache[1]) d(Storage.Remote.cache[1]);
            else if (a = Storage.Remote.userSessionsRef()) a.orderByChild("start").startAt(e).endAt(f).once("value", function (a) {
                    d(a.val() || {})
                },
                function (a) {
                    c && c(a)
                });
            else c && c("Client not authenticated")
        },
        fetchMonth: function (a, b, c) {
            a.mstr || Dates.currentMonthStr();
            a = Dates.dateRangeForMonth(a.mstr, !!a.forcePacific);
            Storage.Remote.fetchBetween({
                head: a[0].valueOf(),
                tail: a[1].valueOf()
            }, b, c)
        },
        fetchRolling30: function (a) {
            var b = moment().startOf("day").subtract(30, "d").valueOf(),
                c = moment().valueOf();
            Storage.Remote.fetchBetween({
                head: b,
                tail: c
            }, function (d) {
                var e = 0;
                $.each(d, function (a, b) {
                    0 === (b.pid || 0) && b.types && $.each(b.types, function (a, b) {
                        e += b[0]
                    })
                });
                a({
                    count: e,
                    head: b,
                    tail: c
                })
            }, function (a) {
                a && console.log("Error in fetchRolling30: " + a)
            })
        },
        updateUser: function (a) {
            var b = Storage.Remote.userRef();
            if (b) b.once("value", function (b) {
                if (b.exists()) {
                    var d = {};
                    $.each(b.val(), function (a, b) {
                        "object" !== typeof b && (d[a] = b)
                    });
                    Prefs.set("user", d)
                } else Prefs.set("user", null);
                a && a(d)
            });
            else Prefs.set("user", null)
        },
        setDesktopTask: function (a) {
            var b = Storage.Remote.userTasksRef();
            b && (a && a.taskId ? (b.child("desktop").set(a), Prefs.set("desktop-task-nonce", a.nonce || 0)) : (b.child("desktop").remove(),
                Prefs.set("desktop-task-nonce", null)))
        },
        setDesktopUrl: function (a) {
            Storage.Remote.userEventsRef().child("send-to-device").set({
                nonce: firebase.database.ServerValue.TIMESTAMP,
                url: a
            })
        },
        event_listeners: {},
        onAuthenticated: function (a) {
            IS_DEBUG && console.log('Authenticated user "' + a.uid + '"');
            Storage.Remote.uploadLocalEdits();
            Prefs.set("desktop-user-agent", navigator.userAgent);
            (a = Storage.Remote.userRef()) && Prefs.monitorRemote(a);
            Storage.Remote.userMonthsRef().on("value", function (a) {
                Prefs.set("month-counts",
                    a.val() || {})
            });
            var b = Storage.Remote.userEventsRef();
            b && (Storage.Remote.initialized_event_map = {}, b.child("send-to-desktop").on("value", function (a) {
                Storage.Remote.initialized_event_map[a.key] ? (a = a.val()) && a.url && Features.S2D.openDesktopTaskUrl(a.url) : Storage.Remote.initialized_event_map[a.key] = a.key
            }), b.child("send-to-desktop-live").on("value", function (a) {
                Storage.Remote.initialized_event_map[a.key] ? (a = a.val()) && !a.inactive ? Features.S2D.setLiveResult(a) : Features.S2D.clearLiveResult() : Storage.Remote.initialized_event_map[a.key] =
                    a.key
            }), b.child("send-to-device/opened").on("value", function (a) {
                Storage.Remote.initialized_event_map[a.key] ? a.exists() && Features.broadcastMessage({
                    method: "close-s2d-dialog"
                }) : Storage.Remote.initialized_event_map[a.key] = a.key
            }), b.child("sign-up-on-desktop").on("value", function (a) {
                Storage.Remote.initialized_event_map[a.key] ? a.exists() && (b.child(a.key).remove(), Prefs.showProAccount()) : Storage.Remote.initialized_event_map[a.key] = a.key
            }));
            Storage.Remote.monitorSessions()
        },
        onUnauthenticated: function () {
            IS_DEBUG &&
                console.log("Unauthenticated");
            Storage.Remote.unmonitorSessions();
            Storage.Remote.updateUser();
            Popout.hideTimerWindows()
        },
        monitorSessions: function () {
            Storage.Remote.unmonitorSessions();
            Storage.Remote.monitorSessionsRef = Storage.Remote.userSessionsRef();
            if (null != Storage.Remote.monitorSessionsRef) {
                var a = Dates.dateRangeForMonth()[0].subtract(2, "M").valueOf();
                Storage.Remote.cache[0] = a;
                Storage.Remote.monitorSessionsRef.orderByChild("start").startAt(a).on("value", Storage.Remote.monitorSessionsCallback)
            }
        },
        monitorSessionsCallback: function (a) {
            var b = !!Storage.Remote.local_change,
                c = (b ? "local" : "remote") + " change";
            a = a.val() || {};
            $.each(a, function (a, b) {
                b.types || (b.types = {})
            });
            Storage.Remote.cache[1] = a;
            Controller.updateAllTabs(b, c);
            Tracker.updateTotals(function () {
                Widgets.updateTickers()
            });
            Controller.updateTimesheets()
        },
        unmonitorSessions: function () {
            null != Storage.Remote.monitorSessionsRef && (Storage.Remote.monitorSessionsRef.off("value", Storage.Remote.monitorSessionsCallback), Storage.Remote.monitorSessionsRef =
                null, Storage.Remote.initializeCache())
        },
        setUserExtra: function (a, b) {
            if (b && b != Storage.Remote[a]) {
                var c = Storage.Remote.userRef();
                c && c.child(a).set(b, function (c) {
                    null === c && (Storage.Remote[a] = b)
                })
            }
        }
    }
};
var DEFAULT_SESSION_NAME = "untitled session",
    DURATION_SMEAR_LENGTH = 18E5,
    GOAL_NOTE_ID = "goal-alert",
    LOGIN_NOTE_ID = "login-alert",
    TOOLBAR_NOTE_ID = "toolbar-alert",
    SAVE_INTERVAL = 9E3,
    LEAPFORCE_TOOLBAR = "https://www.leapforceathome.com/qrp/toolbar/service",
    LEAPFORCE_LOGIN = "https://www.leapforceathome.com/qrp/toolbar/login",
    LEAPFORCE_LOGOUT = "https://www.leapforceathome.com/qrp/toolbar/login/logout",
    LEAPFORCE_POPUP = "https://www.leapforceathome.com/qrp/toolbar/login/view",
    RATERHUB_INDEX = "https://www.raterhub.com/evaluation/rater",
    RATERHUB_TASK = "*://*.raterhub.com/evaluation/rater/task/show*",
    RATERHUB_TEST = "*://*.rateraide.com/test/*",
    SIMULATOR_TASKS = ["https://www.leapforceathome.com/qrp/core/vendors/block_utility_*", "https://www.leapforceathome.com/qrp/core/vendors/needs_met_*"],
    SONORA_TASK = "*://*.leapforceathome.com/qrp/core/vendors/task*",
    LB_EXTENSION_ID = "imbankdmoclhcdmdejkklikkpaidaeij",
    LF_EXTENSION_ID = "belncckcaakhmonmcfmegbglccbjlebc",
    LB_EXTENSION_URL = "https://chrome.google.com/webstore/detail/rating-program-extension/imbankdmoclhcdmdejkklikkpaidaeij",
    LF_EXTENSION_URL = "https://chrome.google.com/webstore/detail/leapforce-extension/belncckcaakhmonmcfmegbglccbjlebc",
    TIMING_MODE_STARTSTOP = 0,
    TIMING_MODE_TASKDURATION = 1,
    TIMING_MODE_TOTALAET = 2,
    Tracker = {
        initialize: function () {
            function a() {
                chrome.webRequest.onCompleted.addListener(function (a) {
                    -1 != a.url.indexOf("yukon/submit") ? Tracker.handleSubmit() : -1 != a.url.indexOf("yukon/release") && Tracker.handleRelease()
                }, {
                    urls: ["*://*.rateraide.com/test/*"]
                }, c)
            }
            var b = ["requestHeaders"],
                c = ["responseHeaders"],
                d = function (a) {
                    Tracker.handleSubmit(a,
                        function (a, b) {
                            a || console.log("Could not submit: " + b)
                        })
                },
                e = function () {
                    var a = function (a) {
                            var b = a.url;
                            a = a.statusCode;
                            b.endsWith("/rater/task/new-task") && 200 == a ? (b = /taskIds=(\d+)/.exec(Tracker.lastTaskReferrer), d(b ? b[1] : null), Storage.Remote.setDesktopTask(null)) : -1 != b.indexOf("/rater/task/reject") && 302 == a && Tracker.handleRelease()
                        },
                        e = {
                            urls: ["*://*.raterhub.com/*"]
                        };
                    chrome.webRequest.onCompleted.addListener(a, e, c);
                    chrome.webRequest.onBeforeRedirect.addListener(a, e, c);
                    chrome.webRequest.onSendHeaders.addListener(function (a) {
                        a =
                            a.requestHeaders;
                        for (var b = 0; b < a.length; b++)
                            if ("Referer" == a[b].name) {
                                Tracker.lastTaskReferrer = a[b].value;
                                break
                            }
                    }, e, b)
                };
            chrome.storage.onChanged.addListener(function (a) {
                if (a["week-offset"] || a["date-offset"]) Tracker.updateMidnightOffset(), Tracker.updateTotals();
                Prefs.isModifyingPrefs || a["resume-sessions"] && Prefs.get("resumable") && !1 === a["resume-sessions"].newValue && Tracker.setResumableSession(null)
            });
            chrome.commands && chrome.commands.onCommand.addListener(function (a) {
                "begin-end-session" == a && Tracker.toggleSession()
            });
            chrome.notifications && (chrome.notifications.onButtonClicked.addListener(function (a, b) {
                if (LOGIN_NOTE_ID == a) 0 == b ? Prefs.get("is-active") || Tracker.toggleSession(!0) : Tracker.can_login_note_resume ? Prefs.get("is-active") || Tracker.toggleSession(!1) : Prefs.set("show-login-notification", !1);
                else if (TOOLBAR_NOTE_ID == a) {
                    if (0 == b) {
                        var c = "lionbridge" == Prefs.get("user-vendor"),
                            d = c ? LB_EXTENSION_ID : LF_EXTENSION_ID,
                            e = c ? LB_EXTENSION_URL : LF_EXTENSION_URL;
                        Tracker.getExtensionInfo(d, function (a) {
                            a && !a.enabled ? chrome.management.setEnabled(d,
                                !0) : chrome.tabs.create({
                                url: e,
                                active: !0
                            })
                        })
                    } else Prefs.set("show-toolbar-notification", !1);
                    chrome.notifications.clear(a)
                } else if (GOAL_NOTE_ID == a) {
                    if (0 == b) Controller.showOptions("goals");
                    else if (1 == b) {
                        var c = Tracker.last_shown_goal_type,
                            q = Tracker.session && Tracker.session.sid;
                        q && c && Tracker.ignoreRepeatingGoalForSession(c, q);
                        Tracker.clearGoalsNotification()
                    }
                    chrome.notifications.clear(a)
                }
            }), chrome.notifications.onClicked.addListener(function (a) {
                GOAL_NOTE_ID == a && Features.showTaskPage()
            }));
            chrome.webRequest &&
                (e(), a());
            (function () {
                var a = Prefs.get("is-active"),
                    b = Prefs.get("resumable");
                Prefs.set("is-active", null);
                Prefs.set("resumable", null);
                var c = Storage.getLocalSession();
                c ? a && Tracker.isSessionResumable(c) ? (Tracker.beginSession(c), Panels.taskWasAcquired()) : (Storage.moveLocalSessionToDropbox(), Tracker.updateUserTotals()) : b && Tracker.fetchAndLoadResumable(b)
            })()
        },
        attemptToAcquireYukonTask: function () {
            chrome.tabs.query({
                url: RATERHUB_TASK
            }, function (a) {
                a.length ? chrome.tabs.sendMessage(a[0].id, {
                        type: "attempt-to-acquire"
                    }) :
                    chrome.tabs.query({
                        url: RATERHUB_TEST
                    }, function (a) {
                        a.length && chrome.tabs.sendMessage(a[0].id, {
                            type: "attempt-to-acquire"
                        })
                    })
            })
        },
        attachTaskWorker: function (a) {
            var b = function (a) {
                    chrome.tabs.executeScript(a, {
                        file: "js/lib/jquery.min.js"
                    }, function () {
                        chrome.tabs.executeScript(a, {
                            file: "js/task-worker.js"
                        })
                    })
                },
                c = function (a, c) {
                    chrome.tabs.query(a, function (a) {
                        a.length ? (b(a[0].id), c(a[0])) : c(null)
                    })
                };
            c({
                url: RATERHUB_TASK,
                lastFocusedWindow: !0
            }, function (b) {
                b || c({
                    url: RATERHUB_TASK
                }, function (b) {
                    b || c({
                            url: RATERHUB_TEST
                        },
                        function (b) {
                            b || c({
                                url: SONORA_TASK
                            }, function (b) {
                                !b && a && a(!1)
                            })
                        })
                })
            })
        },
        beginSession: function (a, b) {
            function c(a) {
                a || (Prefs.set("submits", null), Tracker.last_submitted_task_id = null);
                a = a || Tracker.newSession();
                Prefs.set("is-active", {
                    pid: a.pid || 0
                });
                Tracker.updateSessionTime(a, !0);
                Tracker.session = a;
                Tracker.saveSessionLocally(a, !0);
                Popout.updateCurrentTask();
                Tracker.updateMidnightOffset();
                Tracker.updateTotals();
                Tracker.updateUserTotals();
                var c = b && b.projectId || 0;
                0 == c ? b && b.noAttach || Tracker.attachTaskWorker(function (a) {
                    a ||
                        Popout.sendTaskInfo()
                }) : Popout.sendTaskInfo();
                Tracker.noteSessionActivity();
                Controller.didBeginSession(a);
                Tracker.handleTick(!0, !0);
                Tracker.resumeTimer && (window.clearInterval(Tracker.resumeTimer), Tracker.resumeTimer = null);
                Tracker.clearLoginPrompt();
                Popout.handleLogin();
                Features.handleLogin();
                Widgets.handleLogin();
                ContextMenus.setTimerIsRunning(!0);
                0 == c && Tracker.sendMessageToTaskmaster({
                    method: "login",
                    begin_new: !!e
                });
                b && b.callback && b.callback(a);
                Tracker.showRepeatingGoals()
            }
            var d = Prefs.get("is-active"),
                e = !(!b || !b.noResume),
                f = Prefs.get("resumable"),
                g = Prefs.get("user");
            a ? c(a) : g ? d && Tracker.session ? console.log('Session "' + Tracker.session.name + '" is already active') : f && !e ? Dates.now().getTime() - f.date < Tracker.resumableInterval() ? c(f.session) : c(null) : c(null) : Controller.show()
        },
        canSubmitInHub: function () {
            return !(!Prefs.get("has-hub-task") || !Tracker.session || 0 != (Tracker.session.pid || 0))
        },
        clearLoginPrompt: function (a) {
            chrome.notifications.clear(LOGIN_NOTE_ID, function () {
                a && a()
            })
        },
        endSession: function (a, b) {
            Prefs.set("is-active",
                null);
            var c = Tracker.session;
            if (c) {
                Tracker.session = null;
                Tracker.updateSessionTime(c, !0);
                var d = Tracker.taskCountForSession(c);
                if (a && b) c.stop = b;
                else {
                    var e = Prefs.get("last-event");
                    d && e && e.date && e.sid == c.sid && e.taskCount == d && (a || !1 !== Prefs.get("round-sessions")) ? c.stop = e.date : c.stop = Dates.now().getTime()
                }
                Tracker.updateSessionTime(c, !1);
                (d = !d) ? (Storage.setLocalSession(null), (e = Prefs.get("resumable")) && e.sid == c.sid ? Tracker.setResumableSession(null) : e && e.sid != c.sid && Tracker.fetchAndLoadResumable(e), Tracker.updateTotals()) :
                (Storage.setLocalSession(c), Storage.moveLocalSessionToDropbox(), e = !1 !== Prefs.get("resume-sessions"), Tracker.setResumableSession(e ? c : null, function () {
                    Tracker.updateTotals()
                }));
                Controller.didEndSession(c, d);
                Tracker.handleTick(!1, !1);
                Popout.handleLogout();
                Features.handleLogout();
                Widgets.handleLogout();
                Tracker.sendMessageToTaskmaster({
                    method: "logout"
                });
                ContextMenus.setTimerIsRunning(!1)
            } else console.error("Could not end session: no active session")
        },
        handleAcquire: function (a, b) {
            var c = Tracker.session;
            if (c)
                if ("undefined" !==
                    typeof c.pid && c.pid != (a.projectId || 0)) b && b(null, "Task and active session project IDs are different.");
                else {
                    Tracker.noteSessionActivity();
                    var d = Prefs.get("submits");
                    if (d && -1 != d.indexOf(a.taskId)) b && b(null, "Task was already submitted");
                    else {
                        var d = a.type + "," + a.time,
                            e = !!(a.deviceId && 0 < a.deviceId);
                        e && (d += "," + a.deviceId);
                        a.subtype && (d += (e ? "" : ",0") + "," + a.subtype);
                        var e = c.task,
                            f = !e,
                            g = e && e.taskId,
                            h = a.taskId;
                        g && h && g != h && !a.retainTask && (f = !0);
                        f ? (e = c.task = Tracker.newTask(a.taskId, d), a.acquire && (e.acquire = a.acquire)) :
                            (a.taskId && (e.taskId = a.taskId), e.type = d);
                        e.allotted = 1E3 * a.time;
                        "undefined" !== typeof a.projectId && a.projectId !== c.pid && Tracker.handleSessionProjectIdChange(c, a.projectId);
                        Tracker.updateSessionTime(c, !0);
                        Tracker.saveSessionLocally(c, !0);
                        Panels.taskWasAcquired();
                        Popout.updateCurrentTask();
                        Tracker.updateUserTotals();
                        Controller.updateActiveSession();
                        Widgets.handleAcquire();
                        Features.handleAcquire();
                        b && b(e)
                    }
                }
            else b && b(null, "No active session")
        },
        handleIndexPage: function (a) {
            var b = Tracker.session;
            b && Prefs.get("is-active") &&
                0 == (b.pid || 0) && (b.task && !b.task.taskId && Tracker.last_submitted_task_id && Tracker.handleRelease(), b.task && 0 != Tracker.deviceIdForTypeStr(b.task.type) || Prefs.get("stop-on-index") && (!Prefs.get("stop-on-nrt") || Prefs.get("stop-on-nrt") && a) && Tracker.toggleSession())
        },
        handleRelease: function (a) {
            var b = Tracker.session;
            b ? b.task ? 0 != (b.pid || 0) && 4 != (b.pid || 0) ? a && a(null, "Non-Yukon session") : (b.task = null, Tracker.last_submitted_task_id = null, Tracker.updateSessionTime(b, !0), Tracker.saveSessionLocally(b, !0), Popout.updateCurrentTask(),
                Tracker.updateUserTotals(), Controller.updateActiveSession(), Widgets.handleRelease(), Features.handleRelease(), a && a()) : a && a(null, "No active task") : a && a(null, "No active session")
        },
        handleSessionProjectIdChange: function (a, b) {
            a && a.pid !== b && (a.pid = b, 2 == a.pid ? a.note = "Nile" : 3 == a.pid ? a.note = "Blue Nile" : 5 == a.pid ? a.note = "White Nile" : 4 == a.pid ? a.note = "Sonora" : 6 == a.pid ? a.note = "Caribou" : 7 == a.pid ? a.note = "Kwango" : 8 == a.pid ? a.note = "Platte" : 9 == a.pid ? a.note = "Thames" : 10 == a.pid ? a.note = "Danube" : 11 == a.pid ? a.note = "Shasta" :
                12 == a.pid ? a.note = "Tahoe" : 13 == a.pid ? a.note = "Kern" : 14 == a.pid ? a.note = "Hudson" : 15 == a.pid ? a.note = "Truckee" : delete a.note)
        },
        handleSubmit: function (a, b) {
            var c = Tracker.session,
                d = c && c.task;
            if (c && d) {
                if (a) {
                    var e = Prefs.get("submits") || [];
                    if (-1 == e.indexOf(a)) e.push(a), Prefs.set("submits", e);
                    else {
                        b && b(null, "Task was already submitted");
                        return
                    }
                }
                Tracker.submitSessionTask(c);
                Tracker.noteSessionEvent(c, d);
                Tracker.last_submitted_task_id = a || null;
                e = Tracker.newTask(null, d.type);
                e.allotted = d.allotted;
                c.task = e;
                Tracker.noteSessionActivity();
                Tracker.updateSessionTime(c, !0);
                Tracker.saveSessionLocally(c, !0);
                Storage.uploadLocalSession();
                Panels.taskWasAcquired();
                Popout.handleSubmit(d);
                Tracker.updateUserTotals();
                Controller.didSubmitSessionTask();
                Widgets.handleSubmit(a);
                Features.handleSubmit();
                Reloader.handleSubmit();
                Tracker.handleTick(!0, !1);
                b && b(c);
                d = !1;
                e = Dates.localizedMoment();
                c = Tracker.midnightMomentForSession(c);
                if (!e.isBefore(c)) {
                    var f = function (a) {
                        Features.Autosubmit.handleRestartedSession(a)
                    };
                    Tracker.endSession();
                    setTimeout(function () {
                        Tracker.beginSession(null, {
                            noAttach: !0,
                            noResume: !0,
                            callback: f
                        })
                    }, 500);
                    d = !0
                }
                d || Tracker.showRepeatingGoals()
            } else b && b(null, "No active task")
        },
        handleTick: function (a, b) {
            if (!1 === a) Tracker.tick_timer && clearInterval(Tracker.tick_timer), Tracker.tick_timer = 0, Tracker.showAlertForGoal(null);
            else {
                !0 === a && (Tracker.tick_timer && clearInterval(Tracker.tick_timer), Tracker.tick_timer = setInterval(Tracker.handleTick, 1E3), Tracker.showAlertForGoal(null));
                var c = Tracker.session;
                Tracker.updateSessionTime(c, !0);
                Tracker.saveSessionLocally(c, !1);
                var d =
                    Tracker.updateUserTotals();
                Controller.updateActiveSession();
                Panels.taskDidTick();
                var e = Date.now() - Tracker.last_activity,
                    f = Prefs.get("autologout-interval"),
                    f = 36E5 * ("undefined" === typeof f ? 1 : f);
                if (!1 !== Prefs.get("autologout-enabled") && f && e >= f) Tracker.endSession(!0);
                else {
                    if (Tracker.midnight_offset && c.stop >= Tracker.midnight_offset && (1 == Prefs.get("midnight-restart-mode") || !c.task)) {
                        var g = function (a) {
                                if (h) {
                                    var b = {
                                        acquire: h.acquire,
                                        taskId: h.taskId || null,
                                        time: h.type.split(",")[1],
                                        type: h.type.split(",")[0]
                                    };
                                    Tracker.handleAcquire(b)
                                }
                                Features.Autosubmit.handleRestartedSession(a)
                            },
                            h = c.task ? JSON.parse(JSON.stringify(c.task)) : null;
                        Tracker.endSession(!0, Tracker.midnight_offset - 1E3);
                        setTimeout(function () {
                            Tracker.beginSession(null, {
                                noAttach: !0,
                                noResume: !0,
                                callback: g
                            })
                        }, 500)
                    }
                    Tracker.checkGoals(d, c, b)
                }
            }
            Widgets.updateTickers()
        },
        noteSessionActivity: function () {
            Tracker.last_activity = Date.now()
        },
        noteSessionEvent: function (a, b) {
            if (a) {
                var c = {
                    date: Dates.now().getTime(),
                    sid: a.sid,
                    taskCount: Tracker.taskCountForSession(a),
                    taskType: b && b.type
                };
                chrome.storage.local.set({
                    "last-event": c
                })
            } else chrome.storage.local.remove("last-event")
        },
        noteSessionsAdded: function (a) {
            Tracker.updateTotals()
        },
        noteSessionsDeleted: function (a) {
            var b = Prefs.get("resumable"),
                c = !1,
                d;
            for (d in a) b && b.sid == d && Tracker.setResumableSession(null), Tracker._totalsSids[d] && (c = !0);
            c && Tracker.updateTotals()
        },
        noteSessionsEdited: function (a, b) {
            var c = Prefs.get("resumable"),
                d = !1;
            $.each(a, function (a, f) {
                if (c && c.sid == a) {
                    var g = b && b[a];
                    g && g.stop != f.stop && !Tracker.isSessionResumable(f) ?
                        Tracker.setResumableSession(null) : (c.session = f, Prefs.set("resumable", c), Tracker._resumableTotals = {
                            duration: f.duration,
                            surplus: f.surplus,
                            allotted: f.allotted
                        });
                    d = !0
                } else Tracker.session && Tracker.session.sid == a && f ? (Tracker.session = f, Tracker.handleTick(null, !0)) : Tracker._totalsSids[a] && (d = !0)
            });
            d && Tracker.updateTotals()
        },
        promptUserToBeginIfNecessary: function () {
            if (!Tracker.session && !1 !== Prefs.get("show-login-notification")) {
                Tracker.can_login_note_resume = !!Prefs.get("resumable");
                var a = [];
                Tracker.can_login_note_resume &&
                    a.push({
                        title: "Resume Previous Session",
                        iconUrl: "img/next.png"
                    });
                a.push({
                    title: "Begin New Session",
                    iconUrl: "img/play.png"
                });
                a.push({
                    title: "Ignore Future Warnings",
                    iconUrl: "img/halt.png"
                });
                var b = {
                    type: "basic",
                    title: "RaterAide Is Not Running",
                    message: "Begin a session to start working.",
                    iconUrl: "img/128x128.png",
                    buttons: a
                };
                Tracker.clearLoginPrompt(function () {
                    chrome.notifications.create(LOGIN_NOTE_ID, b)
                })
            }
        },
        sendMessageToTaskmaster: function (a) {
            chrome.runtime.sendMessage("pogdgbdkjnahpajhokdcamclkiomifkc",
                a)
        },
        setResumableSession: function (a, b) {
            if (a) {
                var c = {
                    date: Dates.now().getTime(),
                    sid: a.sid,
                    session: a,
                    pid: a.pid || 0
                };
                Tracker.resumeTimer && window.clearInterval(Tracker.resumeTimer);
                Tracker.resumeTimer = window.setInterval(function () {
                    var a = Date.now() - c.date;
                    (a >= Tracker.resumableInterval() || 0 > a) && Tracker.setResumableSession(null)
                }, 1E3);
                chrome.storage.local.set({
                    resumable: c
                }, function () {
                    b && b()
                });
                Tracker._resumableTotals = {
                    duration: a.duration,
                    surplus: a.surplus,
                    allotted: a.allotted
                }
            } else chrome.storage.local.remove("resumable",
                function () {
                    Tracker.resumeTimer && (window.clearInterval(Tracker.resumeTimer), Tracker.resumeTimer = null);
                    b && b()
                }), Tracker._resumableTotals = null;
            Tracker.updateTotals()
        },
        resumeSession: function (a) {
            !Prefs.get("is-active") && a && Tracker.toggleSession(!1, a)
        },
        toggleSession: function (a, b, c) {
            Prefs.get("is-active") ? Tracker.endSession() : (Tracker.beginSession(b || null, {
                noResume: !!a,
                projectId: c || 0
            }), Prefs.get("has-hub-task") && !1 !== Prefs.get("show-toolbar-notification") && "leapforce" == Prefs.get("user-vendor") && Tracker.getExtensionInfo(LF_EXTENSION_ID,
                function (a) {
                    if (!a || !a.enabled) {
                        var b = "lionbridge" == Prefs.get("user-vendor") ? "Lionbridge" : "Leapforce";
                        a = a && !a.enabled;
                        chrome.notifications.create(TOOLBAR_NOTE_ID, {
                            type: "basic",
                            title: b + " Extension Not " + (a ? "Enabled" : "Installed"),
                            message: "",
                            iconUrl: "img/warning.png",
                            buttons: [{
                                title: (a ? "Enable" : "Install") + " " + b + " Extension" + (a ? "" : "..."),
                                iconUrl: "img/tick.png"
                            }, {
                                title: "Ignore Future Warnings",
                                iconUrl: "img/halt.png"
                            }]
                        })
                    }
                }))
        },
        session: null,
        generatePushID: function () {
            for (var a = [], b = (new Date).getTime(), c = 0 ===
                    b, d = Array(8), e = 7; 0 <= e; e--) d[e] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b % 64), b = Math.floor(b / 64);
            if (0 !== b) throw Error("We should have converted the entire timestamp.");
            b = d.join("");
            if (c) {
                for (e = 11; 0 <= e && 63 === a[e]; e--) a[e] = 0;
                a[e]++
            } else
                for (e = 0; 12 > e; e++) a[e] = Math.floor(64 * Math.random());
            for (e = 0; 12 > e; e++) b += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(a[e]);
            if (20 != b.length) throw Error("Length should be 20.");
            return b
        },
        newSession: function (a) {
            var b = {
                sid: Tracker.generatePushID(),
                name: DEFAULT_SESSION_NAME,
                start: Dates.now().getTime(),
                stop: Dates.now().getTime(),
                allotted: 0,
                duration: 0,
                surplus: 0,
                earnings: 0,
                task: null,
                types: {}
            };
            a && Tracker.handleSessionProjectIdChange(b, a);
            return b
        },
        newTask: function (a, b) {
            return {
                taskId: a || null,
                type: b || null,
                acquire: Dates.now().getTime(),
                allotted: 0
            }
        },
        activeTaskSpeed: function () {
            var a = Tracker.session;
            if (!a || !a.task) return null;
            a = a.task;
            if (!a || !a.acquire) return null;
            var b = Dates.now().getTime() - a.acquire;
            return Math.round(a.allotted /
                (0 != b ? b : 1) * 1E3) / 10
        },
        activeTaskSurplus: function () {
            var a = Tracker.session;
            if (!a || !a.task) return null;
            a = a.task;
            if (!a || !a.acquire) return null;
            var b = Dates.now().getTime() - a.acquire;
            return Math.floor(a.allotted - b)
        },
        deviceIdForTypeStr: function (a) {
            a = a.split(",");
            return 2 < a.length ? parseInt(a[2], 10) : 0
        },
        doesSessionHaveTaskType: function (a, b) {
            if (!a || !b) return !1;
            b = b.toLowerCase();
            for (var c in a.types)
                if (0 == c.toLowerCase().indexOf(b)) return !0;
            return !1
        },
        fetchAndLoadResumable: function (a) {
            var b = Date.now() - a.date;
            0 <=
                b && b < Tracker.resumableInterval() && Tracker.setResumableSession(a.session)
        },
        getExtensionInfo: function (a, b) {
            chrome.management.getAll(function (c) {
                for (var d = 0; d < c.length; d++)
                    if (a == c[d].id) {
                        b(c[d]);
                        return
                    } b(null)
            })
        },
        isDeviceNote: function (a) {
            return "Android" == a || "Android Tablet" == a || "iPhone" == a || "iPad" == a
        },
        isSessionResumable: function (a) {
            a = Date.now() - (a.stop || 0);
            return 0 <= a && a < Tracker.resumableInterval()
        },
        midnightMomentForSession: function (a) {
            return Dates.localizedMoment(a.start).startOf("day").add(1, "d")
        },
        nameForSession: function (a) {
            var b = function (a, b) {
                    var c = parseInt(a, 10),
                        d = parseInt(b, 10);
                    return c != d ? d - c : b > a ? -1 : 1
                },
                c = DEFAULT_SESSION_NAME,
                c = {},
                d;
            for (d in a.types) {
                var e = d.split(",")[0],
                    f = e.toLowerCase();
                if (0 == f.indexOf("exp") || 0 == f.indexOf("sxs") || 0 == f.indexOf("rr")) e = e.split(" "), e = e.length && e[0].length ? e[0] : null;
                e && (c[e] = c[e] ? c[e] + a.types[d][0] : a.types[d][0])
            }
            a = [];
            for (var g in c) a.push(c[g] + " " + g);
            a.length ? (a.sort(b), c = a.join(", ")) : c = DEFAULT_SESSION_NAME;
            return c
        },
        noteForDeviceId: function (a) {
            switch (a) {
                case 1:
                    return "Android";
                case 2:
                    return "Android Tablet";
                case 8:
                    return "iPhone";
                case 9:
                    return "iPad";
                default:
                    return ""
            }
        },
        resumableInterval: function () {
            return !1 !== Prefs.get("resume-sessions") ? 6E4 : 0
        },
        saveSessionLocally: function (a, b) {
            var c = Date.now() - Tracker.lastSessionSaveTime;
            return b || c >= SAVE_INTERVAL || 0 > c ? (Storage.setLocalSession(a), Tracker.lastSessionSaveTime = Date.now(), !0) : !1
        },
        submitSessionTask: function (a) {
            var b = a.task;
            if (b) {
                var c = b.type;
                b.acquire && c ? (Tracker.updateSessionTime(a, !0), a.types[c] || (a.types[c] = [0, 0, 0]), a.types[c][0] +=
                    1, a.types[c][1] += b.allotted, a.types[c][2] += Dates.now().getTime() - b.acquire, a.task = null, a.name = Tracker.nameForSession(a), Tracker.updateSessionTime(a, !0), b = Tracker.deviceIdForTypeStr(c), 0 < b && (!a.note || Tracker.isDeviceNote(a.note)) && (a.note = Tracker.noteForDeviceId(b))) : console.error("Error in submitSessionTask: Invalid task")
            } else console.error("Error in submitSessionTask: No current task")
        },
        taskCountForSession: function (a) {
            var b = 0;
            if (a)
                for (var c in a.types) b += a.types[c][0];
            return b
        },
        transientValuesForSession: function (a,
            b) {
            function c(a) {
                try {
                    var b = a.start,
                        c = Math.abs(b - (b - b % 6E4)),
                        b = 18E5 + DURATION_SMEAR_LENGTH - c,
                        d = f - a.start;
                    a = 0;
                    a = 18E5 > d ? 0 : d < b ? (d - 18E5) / (b - 18E5) * c : Math.ceil(c);
                    return 1E3 * Math.floor((d + a) / 1E3)
                } catch (e) {
                    console.error("Exception in durationForActiveSession: " + e.message)
                }
            }

            function d(a, b) {
                return Math.round((b - b % 6E4 - (a - a % 6E4)) / 6E4)
            }

            function e(a, b) {
                var c = b || 0,
                    d = Math.pow(10, c),
                    e = +(c ? a * d : a).toFixed(8),
                    f = Math.floor(e),
                    g = e - f,
                    e = .49999999 < g && .50000001 > g ? 0 == f % 2 ? f : f + 1 : Math.round(e);
                return c ? e / d : e
            }
            var f = Dates.now().getTime(),
                g = Prefs.get("hourly-rate");
            "undefined" === typeof g && (g = 13500);
            switch (a.pid) {
                case 2:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-nile") ? Prefs.get("hourly-rate-nile") : 13500;
                    break;
                case 3:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-blue-nile") ? Prefs.get("hourly-rate-blue-nile") : 13500;
                    break;
                case 4:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-sonora") ? Prefs.get("hourly-rate-sonora") : 13500;
                    break;
                case 5:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-white-nile") ? Prefs.get("hourly-rate-white-nile") : 13500;
                    break;
                case 6:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-caribou") ? Prefs.get("hourly-rate-caribou") : 13500;
                    break;
                case 7:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-kwango") ? Prefs.get("hourly-rate-kwango") : 13500;
                    break;
                case 8:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-platte") ? Prefs.get("hourly-rate-platte") : 13500;
                    break;
                case 9:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-thames") ? Prefs.get("hourly-rate-thames") : 13500;
                    break;
                case 10:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-danube") ? Prefs.get("hourly-rate-danube") :
                        13500;
                    break;
                case 11:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-shasta") ? Prefs.get("hourly-rate-shasta") : 13500;
                    break;
                case 12:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-tahoe") ? Prefs.get("hourly-rate-tahoe") : 13500;
                    break;
                case 13:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-kern") ? Prefs.get("hourly-rate-kern") : 13500;
                    break;
                case 14:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-hudson") ? Prefs.get("hourly-rate-hudson") : 13500;
                    break;
                case 15:
                    g = "undefined" !== typeof Prefs.get("hourly-rate-truckee") ? Prefs.get("hourly-rate-truckee") :
                        13500
            }
            var h = 0,
                k = 0,
                n = 0,
                q = Tracker.nameForSession(a),
                t = b ? f : a.stop,
                p = 0,
                n = Prefs.get("session-timing-mode") || 0;
            if (TIMING_MODE_TOTALAET == n) {
                for (var r in a.types) h += a.types[r][1], k += a.types[r][1];
                b && a.task && (h += a.task.allotted, k += f - a.task.acquire);
                n = 10 * e(k / 36E5 * g / 10);
                p = h - k
            } else if (TIMING_MODE_TASKDURATION == n) {
                for (r in a.types) h += a.types[r][1], k += a.types[r][2];
                b && a.task && (h += a.task.allotted, k += f - a.task.acquire);
                n = 10 * e(k / 36E5 * g / 10);
                p = h - k
            } else {
                for (r in a.types) h += a.types[r][1];
                b && a.task && (h += a.task.allotted);
                k = b ? c(a) : 6E4 * d(a.start, t);
                n = 10 * e(k / 36E5 * g / 10);
                p = 0 < h ? h - k : 0
            }
            return {
                name: q,
                allotted: Math.max(h, 0),
                duration: Math.max(k, 0),
                earnings: Math.max(n, 0),
                surplus: p,
                stop: t
            }
        },
        transientValuesForSessions: function (a) {
            var b = {},
                c;
            for (c in a) b[c] = Tracker.transientValuesForSession(a[c]);
            return b
        },
        updateMidnightOffset: function () {
            Tracker.midnight_offset = Dates.dateRangeForToday()[1].valueOf()
        },
        updateSessionEarnings: function (a) {
            var b = Dates.currentMonthStr();
            Storage.Remote.fetchMonth({
                mstr: b
            }, function (c) {
                $.each(c, function (a,
                    b) {
                    Tracker.updateSessionTime(b, !1, !0)
                });
                Storage.Remote.updateSessions(c);
                a && a({
                    month: b
                })
            }, function (b) {
                a && a({
                    error: b
                })
            })
        },
        updateSessionTime: function (a, b, c) {
            b = Tracker.transientValuesForSession(a, b || !a.stop);
            var d = !1;
            b.stop != a.stop && (d = !0, a.stop = b.stop);
            b.duration != a.duration && (d = !0, a.duration = b.duration);
            c || b.surplus == a.surplus || (d = !0, a.surplus = b.surplus);
            b.earnings != a.earnings && (d = !0, a.earnings = b.earnings);
            b.allotted != a.allotted && (d = !0, a.allotted = b.allotted);
            return d
        },
        updateSessionTimings: function (a) {
            var b =
                Dates.currentMonthStr();
            Storage.Remote.fetchMonth({
                mstr: b
            }, function (c) {
                $.each(c, function (a, b) {
                    Tracker.updateSessionTime(b, !1, !1)
                });
                Tracker.session && (Tracker.updateSessionTime(Tracker.session, !0, !1), c[Tracker.session.sid] = Tracker.session);
                Storage.Remote.updateSessions(c);
                a && a({
                    month: b
                })
            }, function (b) {
                a && a({
                    error: b
                })
            })
        },
        emptyTotals: function () {
            return {
                duration: {
                    type: 0,
                    day: 0,
                    yday: 0,
                    week: 0,
                    month: 0,
                    period: 0
                },
                surplus: {
                    type: 0,
                    day: 0,
                    yday: 0,
                    week: 0,
                    month: 0,
                    period: 0
                },
                allotted: {
                    type: 0,
                    day: 0,
                    yday: 0,
                    week: 0,
                    month: 0,
                    period: 0
                },
                earnings: {
                    type: 0,
                    day: 0,
                    yday: 0,
                    week: 0,
                    month: 0,
                    period: 0
                }
            }
        },
        updateUserTotals: function () {
            var a = Dates.now().getTime(),
                b = Tracker._totals,
                c = {
                    duration: {},
                    surplus: {},
                    speed: {},
                    allotted: {},
                    earnings: {},
                    taskId: 0
                },
                d = 0,
                e = 0,
                f = 0,
                g = 0,
                h = Tracker.session;
            if (h && (e += h.duration, f += h.surplus, d += h.allotted, g += h.earnings, c.duration.session = h.duration, c.surplus.session = h.surplus, c.speed.session = d && h.duration ? d / h.duration : 9.999, c.earnings.session = h.earnings, c.allotted.session = h.allotted, h.task)) {
                var k = h.task;
                c.duration.task =
                    1E3 * Math.round((a - k.acquire) / 1E3);
                var n = Math.round(k.allotted - c.duration.task);
                c.surplus.task = 1E3 * Math.round(n / 1E3);
                c.speed.task = k.allotted && c.duration.task ? k.allotted / c.duration.task : 9.999;
                c.allotted.task = k.allotted || 0
            }
            Tracker._resumableTotals && (k = Tracker._resumableTotals, c.duration.resumable = k.duration, c.surplus.resumable = k.surplus, c.speed.resumable = k.allotted && k.duration ? k.allotted / k.duration : 9.999, c.earnings.resumable = k.earnings, c.allotted.resumable = k.allotted);
            b && (c.duration.day = b.duration.day +
                e, c.surplus.day = b.surplus.day + f, c.allotted.day = b.allotted.day + d, c.speed.day = c.allotted.day && c.duration.day ? c.allotted.day / c.duration.day : 9.999, c.earnings.day = b.earnings.day + g, c.duration.week = b.duration.week + e, c.surplus.week = b.surplus.week + f, c.allotted.week = b.allotted.week + d, c.speed.week = c.allotted.week && c.duration.week ? c.allotted.week / c.duration.week : 9.999, c.earnings.week = b.earnings.week + g, c.duration.month = b.duration.month + e, c.surplus.month = b.surplus.month + f, c.allotted.month = b.allotted.month + d, c.speed.month =
                c.allotted.month && c.duration.month ? c.allotted.month / c.duration.month : 9.999, c.earnings.month = b.earnings.month + g, c.duration.period = b.duration.period + e, c.surplus.period = b.surplus.period + f, c.allotted.period = b.allotted.period + d, c.speed.period = c.allotted.period && c.duration.period ? c.allotted.period / c.duration.period : 9.999, c.earnings.period = b.earnings.period + g);
            h && h.task && h.task.taskId && (c.taskId = h.task.taskId);
            c.nonce = a;
            return Tracker.user_totals = c
        },
        updateTotals: function (a) {
            var b = Tracker.emptyTotals(),
                c = {};
            Tracker.session && (c[Tracker.session.sid] = 1);
            var d = Dates.dateRangeForToday(),
                e = d[0].valueOf(),
                f = d[1].valueOf();
            Dates.dateRangeForToday();
            var g = d[0].valueOf(),
                h = d[0].subtract(1, "d").valueOf(),
                d = Dates.dateRangeForWeek(),
                k = d[0].valueOf(),
                n = d[1].valueOf(),
                d = Dates.dateRangeForMonth(null),
                q = d[0].valueOf(),
                t = d[1].valueOf(),
                p = Dates.dateRangeForPeriod(),
                r = p[0].valueOf(),
                u = p[1].valueOf(),
                v = {};
            Storage.Remote.fetchBetween({
                head: d[0].subtract(7, "d").valueOf(),
                tail: d[1].add(7, "d").valueOf()
            }, function (d, p) {
                p = {};
                $.each(d, function (a, b) {
                    if (b.start >= q && b.start < t) {
                        var c = b.pid || 0;
                        p[c] || (p[c] = 0);
                        p[c] += 1
                    }
                });
                var z = 1 < Object.keys(p).length,
                    B;
                for (B in d) {
                    var l = d[B];
                    if (!c[l.sid]) {
                        var C = l.start >= r && l.start < u,
                            D = l.start >= q && l.start < t,
                            E = l.start >= k && l.start < n,
                            F = l.start >= h && l.start < g,
                            G = l.start >= e && l.start < f;
                        if (D || E || F || G || C) {
                            var x = Dates.localizedMoment(l.start);
                            x.month();
                            x.date();
                            x.year();
                            x = l.pid || 0;
                            C && (b.duration.period += l.duration, b.allotted.period += 0 != l.allotted ? l.allotted : l.duration, b.earnings.period += l.earnings, z &&
                                0 != x || (b.surplus.period += l.surplus));
                            D && (b.duration.month += l.duration, b.allotted.month += 0 != l.allotted ? l.allotted : l.duration, b.earnings.month += l.earnings, z && 0 != x || (b.surplus.month += l.surplus));
                            E && (b.duration.week += l.duration, b.allotted.week += 0 != l.allotted ? l.allotted : l.duration, b.earnings.week += l.earnings, z && 0 != x || (b.surplus.week += l.surplus));
                            F && (b.duration.yday += l.duration, b.allotted.yday += 0 != l.allotted ? l.allotted : l.duration, b.earnings.yday += l.earnings, z && 0 != x || (b.surplus.yday += l.surplus));
                            G && (b.duration.day +=
                                l.duration, b.allotted.day += 0 != l.allotted ? l.allotted : l.duration, b.earnings.day += l.earnings, z && 0 != x || (b.surplus.day += l.surplus));
                            v[l.sid] = 1
                        }
                    }
                }
                Tracker._totals = b;
                Tracker._totalsSids = v;
                Tracker.updateUserTotals();
                Prefs.set("totals", b);
                a && a()
            }, function (b) {
                a && a()
            })
        },
        lastSessionSaveTime: 0,
        last_activity: 0,
        _resumableTotals: null,
        _totals: null,
        _totalsSids: {},
        user_totals: null,
        _wasPopupOpened: !1,
        checkGoals: function (a, b, c) {
            var d = Prefs.get("goals"),
                e = !1;
            $.each(["session", "day", "week", "month"], function (f, g) {
                if (d && d[g] &&
                    d[g].enabled) {
                    var h = !1,
                        k = a.duration[g];
                    "aet" == d[g].mode && (k = a.allotted[g], Tracker.session && Tracker.session.task && (k -= Tracker.session.task.allotted || 0));
                    var n = 36E5 * (d[g].hour || 0) + 6E4 * (d[g].minute || 0);
                    k >= n && (b.sid != d[g].last_sid && (c || Tracker.showAlertForGoal(g, k, n), d[g].last_sid = b.sid, d[g].last_completed = Date.now(), e = !0), h = !0);
                    !1 !== d[g].fore_enabled && (h ? (d[g].fore_sid = b.sid, e = !0) : k + 6E4 * (d[g].fore || 30) >= n && b.sid != d[g].fore_sid && (d[g].fore_sid = b.sid, e = !0, Tracker.showAlertForGoal(g, k, n)))
                }
            });
            e && Prefs.set("goals",
                d)
        },
        clearGoalsNotification: function (a) {
            chrome.notifications.clear(GOAL_NOTE_ID, function () {
                a && a()
            })
        },
        ignoreRepeatingGoalForSession: function (a, b) {
            var c = Prefs.get("goals");
            c[a].ignore_repeating = b;
            Prefs.set("goals", c)
        },
        showAlertForGoal: function (a, b, c) {
            function d(a) {
                var b = moment.duration(a);
                a = Math.floor(b.asHours());
                var b = b.minutes(),
                    c = "";
                0 < a && (c += a + " hour" + (1 != a ? "s" : ""));
                0 < a && 0 < b && (c += ", ");
                0 < b && (c += b + " minute" + (1 != b ? "s" : ""));
                return c
            }
            var e = {
                    session: "Session",
                    day: "Daily",
                    week: "Weekly",
                    month: "Monthly"
                } [a] ||
                a;
            if (e) {
                var f = "",
                    g = "";
                b < c ? (f = Math.max(c - b, 6E4), g += d(f) + " until " + d(c), f = e + " Goal Approaching!", Tracker.last_shown_goal_type = a) : 6E4 > b - c ? 6E4 <= b && (g += d(b) + " complete", f = e + " Goal Reached!", Tracker.last_shown_goal_type = a) : 6E4 <= b - c && (b -= c, 6E4 <= c && (g += d(b) + " past " + d(c), f = e + " Goal Exceeded!", Tracker.last_shown_goal_type = a));
                if (g && f) {
                    var h = {
                        type: "basic",
                        title: f,
                        message: g,
                        iconUrl: "img/128x128-checkmark.png",
                        buttons: [{
                            title: "Configure Goals...",
                            iconUrl: "img/ic_settings_black_48dp_2x.png"
                        }],
                        isClickable: !0
                    };
                    h.buttons.push({
                        title: "Ignore",
                        iconUrl: "img/ic_not_interested_black_48dp_2x.png"
                    });
                    Tracker.clearGoalsNotification(function () {
                        chrome.notifications.create(GOAL_NOTE_ID, h)
                    })
                }
            } else Tracker.clearGoalsNotification()
        },
        showRepeatingGoals: function () {
            var a = Tracker.user_totals;
            if (a) {
                var b = Prefs.get("goals");
                $.each(["month", "week", "day", "session"], function (c, d) {
                    if (b && b[d] && b[d].enabled && !1 !== b[d].repeat) {
                        var e = a.duration[d];
                        "aet" == b[d].mode && (e = a.allotted[d], Tracker.session && Tracker.session.task && (e -= Tracker.session.task.allotted ||
                            0));
                        var f = 36E5 * (b[d].hour || 0) + 6E4 * (b[d].minute || 0);
                        if (e >= f && 6E4 <= Date.now() - (b[d].last_completed || 0)) return (Tracker.session && Tracker.session.sid) != b[d].ignore_repeating && Tracker.showAlertForGoal(d, e, f), !1
                    }
                })
            }
        }
    };
var AUTOSUBMIT_NOTE_ID = "autosubmit-alert",
    TICKER_BADGE_COLOR = "#000033",
    Widgets = {
        initialize: function () {
            chrome.browserAction.setBadgeBackgroundColor({
                color: TICKER_BADGE_COLOR
            });
            chrome.runtime.onConnect.addListener(function (a) {
                "action-panel" == a.name ? (Widgets.panel_ports.push(a), a.onMessage.addListener(function (a) {
                    "open-popout-timer" == a.method && Popout.showTimerWindows(!0)
                }), a.onDisconnect.addListener(function () {
                    var b = Widgets.panel_ports.indexOf(a); - 1 != b && (Widgets.panel_ports.splice(b, 1), Reloader.stopAlertSound(),
                        Panels._stopSounds())
                })) : "ra-task-page" == a.name && (Widgets.task_ports.push(a), a.onMessage.addListener(function (b) {
                    "did-click-submit" == b.type ? Tracker.session && Tracker.session.pid == b.project_id && Tracker.handleSubmit(b.task_id) : "did-click-release" == b.type ? Tracker.session && Tracker.session.pid == b.project_id && Tracker.handleRelease() : "task-page-activity" == b.type ? Tracker.promptUserToBeginIfNecessary() : "did-autosubmit" == b.type ? (Widgets.showAutosubmitNotification(), Widgets.focusTaskPageTabOnAutosubmit()) : "autosubmit-failed" ==
                        b.type ? (Widgets.showAutosubmitFailedNotification(), Widgets.focusTaskPageTabOnAutosubmit()) : "did-acquire" == b.type ? chrome.idle.queryState(60, function (c) {
                            "active" != c || !Prefs.get("start-on-acquire") || Prefs.get("is-active") || b.test || Tracker.toggleSession(!1, null, b.data.projectId || 0);
                            Tracker.handleAcquire(b.data, function (a, b) {});
                            Reloader.handleAcquire(b.data, a.sender && a.sender.tab)
                        }) : "did-resize-window" != b.type && "did-sasr" == b.type && (Prefs.get("stop-on-sasr") && b.taskId ? Widgets.stop_on_task_id = b.taskId : Widgets.stop_on_task_id =
                            null)
                }), a.onDisconnect.addListener(function (b) {
                    b = Widgets.task_ports.indexOf(a); - 1 != b && Widgets.task_ports.splice(b, 1)
                }), Widgets.updateTickers())
            })
        },
        focusTaskPageTabOnAutosubmit: function () {
            Features.allTaskPageTabs(function (a) {
                var b = Prefs.get("autosubmit-info");
                b && $.each(a, function (a, d) {
                    b.activate_tab && chrome.tabs.update(d.id, {
                        active: !0
                    });
                    b.focus_window && chrome.windows.update(d.windowId, {
                        focused: !0
                    })
                })
            })
        },
        formattedSeconds: function (a) {
            if (-600 >= a) {
                var b = Math.max(Math.ceil(a / 60), -99);
                return "-" + Math.abs(b) +
                    "m"
            }
            if (-60 >= a) return b = Math.ceil(a % 3600 / 60), "-" + Math.abs(b) + "m";
            if (0 == Math.ceil(a)) return "0:00";
            if (0 > a) return "-" + Math.abs(Math.ceil(a)) + "s";
            if (600 > a) return b = Math.floor(a % 3600 / 60), a = Math.floor(a % 3600 % 60), b + ":" + (10 > a ? "0" : "") + a;
            b = Math.round(a % 3600 / 60);
            return b + "m"
        },
        handleAcquire: function () {
            Widgets.updateTickers();
            Widgets.stop_on_task_id = null
        },
        handleLogin: function () {
            Widgets.updateTickers();
            Widgets.stop_on_task_id = null
        },
        handleLogout: function () {
            Widgets.updateTickers();
            Widgets.stop_on_task_id = null
        },
        handleRelease: function () {
            Widgets.setBadgeText("0:00");
            Widgets.updateTickers();
            Widgets.last_flash_time = Date.now();
            Widgets.stop_on_task_id = null
        },
        handleSubmit: function (a) {
            Widgets.updateTickers();
            Widgets.stop_on_task_id && Widgets.stop_on_task_id == a && setTimeout(function () {
                Prefs.get("is-active") && Tracker.toggleSession()
            }, 100);
            Widgets.stop_on_task_id = null
        },
        setBadgeText: function (a) {
            if ("undefined" !== typeof a) Widgets.badge_text = a, chrome.browserAction.setBadgeText({
                text: a
            });
            else return ["requestHeaders"]
        },
        showAutosubmitNotification: function () {
            var a = Prefs.get("autosubmit-info") || {};
            a.enabled && a.push_enabled && chrome.idle.queryState(30, function (b) {
                "active" == b && !1 !== a.push_if_away || Messaging.FCM.sendAlertToDevices("", "Auto-submitted on desktop!", "AUTOSUBMIT_ON_DESKTOP")
            });
            a && a.sound_enabled && Panels._playSubmitSound();
            !1 !== Prefs.get("show-autosubmit-notification") && chrome.notifications.create(AUTOSUBMIT_NOTE_ID, {
                type: "basic",
                title: "Auto-Submitted Task",
                message: "",
                iconUrl: "img/128x128.png"
            }, function () {})
        },
        showAutosubmitFailedNotification: function () {
            console.log("Auto-submit failed")
        },
        updateTickers: function () {
            var a = !!Prefs.get("is-active"),
                b = Tracker.user_totals;
            if (a && b && "undefined" !== typeof b.surplus.session)
                if ("undefined" !== typeof b.surplus.task) d = Widgets.formattedSeconds(b.surplus.task / 1E3), Widgets.last_flash_time = 0, Widgets.setBadgeText(d);
                else {
                    var c = Date.now();
                    200 <= c - Widgets.last_flash_time && (d = Widgets.badge_text || "0 00", d = -1 != d.indexOf(":") ? d.replace(":", " ") : d.replace(" ", ":"), Widgets.last_flash_time = c, Widgets.setBadgeText(d))
                }
            else {
                var d;
                Widgets.last_flash_time = 0;
                Widgets.setBadgeText("")
            }
            a = {
                type: "post-user-totals",
                is_active: a,
                totals: b
            };
            for (b = 0; b < Widgets.task_ports.length; b++) Widgets.task_ports[b].postMessage(a);
            for (b = 0; b < Reloader.index_ports.length; b++) Reloader.index_ports[b].postMessage(a);
            chrome.runtime.sendMessage(a)
        },
        badge_text: "",
        last_flash_time: 0,
        panel_ports: [],
        task_ports: [],
        wr: chrome.webRequest.onBeforeSendHeaders
    };
var m = chrome.runtime.getManifest();
console.log(m.name + " version " + m.version + " loaded on " + moment().format("LLLL"));
var IS_DEBUG = !m.update_url,
    ContextMenus, Updates;
(function () {
    ContextMenus = {
        initialize: function () {
            chrome.contextMenus.create({
                id: "toggle-timer",
                title: "Start/Stop Timer",
                contexts: ["browser_action"],
                onclick: function (a) {
                    Tracker.toggleSession()
                }
            });
            chrome.contextMenus.create({
                title: "Reload Extension",
                contexts: ["browser_action"],
                onclick: function (a) {
                    chrome.runtime.reload()
                }
            });
            chrome.contextMenus.create({
                title: "Add Query Bar Terms",
                contexts: ["editable", "selection"],
                onclick: function (a) {
                    Prefs.get(atob("c3Vic2NyaXB0aW9u")) ? chrome.storage.local.set({
                            "querybar-collapsed": !1
                        },
                        function () {
                            QueryBar.addTermsToQuery(a.selectionText)
                        }) : Prefs.showProAccount()
                }
            });
            chrome.contextMenus.create({
                title: "Set Query Bar Terms",
                contexts: ["editable", "selection"],
                onclick: function (a) {
                    Prefs.get(atob("c3Vic2NyaXB0aW9u")) ? chrome.storage.local.set({
                        "querybar-collapsed": !1
                    }, function () {
                        QueryBar.setTermsFromQuery(a.selectionText)
                    }) : Prefs.showProAccount()
                }
            });
            chrome.contextMenus.create({
                title: "Send to RaterAide",
                contexts: ["audio", "frame", "link", "page", "video"],
                onclick: function (a) {
                    Prefs.get(atob("c3Vic2NyaXB0aW9u")) ?
                        (a = a.linkUrl ? a.linkUrl : a.editable || a.selectionText ? Features.searchUrlForQuery(a.editable || a.selectionText) : a.srcUrl || a.frameUrl || a.pageUrl) && Messaging.FCM.sendLinkToDevices(a, function (a) {
                            chrome.notifications.create("send-to-device-alert", a ? {
                                type: "basic",
                                title: "Link Not Sent",
                                message: a,
                                iconUrl: "img/128x128.png"
                            } : {
                                type: "basic",
                                title: "Sent Link to RaterAide",
                                message: "",
                                iconUrl: "img/128x128.png"
                            })
                        }) : Prefs.showProAccount()
                }
            });
            ContextMenus.setTimerIsRunning(!1)
        },
        setTimerIsRunning: function (a) {
            chrome.contextMenus.update("toggle-timer", {
                title: a ? "End Session" : "Start Session"
            })
        }
    };
    Updates = {
        initialize: function () {
            chrome.idle.setDetectionInterval(600);
            chrome.idle.onStateChanged.addListener(function (a) {
                "active" == a ? Updates.lastActivationTime = Date.now() - 6E4 : Prefs.get("is-active") || Updates.check()
            })
        },
        check: function () {
            36E5 <= Date.now() - (Prefs.get("last-update-check") || 0) && (Prefs.set("last-update-check", Date.now()), chrome.runtime.requestUpdateCheck(function (a, b) {}))
        },
        guid: function () {
            function a() {
                return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
            }
            return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a()
        },
        lastActivationTime: Date.now()
    };
    null === localStorage.getItem("uuid") && localStorage.setItem("uuid", Updates.guid());
    Storage.initialize(function () {
        Storage.Remote.isAuthenticated() || Prefs.set("user", null, Controller.show)
    });
    Prefs.initialize(function () {
        Dates.initialize();
        Features.initialize();
        Widgets.initialize();
        Panels.initialize();
        Controller.initialize();
        Tracker.initialize();
        Reloader.initialize();
        Blocker.initialize();
        QueryBar.initialize();
        ContextMenus.initialize();
        Updates.initialize();
        Popout.initialize();
        Messaging.GCM.initialize()
    })
})();