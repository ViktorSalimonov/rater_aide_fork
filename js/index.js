var Accounts = {
    initialize: function () {
        function b() {
            n = $("#account-dialog").dialog({
                modal: !0,
                width: 480,
                height: "auto",
                title: "RaterAide Pro",
                dialogClass: "no-close",
                resizable: !1,
                create: function () {
                    $(this).find("input").keydown(function (b) {
                        13 == b.which && $(this).select()
                    })
                },
                open: function () {
                    $(".ui-widget-overlay.ui-front").click(function () {
                        "true" !== n.attr("data-busy") && n.dialog("close")
                    });
                    Accounts._setDropboxUid();
                    $(this).find("input").val("").removeClass("invalid");
                    $("#cc-num").payment("formatCardNumber");
                    $("#cc-cvc").payment("formatCardCVC");
                    $("#cc-expiry-full").payment("formatCardExpiry");
                    $(this).find(":focus").blur()
                }
            })
        }

        function e(b) {
            function e(b) {
                $(".ui-dialog-buttonset:visible").last().children(":last-child").button(b ? "enable" : "disable")
            }
            var f = $("#payment-form2"),
                g = $("#cc-expiry-full2").payment("cardExpiryVal");
            g && ($("#cc-expiry-month2").val(g.month), $("#cc-expiry-year2").val(g.year));
            f.find("input").removeClass("invalid");
            e(!1);
            Stripe.card.createToken(f, function (f, g) {
                if (g.error) {
                    var h = function (b) {
                        Utils.presentError({
                            message: b || "Unknown error",
                            title: "CC Authorization Error"
                        })
                    };
                    e(!0);
                    if ("card_error" == g.error.type) switch (g.error.param) {
                        case "number":
                            $("#cc-num2").addClass("invalid").select();
                            break;
                        case "cvc":
                            $("#cc-cvc2").addClass("invalid").select();
                            break;
                        case "exp_month":
                        case "exp_year":
                            $("#cc-expiry-full2").addClass("invalid").select();
                            break;
                        default:
                            h(g.error.message)
                    } else h(g.error.message);
                    b(!1)
                } else h = {
                    update: "true",
                    uid: Prefs.get("user").uid,
                    token: g.id
                }, $.ajax({
                    type: "POST",
                    url: atob("aHR0cHM6Ly93d3cucmF0ZXJhaWRlLmNvbS9hcGkvY3VzdG9tZXJzLnBocA=="),
                    data: h
                }).always(function (f, g) {
                    e(!0);
                    "error" == g ? (Utils.presentError({
                        title: "Could Not Update Card",
                        message: "This operation could not be completed due to an error. Please try again later.",
                        error: f.responseText
                    }), b(!1)) : "success" == g && (Utils.showGenericPrompt({
                        title: "Update Complete",
                        message: "Your credit card information was successfully updated.",
                        buttons: [{
                            text: "OK",
                            width: 100,
                            click: function () {
                                $(this).dialog("close")
                            }
                        }]
                    }), b(!0))
                })
            })
        }

        function f() {
            var b = $("#modify-subscription-dialog").dialog({
                modal: !0,
                width: "auto",
                title: "Edit Subscription",
                resizable: !1,
                buttons: [{
                    text: "Cancel Subscription...",
                    width: 200,
                    click: function () {
                        g(function (e) {
                            e && b.dialog("close")
                        })
                    }
                }, {
                    text: "Update Card",
                    width: 200,
                    click: function () {
                        e(function (e) {
                            e && b.dialog("close")
                        })
                    }
                }],
                open: function () {
                    $(".ui-widget-overlay.ui-front").click(function () {
                        b.dialog("close")
                    })
                },
                create: function () {
                    $(this).find("input").keydown(function (b) {
                        13 == b.which && $(".ui-dialog-buttonset:visible").children(":last").click()
                    })
                },
                open: function () {
                    $(".ui-widget-overlay.ui-front").click(function () {
                        "true" !==
                        b.attr("data-busy") && b.dialog("close")
                    });
                    Accounts._setDropboxUid();
                    $(this).find("input").val("").removeClass("invalid");
                    $("#cc-num2").payment("formatCardNumber");
                    $("#cc-cvc2").payment("formatCardCVC");
                    $("#cc-expiry-full2").payment("formatCardExpiry")
                }
            })
        }

        function g(b) {
            var e = $("#generic-dialog").clone();
            e.find("p").eq(0).text("Are you sure you want to cancel your RaterAide Pro subscription? You will still be able to use the premium features until the end of your billing period.");
            e.dialog({
                modal: !0,
                width: 520,
                title: "Cancel Pro Subscription?",
                dialogClass: "no-close dialog",
                resizable: !1,
                buttons: [{
                    text: "Don't Cancel",
                    width: 150,
                    click: function () {
                        $(this).dialog("close");
                        b(!1)
                    }
                }, {
                    text: "Cancel Subscription",
                    width: 190,
                    click: function () {
                        h(!0);
                        chrome.storage.local.get(["user", _v_], function (f) {
                            $.ajax({
                                type: "POST",
                                url: atob("aHR0cHM6Ly93d3cucmF0ZXJhaWRlLmNvbS9hcGkvY3VzdG9tZXJzLnBocA=="),
                                data: {
                                    uid: f.user.uid,
                                    subId: f.subscription.id,
                                    cancel: "true"
                                }
                            }).always(function (f, g) {
                                h(!1);
                                if ("error" == g) e.dialog("close"), Utils.presentError({
                                    title: "Could Not Cancel Subscription",
                                    message: "This operation could not be performed due to an error. Please try again later.",
                                    error: f.responseText
                                }), b(!1);
                                else if ("success" == g) {
                                    try {
                                        var k = JSON.parse(f).subscription;
                                        Accounts._ss(k);
                                        l(k)
                                    } catch (n) {
                                        console.error(n)
                                    }
                                    e.dialog("close");
                                    b(!0)
                                }
                            })
                        })
                    }
                }],
                open: function () {
                    $(".ui-widget-overlay.ui-front").click(function () {
                        e.dialog("close")
                    })
                },
                close: function () {
                    e.remove()
                }
            })
        }

        function k() {
            h(!0);
            var b = $("#payment-form"),
                e = $("#cc-expiry-full").payment("cardExpiryVal");
            e && ($("#cc-expiry-month").val(e.month),
                $("#cc-expiry-year").val(e.year));
            Stripe.card.createToken(b, function (b, e) {
                if (e.error)
                    if (h(!1), "card_error" == e.error.type) switch (e.error.param) {
                        case "number":
                            $("#cc-num").addClass("invalid").select();
                            break;
                        case "cvc":
                            $("#cc-cvc").addClass("invalid").select();
                            break;
                        case "exp_month":
                        case "exp_year":
                            $("#cc-expiry-full").addClass("invalid").select();
                            break;
                        default:
                            Utils.presentError({
                                message: e.error.message,
                                title: "CC Authorization Error"
                            })
                    } else Utils.presentError({
                        message: e.error.message,
                        title: "CC Authorization Error"
                    });
                    else {
                        var f = Prefs.get("user"),
                            f = {
                                token: e.id,
                                email: f.email,
                                metadata: {
                                    uid: f.uid,
                                    name: f.display_name,
                                    countryCode: f.country
                                }
                            };
                        Prefs.get("user-vendor") && (f.metadata.vendor = Prefs.get("user-vendor"));
                        $.ajax({
                            type: "POST",
                            url: atob("aHR0cHM6Ly93d3cucmF0ZXJhaWRlLmNvbS9hcGkvY3VzdG9tZXJzLnBocA=="),
                            data: {
                                info: f
                            }
                        }).always(function (b, e) {
                            h(!1);
                            if ("error" == e) Utils.presentError({
                                title: "Could Not Complete Transaction",
                                message: "This transaction could not be completed due to an error. Please try again later.",
                                error: b.responseText
                            });
                            else if ("success" == e) try {
                                var f = JSON.parse(b).subscription;
                                Accounts._ss(f);
                                l(f)
                            } catch (g) {
                                console.error(g)
                            }
                        })
                    }
            })
        }

        function h(b) {
            function e(b) {
                var f = {
                        lines: 13,
                        length: 4,
                        width: 2,
                        radius: 5,
                        corners: 0,
                        rotate: 0,
                        direction: 1,
                        color: "#444",
                        speed: 1,
                        trail: 60,
                        shadow: !1,
                        hwaccel: !1,
                        className: "accounts-spinner",
                        zIndex: 2E9,
                        left: 8
                    },
                    g = $(".ui-dialog-buttonpane:visible").last().get(0);
                Accounts._spinner || (Accounts._spinner = (new Spinner(f)).spin(g));
                b ? Accounts._spinner.spin(g) : Accounts._spinner.stop()
            }
            b ? ($(".ui-dialog-buttonset:visible").last().children().button("disable"),
                $("input").removeClass("invalid"), n.attr("data-busy", "true"), e(!0)) : ($(".ui-dialog-buttonset:visible").children().button("enable"), n.attr("data-busy", ""), e(!1))
        }

        function l(b, e) {
            if ($("#account-dialog").is(":visible"))
                if (b) {
                    var g = !!b.cancel_at_period_end,
                        h = b.plan && "proplay" == b.plan.id,
                        u = "past_due" == b.status,
                        r = b.plan && "propaypal" == b.plan.id || "paypal" == b.id,
                        z = b.plan && "proprepaid" == b.plan.id;
                    if (y = !$("#acct-table").is(":visible")) $("#cc-table").hide(), $("#acct-table").show(), n.dialog("option", "buttons",
                            [{
                                text: "Edit Subscription\u2026",
                                width: 180,
                                click: function () {
                                    var b = Prefs.get("subscription"),
                                        e = b.plan && "proplay" == b.plan.id,
                                        g = b.plan && "propaypal" == b.plan.id || "paypal" == b.id;
                                    b.cancel_at_period_end || z ? l(null, !0) : e ? window.open("https://wallet.google.com/manage/w/1/#subscriptions:") : g ? window.open("https://www.paypal.com/us/cgi-bin/webscr?cmd=_manage-paylist") : f()
                                },
                                create: function () {
                                    $("#show-options-dialog").click(function () {
                                        $(".options-item").first().mouseup()
                                    })
                                }
                            }, {
                                text: "OK",
                                width: 120,
                                click: function () {
                                    $(this).dialog("close")
                                }
                            }]),
                        $(".ui-dialog-buttonset:visible").last().children(":first").css("position", "absolute").css("left", "22px"), n.dialog("option", "position", {
                            my: "center",
                            at: "center",
                            of: window
                        });
                    $(".sub-status-row").hide();
                    z ? ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option", "label", "Resubscribe..."), $(".sub-status-row.prepaid").show()) : g ? ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option", "label", "Resubscribe..."), $(".sub-status-row.canceled").show()) : u ? ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option",
                        "label", "Edit Subscription\u2026"), $(".sub-status-row.pastdue").show()) : r ? ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option", "label", "Edit Subscription\u2026"), $(".sub-status-row.paypal").show()) : h ? ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option", "label", "Edit Subscription\u2026"), $(".sub-status-row.proplay").show()) : ($(".ui-dialog-buttonset:visible").last().children().eq(0).button("option", "label", "Edit Subscription\u2026"), $(".sub-status-row.active").show());
                    y && n.dialog("option", "position", {
                        my: "center",
                        at: "center",
                        of: window
                    });
                    g = moment.unix(b.current_period_end);
                    n.find(".sub-date").text(g.format("MMMM D, YYYY"))
                } else {
                    var y = !$("#cc-table").is(":visible");
                    y && ($("#cc-table").show(), $("#acct-table").hide(), n.dialog("option", "buttons", [{
                        text: "Cancel",
                        width: 150,
                        click: function () {
                            $(this).dialog("close");
                            e && $(".account-item").mouseup()
                        }
                    }, {
                        text: "Subscribe",
                        width: 150,
                        click: function () {
                            if ($("#paypal-payment").prop("checked")) {
                                var b = parseInt($("#paypal-plan-length").val() ||
                                    0, 10);
                                $(".paypal-form").get(b).submit()
                            } else k()
                        }
                    }]), n.dialog("option", "position", {
                        my: "center",
                        at: "center",
                        of: window
                    }), $("#cc-num").val(""), $("#cc-cvc").val(""), $("#cc-expiry-full").val(""))
                }
        }
        Stripe.setPublishableKey(atob("cGtfbGl2ZV8xZmREbzZaQm5uZGtmSlg4d1l0MXV5TWk="));
        var n;
        $(".account-item").mouseup(function () {
            Prefs.get("user") && (b(), l(Prefs.get(_v_)));
            chrome.storage.local.remove("show-pro-account")
        });
        $(".cc-cell").click(function () {
            $("#cc-payment").prop("checked", !0);
            $("#paypal-payment").prop("checked",
                !1);
            $(".payment").show();
            $(".payment2").hide();
            $("#payment-methods .length-row").hide()
        });
        $(".paypal-cell").click(function () {
            $("#cc-payment").prop("checked", !1);
            $("#paypal-payment").prop("checked", !0);
            $(".payment").hide();
            $(".payment2").show();
            $("#payment-methods .length-row").show()
        });
        $("#paypal-plan-length").change(function () {
            var b = parseInt($(this).val() || 0, 10);
            $("#cc-table .paypal-logo").each(function (e) {
                $(this).toggle(e == b)
            })
        });
        $(".payment2").on("click", function () {
            $(".ui-dialog-buttonset button").eq(1).click()
        });
        Prefs.monitor(_v_, function (b) {
            l(b)
        })
    },
    s: function (b) {
        this._v(b)
    },
    i: function (b) {
        Prefs.get(_v_) ? chrome.storage.local.set({
            invoiceOpts: {
                date: Date.now(),
                auto: b
            }
        }, function () {
            chrome.runtime.sendMessage({
                method: "run-invoicer",
                active: !b
            })
        }) : $(".account-item").eq(0).mouseup()
    },
    t: function () {
        chrome.runtime.sendMessage({
            method: "open-timecard"
        })
    },
    _setDropboxUid: function () {
        var b = Prefs.get("user");
        $(".dropbox-uid-field").val(b && b.uid)
    },
    _spinner: null,
    _ss: function (b) {
        chrome.storage.local.set({
            busy: !0
        }, function () {
            Prefs.set(_v_,
                b,
                function () {
                    chrome.storage.local.remove("busy")
                })
        })
    },
    _v: function (b) {
        chrome.storage.local.get(_v_, function (e) {
            b(!!e[_v_])
        })
    }
};
var $startAction = $(".main-action").eq(0),
    $startActionLabel = $startAction.find("span").eq(0),
    $stopAction = $(".main-action").eq(1),
    $headerTitles = $(".period span.title"),
    $headerTotals = $(".period span.header-totals"),
    $headerTotalsSession = $(".main-action span.session-totals"),
    $addSessionButton = $("#add-session"),
    $deleteSessionButton = $("#delete-sessions"),
    $editSessionButton = $("#edit-sessions"),
    $joinSessionButton = $("#join-sessions"),
    $zeroSessionButton = $("#zero-sessions"),
    $addTaskButton = $("#add-tasks-item"),
    $deleteTaskButton = $("#delete-tasks-item"),
    $editTaskButton = $("#edit-tasks-item"),
    $zeroTaskButton = $("#zero-tasks-item"),
    $localTimezoneItem = $("#local-time-zone-item"),
    $pacificTimezoneItem = $("#pacific-time-zone-item"),
    $projectPercentage = $("#project-percentage"),
    $sessionsTableFooter = $("#sessions-footer"),
    $sessionsTableTotals = $("#total-session-duration, #total-session-surplus, #total-session-earnings"),
    $sessionsTotalCell = $(".sessions-total-cell"),
    $tasksTotalCell = $(".tasks-total-cell"),
    $tasksTableFooter =
    $("#tasks-footer"),
    $tasksTableTotals = $("#total-task-count, #total-task-speed, #total-task-duration, #total-task-aet, #total-project-pct"),
    $totalSessionDuration = $("#total-session-duration"),
    $totalSessionEarnings = $("#total-session-earnings"),
    $totalSessionSurplus = $("#total-session-surplus"),
    $totalTaskAET = $("#total-task-aet"),
    $totalTaskCount = $("#total-task-count"),
    $totalTaskDuration = $("#total-task-duration"),
    $totalTaskSpeed = $("#total-task-speed"),
    $sessionDurationCell = $("#session-duration-cell"),
    $sessionEarningsCell =
    $("#session-earnings-cell"),
    $sessionSurplusCell = $("#session-surplus-cell"),
    $sessionsTableTitle = $("#sessions-table-title"),
    $taskSpeedCell = $("#task-speed-cell"),
    $taskDurationCell = $("#task-duration-cell"),
    $taskAllottedCell = $("#task-allotted-cell"),
    $tasksTableTitle = $("#tasks-table-title"),
    $expandSessionsItem = $("#expand-sessions-item"),
    $expandTasksItem = $("#expand-tasks-item"),
    $sessionsBodyContainer = $("#sessions-body-container"),
    $tasksBodyContainer = $("#tasks-body-container"),
    $sessionsTableContainer = $("#sessions-table-container"),
    $tasksTableContainer = $("#tasks-table-container"),
    Cache = {
        activeSessionId: function () {
            return Cache.active_session_sid || null
        },
        anySessionInSessionsMap: function (b) {
            for (var e in b) return b[e]
        },
        combineSessionsMaps: function (b, e) {
            for (var f in e) b[f] = e[f];
            return b
        },
        copySessionsMap: function (b) {
            return JSON.parse(JSON.stringify(b))
        },
        getActionableSessions: function (b) {
            var e = Cache.getSelectedSessions();
            e.length || (e = Cache.getAllDisplayedSessions());
            var f = Cache.activeSessionId();
            if (b)
                for (b = e.length - 1; 0 <= b; b--) f && f ==
                    e[b].sid && e.splice(b, 1);
            return e
        },
        getAllDisplayedSessions: function () {
            var b = [];
            $("#sessions-table tr:visible").each(function () {
                var e = $(this).attr("data-sid");
                e && b.push(e)
            });
            return Cache.getSessions(b)
        },
        getSession: function (b) {
            return Cache.smap[b] || null
        },
        getSessions: function (b) {
            var e = [],
                f = Cache.activeSessionId(),
                g = Cache.smap;
            if (g)
                for (var k in g) {
                    var h = g[k].sid; - 1 != b.indexOf(h) && f != h && e.push(g[k])
                }(f = Cache.active_session) && -1 != b.indexOf(f.sid) && e.push(f);
            return e
        },
        getSessionsMap: function (b) {
            return Cache.sessionsMapWithSessions(Cache.getSessions(b))
        },
        getSessionsMapFromSmap: function (b) {
            return Cache.getSessionsMap(Object.keys(b))
        },
        getSelectedSessions: function (b) {
            var e = [],
                f = Cache.activeSessionId();
            $("#sessions-table tr.tr-selected:visible").each(function () {
                var g = $(this).attr(SESSION_SID);
                b && f == g || e.push(g)
            });
            return Cache.getSessions(e)
        },
        getSessionsWithTaskType: function (b) {
            for (var e = [], f = Cache.getActionableSessions(!1), g = 0; g < f.length; g++) f[g].types[b] && e.push(f[g]);
            return e
        },
        mapOfSelectedSessions: function (b) {
            return Cache.sessionsMapWithSessions(Cache.getSelectedSessions(b))
        },
        selectedSessionCount: function () {
            return $("#sessions-table tr.tr-selected:visible").length
        },
        sessionsMapWithSession: function (b) {
            return Cache.sessionsMapWithSessions([b])
        },
        sessionsMapWithSessions: function (b) {
            for (var e = {}, f = 0; f < b.length; f++) e[b[f].sid] = b[f];
            return e
        },
        setActiveSession: function (b) {
            b ? (Cache.smap && Cache.smap[b.sid] && (Cache.smap[b.sid] = b), Cache.active_session = b, Cache.active_session_sid = b.sid) : (Cache.active_session = null, Cache.active_session_sid = null)
        },
        getEditingSession: function () {
            return Cache.editing_session ||
                null
        },
        setEditingSession: function (b) {
            Cache.editing_session = b ? JSON.parse(JSON.stringify(b)) : null
        },
        isEditingActiveSession: function () {
            var b = Cache.active_session;
            return !(!b || !Cache.editing_session || b.sid != Cache.editing_session.sid)
        },
        addSessions: function (b) {
            for (var e in b) Cache.smap[e] = b[e];
            Cache.setSessions(Cache.smap, Cache.mstr)
        },
        clear: function () {
            Cache.active_session = null;
            Cache.active_session_sid = null;
            Cache.mstr = null;
            Cache.smap = {}
        },
        removeSessions: function (b) {
            for (var e in b) delete Cache.smap[e];
            Cache.setSessions(Cache.smap,
                Cache.mstr)
        },
        setSessions: function (b, e) {
            Cache.smap = b || {};
            Cache.mstr = e || null
        },
        updateSessions: function (b) {
            for (var e in b) Cache.smap[e] && (Cache.smap[e] = b[e]);
            Cache.setSessions(Cache.smap, Cache.mstr)
        },
        mstr: null,
        smap: {}
    };
var Edits = {
    initialize: function () {
        $(".context-action").click(function (b) {
            switch ($(this).attr("id")) {
                case "add-session":
                    Edits.addSession(!1);
                    break;
                case "delete-sessions":
                    Edits.deleteSelectedSessions();
                    break;
                case "edit-sessions":
                    Edits.beginEditingSelectedSession();
                    break;
                case "join-sessions":
                    Edits.joinSelectedSessions();
                    break;
                case "zero-sessions":
                    Edits.zeroOutSelectedSessions();
                    break;
                case "add-tasks-item":
                    var e = Selection.selectedSids();
                    e.length ? Edits.Tasks.editTasksForSession(Cache.getSession(e[e.length -
                        1]), null, null, !0, !1) : Edits.addSession(!0);
                    break;
                case "edit-tasks-item":
                    b = Selection.selectedTaskTypes()[0];
                    b = $('#tasks-table tr[data-tasktype="' + b + '"]:visible').eq(0);
                    b.length && b.dblclick();
                    break;
                case "delete-tasks-item":
                    b = Selection.selectedTaskTypes()[0];
                    e = Selection.selectedSids();
                    e.length ? (e = Cache.getSession(e[e.length - 1]), Edits.Tasks.deleteTasksForSession(e, [b])) : (e = Cache.getSessionsWithTaskType(b), Edits.Tasks.deleteTasksForSession(e[e.length - 1], [b]));
                    break;
                case "zero-tasks-item":
                    Edits.Tasks.zeroOutSelectedTasks()
            }
        });
        $("#add-tasks-menu-item").mouseup(function () {
            $(this).is(".dropdown-disabled") || $("#add-tasks-item").click()
        });
        $("#edit-tasks-menu-item").mouseup(function () {
            $(this).is(".dropdown-disabled") || $("#edit-tasks-item").click()
        });
        $("#delete-tasks-menu-item").mouseup(function () {
            $(this).is(".dropdown-disabled") || $("#delete-tasks-item").click()
        });
        $("#zero-tasks-menu-item").mouseup(function () {
            $(this).is(".dropdown-disabled") || $("#zero-tasks-item").click()
        });
        $.datetimeEntry.setDefaults({
            spinnerImage: "",
            tabToExit: !0
        });
        String.prototype.capitalize = function () {
            var b = this.replace(/(?:^|\s)\S/g, function (b) {
                    return b.toUpperCase()
                }),
                b = b.replace("Ipad", "iPad"),
                b = b.replace("Iphone", "iPhone"),
                b = b.replace(" And ", " and "),
                b = b.replace(" An ", " an ");
            return b = b.replace(" A ", " a ")
        }
    },
    displayError: function (b, e) {
        Utils.showGenericPrompt({
            title: "Could Not Save Changes",
            message: b || DEFAULT_ERROR_MSG,
            buttons: [{
                text: "OK",
                width: 100,
                click: function () {
                    $(this).dialog("close");
                    e && e()
                }
            }]
        })
    },
    setOKButtonTitle: function (b) {
        $(".ui-dialog-buttonset:visible").find("span").last().text(b ||
            "OK")
    },
    addSession: function (b) {
        var e = Prefs.get("last-added-session-pid") || 0;
        chrome.runtime.sendMessage({
            method: "get-new-session",
            projectId: e
        }, function (f) {
            e && (f.session.name = Utils.Projects.nameForSession(f.session));
            Edits.beginEditingSession(f.session, "user-added-session");
            b && Edits.Tasks.editTasksForSession(f.session, null, null, !0, !0)
        })
    },
    adjustSessionTimesBasedOnTaskDuration: function (b) {
        var e = 0,
            f;
        for (f in b.types) e += b.types[f][2];
        e = moment.duration(e);
        e = Math.round(e.asMinutes());
        b.start = b.stop - 6E4 * e
    },
    beginEditingSelectedSession: function () {
        var b = $("#sessions-table tr.tr-selected:visible").eq(0).attr(SESSION_SID);
        (b = Cache.getSession(b)) && Edits.beginEditingSession(b)
    },
    beginEditingSession: function (b, e) {
        function f(b, e) {
            var f = l();
            if (Object.keys(f).length || e) {
                var g = Cache.getEditingSession(),
                    k = Cache.copySessionsMap(Cache.sessionsMapWithSession(g)),
                    m;
                for (m in f)
                    if ("name" == m) {
                        if (64 < f[m].length) {
                            b && b(null, "Session name cannot be longer than 64 characters.");
                            return
                        }
                        g[m] = f[m]
                    } else if ("start" == m) {
                    var n = moment(f.stop ||
                            g.stop),
                        w = moment(f[m]);
                    if (0 > n.diff(w, "minutes")) {
                        b && b(null, "A session's start time must come before its stop time.");
                        return
                    }
                    g[m] = f[m]
                } else if ("stop" == m) {
                    w = moment(f.start || g.start);
                    n = moment(f[m]);
                    if (0 > n.diff(w, "minutes")) {
                        b && b(null, "A session's stop time must come after its start time.");
                        return
                    }
                    g[m] = f[m]
                } else if ("note" == m) {
                    if (320 < f[m].length) {
                        b && b(null, "Notes cannot be longer than 320 characters.");
                        return
                    }
                    g.note = f[m] || null
                } else "project" == m && (f[m] ? g.pid = f[m] : delete g.pid);
                Prefs.set("last-added-session-pid",
                    g.pid || 0);
                var q = Cache.sessionsMapWithSession(g);
                h.attr(USER_ADDED_SESSION) ? Edits.insertSessionsMap(q, k, function () {
                    Undo.registerAction("Add Session", "add-session", q)
                }, {
                    hsessions: q
                }) : Edits.updateSessionsMap(q, k, function (b) {
                    b.error ? Edits.displayError(b.error) : Undo.registerAction("Edit Session", "edit-sessions", {
                        sessions: k
                    })
                }, {
                    hsessions: q
                })
            }
            p(null);
            u(!1);
            b && b(f)
        }

        function g(b, e) {
            var f = "user-added-session" === e ? "1" : "";
            h.attr(SESSION_SID, b.sid);
            h.attr(USER_ADDED_SESSION, f);
            h.dialog("option", "title", f ? "Add Session" :
                'Edit "' + b.name + '"');
            $("#session-name").val(b.name);
            var g = 0,
                m;
            for (m in b.types) g += b.types[m][0];
            h.find("#total-session-task-count").text(Utils.numberWithCommas(g));
            g = [new Date(b.start), new Date(b.stop)];
            h.find("input.start").datetimeEntry("setDatetime", g[0]);
            h.find("input.stop").datetimeEntry("setDatetime", g[1]);
            g[0].getTime();
            g[1].getTime();
            k({
                allotted: b.allotted,
                duration: b.duration,
                earnings: b.earnings,
                surplus: b.surplus
            }, !0);
            p(null);
            u(!1);
            g = b.note || "";
            g = $("#session-note").val(g);
            g.scrollTop(g.get(0).scrollHeight);
            Cache.setEditingSession(b);
            g = Cache.isEditingActiveSession();
            $("#session-name").prop("disabled", g);
            $("#edit-dialog ul.stop").toggleClass("disabled", g);
            $("#edit-dialog input.stop").prop("disabled", g);
            f ? ($("#add-reminder").show(), $("#edit-reminder").hide()) : ($("#edit-reminder").show(), $("#add-reminder").hide());
            f = 1 == Prefs.get("session-timing-mode") ? 0 : -3E4;
            $("#zero-button").toggleClass("ui-state-disabled", b.surplus >= f);
            f = b.pid || 0;
            $("#session-project").val(f);
            $("#session-project-container").toggle("lionbridge" !=
                Prefs.get("user-vendor") || 0 != f)
        }

        function k(b, e) {
            h.find("#total-session-duration").val(Utils.formattedTime(b.duration, !1));
            h.find("#total-session-earnings").val(b.earnings / 1E3 * Options.currentExchangeRate());
            h.find("#total-session-earnings").formatCurrency({
                region: Options.currentRegion()
            });
            var f = h.find("#total-session-speed");
            "speed" == Prefs.get("session-productivity-mode") ? (f.val(Utils.speedFromValues(b.allotted, b.duration) + "%"), f.prev().text("Speed")) : (f.val(Utils.formattedTime(b.surplus)), f.prev().text("Surplus"));
            f.css("color", Utils.colorFromValues(b.allotted, b.duration))
        }
        var h = $("#edit-dialog");
        if (Cache.activeSessionId() === b.sid) return Utils.showGenericPrompt({
            title: "Could Not Edit Session",
            message: "End the active session to edit it.",
            buttons: [{
                text: "OK",
                width: 100,
                click: function () {
                    $(this).dialog("close")
                }
            }]
        }), !1;
        var l = function () {
                return JSON.parse(h.attr("data-changes")) || {}
            },
            n = function (b) {
                return "undefined" !== typeof b ? !!l()[b] : !!Object.keys(l()).length
            },
            p = function (b) {
                var e = "";
                if (b) {
                    var e = l(),
                        f;
                    for (f in b) null ===
                        b[f] || "undefined" === typeof b[f] ? delete e[f] : e[f] = b[f]
                }
                h.attr("data-changes", JSON.stringify(e))
            },
            m = function (b) {
                var e = Cache.getEditingSession(),
                    f = $(b.target);
                b = f.attr("name");
                var g = !!h.attr(USER_ADDED_SESSION),
                    m = parseInt($("#session-project").val(), 10) || 0;
                if ("note" == b)(b = r()) || e.note || (b = null), p({
                    note: b === e.note ? null : b
                });
                else if ("name" == b) b = $.trim(f.val()), p({
                    name: b && b !== e.name ? b : null
                });
                else if ("start" == b || "stop" == b || "ampm" == b || "project" == b) {
                    var l = q(),
                        f = {};
                    f[e.sid] = JSON.parse(JSON.stringify(e));
                    f[e.sid].start =
                        l[0];
                    f[e.sid].stop = l[1];
                    f[e.sid].pid = m;
                    chrome.runtime.sendMessage({
                        method: "get-transient-session-values",
                        sessions: f
                    }, function (b) {
                        p({
                            start: l[0] === e.start ? null : l[0],
                            stop: l[1] === e.stop ? null : l[1],
                            project: m === (e.pid || 0) ? null : m
                        });
                        k(b.result[e.sid]);
                        u(n() && !g)
                    });
                    "project" == b && (b = 0 != m ? Utils.Projects.nameForPid(m) : "", $("#session-note").val(b), p({
                        note: b === (e.note || "") ? null : b
                    }), e.pid = m, b = Utils.Projects.nameForSession(e), b != e.name && ($("#session-name").val(b), p({
                        name: b
                    })));
                    return
                }
                u(n() && !g)
            },
            q = function (b) {
                var e =
                    Cache.getEditingSession();
                b = moment(e.start);
                var f = moment(e.stop),
                    e = ($("#start-time-date").val() + " " + b.year() + " " + $("#start-time-hour").val() + ":" + $("#start-time-minute").val() + ":" + b.seconds() + " " + $("#start-time-ampm").val()).substr(5),
                    e = moment(e, "MMM D YYYY h:mm:ss a"); - 6 > e.diff(b, "months") ? e.year(1 + e.year()) : 6 < e.diff(b, "months") && e.year(e.year() - 1);
                b = ($("#start-time-date").val() + " " + e.year() + " " + $("#stop-time-hour").val() + ":" + $("#stop-time-minute").val() + ":" + f.seconds() + " " + $("#stop-time-ampm").val()).substr(5);
                b = moment(b, "MMM D YYYY h:mm:ss a");
                b.date(e.date()); - 12 >= b.diff(e, "hours") && b.add(1, "d");
                return [e.valueOf(), b.valueOf()]
            },
            w = function (b) {
                var e;
                e = "input.start, input.stop";
                b ? h.find(e).bind("change", m) : h.find(e).unbind("change", m);
                e = "#session-name, #session-note, #stop-time-ampm, #start-time-ampm";
                b ? h.find(e).bind("input", m) : h.find(e).unbind("input", m);
                e = "#session-project";
                b ? h.find(e).bind("change", m) : h.find(e).unbind("change", m)
            },
            u = function (b) {
                if (b != !!h.attr("data-edited")) {
                    var e = Cache.getEditingSession();
                    e && h.dialog("option", "title", (b ? "Edited " : "Edit") + ' "' + e.name + '"');
                    h.attr("data-edited", b ? "true" : "")
                }
            },
            r = function () {
                return $.trim($("#session-note").val())
            };
        h.is(":visible") ? g(b) : h.dialog({
            modal: !0,
            resizable: !1,
            width: 432,
            height: "auto",
            title: "Edit Session",
            dialogClass: "no-close",
            resizable: !1,
            buttons: [{
                    text: "Add Tasks...",
                    width: "160",
                    click: function () {
                        f(function () {
                            Edits.Tasks.editTasksForSession(Cache.getEditingSession(), null, h, !0, !1)
                        })
                    }
                }, {
                    text: "Cancel",
                    width: "90",
                    click: function () {
                        $(this).dialog("close")
                    }
                },
                {
                    text: "OK",
                    width: "90",
                    click: function () {
                        var b = Cache.getEditingSession() && !!h.attr(USER_ADDED_SESSION);
                        f(function (b, e) {
                            e ? Edits.displayError(e) : h.dialog("close")
                        }, b)
                    }
                }
            ],
            create: function () {
                $("#start-time-date").datetimeEntry({
                    datetimeFormat: "w, n d"
                });
                $("#start-time-hour").datetimeEntry({
                    datetimeFormat: "h",
                    spinnerImage: "",
                    ampmNames: ["", ""]
                });
                $("#start-time-minute").datetimeEntry({
                    datetimeFormat: "M"
                });
                $("#start-time-ampm").datetimeEntry({
                    datetimeFormat: "a"
                });
                $("#stop-time-hour").datetimeEntry({
                    datetimeFormat: "h",
                    spinnerImage: "",
                    ampmNames: ["", ""]
                });
                $("#stop-time-minute").datetimeEntry({
                    datetimeFormat: "M"
                });
                $("#stop-time-ampm").datetimeEntry({
                    datetimeFormat: "a"
                });
                $("#edit-dialog .date, .time").mousedown(function (b) {
                    $(this).select();
                    return !1
                });
                $("#edit-dialog").click(function (b) {
                    b = $(b.target).prop("tagName");
                    "TD" != b && "DIV" != b || $("#edit-dialog input").blur()
                });
                $("li.stepper").mousedown(function (b) {
                    if (!$(this).is(".ui-state-disabled")) {
                        var e = $("input:focus");
                        e.length && (e.hasClass("time") || e.hasClass("date")) ||
                            (b = $("#stop-time-minute"), e = b.is(":disabled") ? $("#start-time-minute") : b);
                        b = $.Event("keydown");
                        b.keyCode = $(this).index() ? 38 : 40;
                        e.select();
                        e.trigger(b);
                        return !1
                    }
                });
                $("#zero-button").mousedown(function () {
                    if (!$(this).is(".ui-state-disabled")) return Edits.zeroOutSelectedSessions(), !1
                });
                $("#session-note").keydown(function (b) {
                    if (13 == b.which && (b.metaKey || b.ctrlKey || !r())) return $(".ui-dialog-buttonset:visible").children(":last").click(), !1
                });
                h.find("input").keydown(function (b) {
                    if (13 == b.which) return $(".ui-dialog-buttonset:visible").children(":last").click(),
                        !1
                })
            },
            open: function () {
                $(".ui-widget-overlay.ui-front").click(function () {
                    h.dialog("close")
                });
                $(".ui-dialog-buttonset:visible").children(":first").css("position", "absolute").css("left", "22px");
                g(b, e);
                w(!0);
                if ("user-added-session" !== e) {
                    var f = e && e.prop("tagName");
                    if ("TD" == f) switch (e.index()) {
                        case 0:
                            $("#start-time-date").select();
                            break;
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                            $("#stop-time-minute").select();
                            break;
                        case 2:
                            $("#start-time-minute").select()
                    } else "SPAN" == f && 0 == e.index() ? $("#session-name:not(:disabled)").select() :
                        (f = $("#session-note").get(0), f.setSelectionRange(f.value.length, f.value.length), f.focus())
                } else $("#start-time-date").select();
                var f = "speed" == Prefs.get("session-productivity-mode"),
                    m = $("#total-session-surplus-cell");
                f ? m.hide() : m.show();
                m = $("#total-session-speed-cell");
                f ? m.show() : m.hide()
            },
            close: function () {
                Cache.setEditingSession(null);
                w(!1);
                p(null);
                u(!1)
            }
        })
    },
    deleteSelectedSessions: function () {
        var b = Cache.mapOfSelectedSessions();
        Cache.activeSessionId() && delete b[Cache.activeSessionId()];
        b = Object.keys(b).length;
        if (!b) return !1;
        var e = 1 == b ? "" : "s";
        Utils.showGenericPrompt({
            title: "Delete Session" + e + "?",
            message: "Are you sure you want to delete " + (1 == b ? "this" : "these " + b) + "  sesson" + e + "?",
            width: "auto",
            buttons: [{
                text: "Cancel",
                width: 180,
                click: function () {
                    $(this).dialog("close")
                }
            }, {
                text: "Delete Session" + e,
                width: 180,
                click: function () {
                    f();
                    $(this).dialog("close")
                }
            }],
            open: function () {
                $(".ui-dialog-buttonset:visible").children(":last").focus()
            }
        });
        var f = function () {
            var b = Cache.mapOfSelectedSessions();
            Edits.deleteSessionsMap(b,
                function () {
                    var e = 1 == Object.keys(b).length ? "" : "s";
                    Undo.registerAction("Delete Session" + e, "delete-sessions", b)
                })
        }
    },
    joinSelectedSessions: function () {
        function b() {
            var b = Cache.getSessions(Selection.selectedSids()),
                f = b[0],
                b = b[1],
                g = Cache.activeSessionId();
            if (g === f.sid || g == b.sid) console.log("Error: Cannot join an active session");
            else {
                var g = Cache.sessionsMapWithSession(f),
                    k = Cache.sessionsMapWithSession(b),
                    h = Cache.copySessionsMap({
                        s1map: g,
                        s2map: k
                    });
                f.start = Math.min(f.start, b.start);
                f.stop = Math.max(f.stop, b.stop);
                f.allotted += b.allotted;
                f.task = null;
                for (var l in b.types) f.types[l] ? (f.types[l][0] += b.types[l][0], f.types[l][1] += b.types[l][1], f.types[l][2] += b.types[l][2]) : f.types[l] = b.types[l];
                Edits.joinSessionsMaps(g, k, function (b) {
                    b.error ? Edits.displayError(b.error) : Undo.registerAction("Join Sessions", "join-sessions", h)
                })
            }
        }
        Utils.showGenericPrompt({
            title: "Join Sesions?",
            message: "Are you sure you want to join these two sessions? They will be combined into a single session.",
            buttons: [{
                    text: "Cancel",
                    width: 120,
                    click: function () {
                        $(this).dialog("close")
                    }
                },
                {
                    text: "Join",
                    width: 120,
                    click: function () {
                        b();
                        $(this).dialog("close")
                    }
                }
            ],
            open: function () {
                $(".ui-dialog-buttonset:visible").children(":last").focus()
            }
        })
    },
    zeroOutSelectedSessions: function () {
        Cache.mapOfSelectedSessions(!0);
        1 == Prefs.get("session-timing-mode") ? Edits.zeroOutSelectedLionbridgeSessions() : Edits.zeroOutSelectedLeapforceSessions()
    },
    zeroOutSelectedLeapforceSessions: function () {
        var b = Cache.mapOfSelectedSessions(!0),
            e = Cache.copySessionsMap(b),
            f;
        for (f in e) {
            var g = e[f]; - 3E4 <= g.surplus ? (delete e[f],
                delete b[f]) : g.stop += 6E4 * Math.floor(g.surplus / 6E4)
        }
        if (f = Object.keys(e).length) {
            Utils.showGenericPrompt({
                title: "Zero Out Session" + (1 == f ? "" : "s") + "?",
                message: 1 == f ? "Are you sure you want to remove time from this session to bring its speed up to 100%?" : "Are you sure you want to remove time from this group of sessions to bring their total speed up to 100%?",
                width: "auto",
                buttons: [{
                    text: "Cancel",
                    width: 180,
                    click: function () {
                        $(this).dialog("close")
                    }
                }, {
                    text: "Zero Out",
                    width: 180,
                    click: function () {
                        k();
                        $(this).dialog("close")
                    }
                }],
                open: function () {
                    $(".ui-dialog-buttonset:visible").children(":last").focus()
                }
            });
            var k = function () {
                Edits.updateSessionsMap(e, b, function (e) {
                    e.error ? Edits.displayError(e.error) : (e = 1 == Object.keys(b).length ? "" : "s", Undo.registerAction("Zero Out Session" + e, "edit-sessions", {
                        sessions: b
                    }))
                }, {
                    hsessions: e,
                    reedit: !0
                })
            }
        } else console.log("No sessions were selected")
    },
    zeroOutSelectedLionbridgeSessions: function () {
        function b() {
            h.sort(function (b, e) {
                return b.surplus != e.surplus ? b.surplus < e.surplus ? -1 : 1 : 0
            });
            $.each(h, function (b,
                e) {
                var f = Math.abs(e.surplus);
                if (0 >= f || null !== l && 0 >= l) return !1;
                var g = [];
                $.each(e.types, function (b, e) {
                    var f = e[1] - e[2];
                    0 > f && g.push([b, f])
                });
                g.sort(function (b, e) {
                    return b[1] != e[1] ? b[1] < e[1] ? -1 : 1 : 0
                });
                $.each(g, function (b, g) {
                    if (0 >= f || null !== l && 0 >= l) return !1;
                    var h = Math.abs(g[1]),
                        h = Math.min(f, h);
                    null !== l && (h = Math.min(l, h));
                    if (0 >= h) return !1;
                    e.types[g[0]][2] -= h;
                    f -= h;
                    null !== l && (l -= h)
                })
            });
            null !== l ? Utils.showGenericPrompt({
                title: "Zero Out Session" + (1 == k ? "" : "s") + "?",
                message: 1 == k ? "Are you sure you want to remove time from this session to bring its speed up to 100%?" : "Are you sure you want to remove time from this group of sessions to bring their total speed up to 100%?",
                width: "auto",
                buttons: [{
                    text: "Cancel",
                    width: 180,
                    click: function () {
                        $(this).dialog("close")
                    }
                }, {
                    text: "Zero Out",
                    width: 180,
                    click: function () {
                        e();
                        $(this).dialog("close")
                    }
                }],
                open: function () {
                    $(".ui-dialog-buttonset:visible").children(":last").focus()
                }
            }) : e()
        }

        function e() {
            Edits.updateSessionsMap(g, f, function (b) {
                b.error ? Edits.displayError(b.error) : (b = 1 == Object.keys(f).length ? "" : "s", Undo.registerAction("Zero Out Session" +
                    b, "edit-sessions", {
                        sessions: f
                    }))
            }, {
                hsessions: g,
                reedit: !0
            })
        }
        var f = Cache.mapOfSelectedSessions(!0),
            g = Cache.copySessionsMap(f),
            k = Object.keys(g).length;
        if (k) {
            var h = [],
                l = 0;
            $.each(g, function (b, e) {
                l -= e.surplus;
                0 > e.surplus && h.push(e)
            });
            0 >= l ? Utils.showGenericPrompt({
                title: "Zero Out Sessions?",
                message: "Are you sure you want to remove time from these sessions to bring their individual speeds up to 100%? Their combined speeds are already over 100%.",
                width: 540,
                buttons: [{
                        text: "Cancel",
                        width: 200,
                        click: function () {
                            $(this).dialog("close")
                        }
                    },
                    {
                        text: "Zero Out",
                        width: 200,
                        click: function () {
                            $(this).dialog("close");
                            l = null;
                            b()
                        }
                    }
                ]
            }) : b()
        } else console.log("No sessions were selected")
    },
    Tasks: {
        deleteTasksForSession: function (b, e) {
            var f = e.length;
            if (f) {
                e[0].split(",");
                f = 1 < f ? "these " + f + " task types" : Utils.fullNameForTaskType(e[0]);
                Utils.showGenericPrompt({
                    title: "Delete Tasks?",
                    message: "Are you sure you want to delete " + f + "?",
                    width: "auto",
                    buttons: [{
                        text: "Cancel",
                        width: 120,
                        click: function () {
                            $(this).dialog("close")
                        }
                    }, {
                        text: "Delete",
                        width: 120,
                        click: function () {
                            g();
                            $(this).dialog("close")
                        }
                    }],
                    open: function () {
                        $(".ui-dialog-buttonset:visible").children(":last").focus()
                    }
                });
                var g = function () {
                    for (var f = Cache.sessionsMapWithSession(b), g = Cache.copySessionsMap(f), l = 0; l < e.length; l++) delete b.types[e[l]];
                    Edits.updateSessionsMap(f, g, function (b) {
                        Undo.registerAction("Delete Tasks", "edit-sessions", {
                            sessions: g,
                            types: e
                        })
                    }, {
                        hsessions: f,
                        rename: !0
                    })
                }
            }
        },
        editTasksForSession: function (b, e, f, g, k) {
            function h(b) {
                b = parseInt(b.trim(), 10);
                return isNaN(b) ? 0 : b
            }

            function l(b) {
                b = b.trim();
                b = b.capitalize(0,
                    1).replace(/\.|,|`|#|\$|\/|\[|\]/g, "_");
                b = b.replace(/exp/ig, "EXP");
                b = b.replace(/sxs/ig, "SxS");
                b = b.replace(/rev/ig, "REV");
                return b = b.replace(/rr/ig, "RR")
            }

            function n(b, e, f) {
                if (!b || !e) return null;
                b = l(b) + "," + e;
                f && (b += "," + f);
                return b
            }

            function p(b) {
                if (-1 != b.indexOf(":")) {
                    var e = b.split(":");
                    if (2 < e.length) {
                        b = parseInt(e[0], 10);
                        var f = parseInt(e[1] || 0, 10),
                            e = parseInt(e[2], 10);
                        if (!isNaN(b) && !isNaN(f) && !isNaN(e)) return 3600 * b + 60 * f + e
                    } else if (1 < e.length && (f = parseInt(e[0] || 0, 10), e = parseInt(e[1], 10), !isNaN(f) && !isNaN(e))) return 60 *
                        f + e
                } else if (b = parseFloat(b), !isNaN(b)) return 15 < b ? Math.floor(b) : Math.floor(60 * b);
                return 0
            }

            function m(b) {
                var e = h($("#task-type-count").val()),
                    m = p($("#task-type-aet").val()),
                    l = e * m * 1E3,
                    y = parseInt($("#task-type-device").val(), 10),
                    v = n($("#task-type-name").val(), m, y),
                    x = $("#task-type-duration").val().trim(),
                    C = 1E3 * p(x);
                if (v)
                    if (0 >= e) Edits.displayError("The task count must be greater than zero.", function () {
                        $("#task-type-count").select();
                        b && b(null)
                    });
                    else if (0 >= l) Edits.displayError("The AET must be greater than zero.",
                    function () {
                        $("#task-type-aet").select();
                        b && b(null)
                    });
                else if (3600 <= m) Edits.displayError("The AET must be less than one hour.", function () {
                    $("#task-type-aet").select();
                    b && b(null)
                });
                else if (x && 0 >= C) Edits.displayError("The duration must be greater than zero.", function () {
                    $("#task-type-duration").select();
                    b && b(null)
                });
                else {
                    var A = Cache.getEditingSession(),
                        m = Cache.copySessionsMap(A.types),
                        x = q.attr(TASK_TYPE),
                        B = {},
                        F = {};
                    if (x && x === v) {
                        var D = m[x];
                        if (!D) {
                            b && b(null, "Type not found");
                            return
                        }
                        D[0] = e;
                        D[1] = l;
                        D[2] = C;
                        F[x] = "1"
                    } else D = m[v] || [0, 0, 0], D[0] += e, D[1] += l, D[2] += C, x && (F[x] = "1");
                    B[v] = D;
                    for (var G in F) delete m[G];
                    for (G in B) m[G] = B[G];
                    if (JSON.stringify(A.types) != JSON.stringify(m)) {
                        var e = Cache.sessionsMapWithSession(A),
                            H = Cache.copySessionsMap(Cache.sessionsMapWithSession(A));
                        A.types = m;
                        g && Edits.adjustSessionTimesBasedOnTaskDuration(A);
                        if (!A.note || Utils.isDeviceNote(A.note)) A.note = Utils.noteForDeviceId(y);
                        (k ? Edits.insertSessionsMap : Edits.updateSessionsMap)(e, H, function (e) {
                            e.error ? (Edits.displayError(e.error),
                                b && b(null)) : (Undo.registerAction("Edit Tasks", "edit-sessions", {
                                sessions: H,
                                types: Object.keys(B),
                                itypes: Object.keys(F)
                            }), b && b(A), k ? Edits.beginEditingSession(A, "user-added-session") : f && "edit-dialog" == f.attr("id") && Edits.beginEditingSession(A))
                        }, {
                            rename: !0,
                            hsessions: e,
                            htypes: Object.keys(B)
                        })
                    } else b && b(A);
                    v && 0 == (A.pid || 0) && Prefs.set("last-added-task-type", v)
                } else Edits.displayError("The task type or AET is invalid.", function () {
                    $("#task-type-name").select();
                    b && b(null)
                })
            }
            if (b.sid == Cache.activeSessionId()) Utils.showGenericPrompt({
                title: "Could Not Edit Tasks",
                message: "End the active session to edit its tasks.",
                buttons: [{
                    text: "OK",
                    width: 100,
                    click: function () {
                        $(this).dialog("close")
                    }
                }]
            });
            else {
                var q = $("#add-tasks-dialog");
                Cache.setEditingSession(b);
                q.dialog({
                    modal: !0,
                    width: 360,
                    height: "auto",
                    title: "Add Tasks",
                    dialogClass: "no-close",
                    resizable: !1,
                    buttons: [{
                        text: "Cancel",
                        width: "90",
                        click: function () {
                            $(this).dialog("close")
                        }
                    }, {
                        text: "OK",
                        width: "90",
                        click: function () {
                            m(function (b) {
                                b && q.dialog("close")
                            })
                        }
                    }],
                    create: function () {
                        q.find("input").keydown(function (b) {
                            if (13 ==
                                b.which) return $(".ui-dialog-buttonset:visible").children(":last").click(), !1
                        });
                        $("#task-type-nickname").prop("disabled", !0);
                        $("#task-type-count, #task-type-aet").on("input", function () {
                            var b = h($("#task-type-count").val()),
                                e = 1E3 * p($("#task-type-aet").val());
                            if (b && e) {
                                if (!q.attr(TASK_TYPE)) {
                                    var f = b * e;
                                    $("#task-type-duration").val(Utils.formattedTime(f))
                                }
                                $("#task-type-total-aet").val(Utils.formattedTime(b * e))
                            }
                        });
                        $("#task-type-name").on("blur", function () {
                            $(this).val(l($(this).val()))
                        })
                    },
                    open: function () {
                        function m(e) {
                            switch (b.pid) {
                                case 4:
                                    return "Group Eval,20";
                                case 3:
                                    return "Souvenir Eval,1200";
                                case 2:
                                    return "Ad Rating,180";
                                default:
                                    return null
                            }
                        }
                        $(".ui-widget-overlay.ui-front").click(function () {
                            q.dialog("close")
                        });
                        var h = Prefs.get("last-added-task-type");
                        (function (b, e) {
                            var f = 0;
                            e = e || "";
                            var k = 0,
                                l = 0,
                                n = b && e && b.types[e];
                            n ? (f = n[0], k = 1E3 * (e.split(",")[1] || 0), l = n[2], q.attr(TASK_TYPE, e), q.dialog("option", "title", 'Edit Tasks for "' + b.name + '"')) : g && ((n = m(b.pid || 0)) ? (e = n, f = 0, k = k = 1E3 * (e.split(",")[1] || 0)) : h && (e = h, f = 0, k = k = 1E3 * (e.split(",")[1] || 0)), q.attr(TASK_TYPE, ""), q.dialog("option",
                                "title", 'Add Tasks to "' + b.name + '"'));
                            q.attr(SESSION_SID, b.sid);
                            $("#task-type-count").val(f ? Utils.numberWithCommas(f) : "0");
                            $("#task-type-name").val(e.split(",")[0]);
                            $("#task-type-aet").val(Utils.formattedTime(k));
                            $("#task-type-total-aet").val(Utils.formattedTime(f * k));
                            $("#task-type-duration").val(Utils.formattedTime(l));
                            $("#task-type-device").val(Utils.deviceIdForTypeStr(e))
                        })(b, e);
                        if (f && "TD" == f.prop("tagName")) switch (f.index()) {
                            case 0:
                                $("#task-type-count").select();
                                break;
                            case 1:
                                $("#task-type-name").select();
                                break;
                            case 2:
                            case 3:
                                $("#task-type-aet").select();
                                break;
                            case 4:
                            case 5:
                                $("#task-type-duration").select();
                                break;
                            default:
                                $(":focus").blur()
                        } else f && "SPAN" == f.prop("tagName") ? $("#task-type-name").select() : $("#task-type-count").select()
                    }
                })
            }
        },
        zeroOutSelectedTasks: function () {
            function b() {
                var b = Cache.getActionableSessions(!0),
                    f = {};
                $('#tasks-table tr.tr-selected:visible[data-isnegative="true"]').each(function () {
                    f[$(this).attr("data-tasktype")] = 1
                });
                for (var g = {}, k = 0; k < b.length; k++) {
                    var h = b[k],
                        l = h.types,
                        n = null,
                        p;
                    for (p in l)
                        if (f[p]) {
                            var m = l[p];
                            m[1] < m[2] && (n || (n = {}), n[p] = m.slice(0), n[p][2] = n[p][1])
                        } n && (h = JSON.parse(JSON.stringify(h)), $.extend(h.types, n), g[h.sid] = h)
                }
                if (Object.keys(g).length) {
                    var l = Object.keys(f),
                        q = Cache.getSessionsMapFromSmap(g);
                    Edits.updateSessionsMap(g, q, function (b) {
                        b.error ? Edits.displayError(b.error) : Undo.registerAction("Zero Out Tasks", "edit-sessions", {
                            sessions: q,
                            types: l,
                            noHighlightSessions: !0
                        })
                    }, {
                        hsessions: g,
                        htypes: l
                    })
                }
            }
            if (!Selection.selectedTaskTypes().length) return !1;
            Utils.showGenericPrompt({
                title: "Zero Out Tasks?",
                message: "Are you sure you want to remove time from these tasks to bring their speed up to 100%?",
                buttons: [{
                    text: "Cancel",
                    width: 180,
                    click: function () {
                        $(this).dialog("close")
                    }
                }, {
                    text: "Zero Out Tasks",
                    width: 180,
                    click: function () {
                        b();
                        $(this).dialog("close")
                    }
                }],
                open: function () {
                    $(".ui-dialog-buttonset:visible").children(":last").focus()
                }
            })
        }
    },
    deleteSessionsMap: function (b, e) {
        chrome.runtime.sendMessage({
            method: "modify-sessions",
            deletes: b
        }, function (b) {
            Tables.update({
                reason: "deleted session",
                callback: e,
                fetch: !0
            })
        })
    },
    insertSessionsMap: function (b, e, f, g) {
        g = g || {};
        chrome.runtime.sendMessage({
            method: "get-transient-session-values",
            sessions: b
        }, function (e) {
            e = e.result;
            for (var h in b)
                if (e[h])
                    for (j in e[h])
                        if ("name" != j || g.rename) b[h][j] = e[h][j];
            chrome.runtime.sendMessage({
                method: "modify-sessions",
                adds: b
            }, function (e) {
                Tables.update({
                    reason: "added session",
                    hsessions: b,
                    callback: f,
                    fetch: !0
                })
            })
        })
    },
    joinSessionsMaps: function (b, e, f, g) {
        g = g || {};
        Cache.copySessionsMap({
            s1map: b,
            s2map: e
        });
        chrome.runtime.sendMessage({
            method: "get-transient-session-values",
            sessions: b
        }, function (k) {
            k = k.result;
            var h = Cache.anySessionInSessionsMap(b),
                l;
            for (l in k[h.sid]) h[l] = k[h.sid][l];
            chrome.runtime.sendMessage({
                method: "modify-sessions",
                adds: b,
                deletes: e
            }, function () {
                Tables.update({
                    reason: "joined sessions",
                    hsessions: b,
                    noHighlight: g.noHighlight,
                    callback: f,
                    fetch: !0
                })
            })
        })
    },
    updateSessionsMap: function (b, e, f, g) {
        g = g || {};
        chrome.runtime.sendMessage({
            method: "get-transient-session-values",
            sessions: b
        }, function (k) {
            k = k.result;
            for (var h in b)
                if (k[h])
                    for (j in k[h])
                        if ("name" != j || g.rename) b[h][j] =
                            k[h][j];
            chrome.runtime.sendMessage({
                method: "modify-sessions",
                updates: b,
                initial: e
            }, function () {
                Tables.update({
                    reason: "updated session",
                    hsessions: g.hsessions,
                    htypes: g.htypes,
                    callback: f,
                    fetch: !0
                })
            });
            g.reedit && (h = Cache.getEditingSession()) && b[h.sid] && Edits.beginEditingSession(b[h.sid])
        })
    }
};
var SpinnerOpts = {
        lines: 13,
        length: 4,
        width: 2,
        radius: 5,
        corners: 0,
        rotate: 0,
        direction: 1,
        color: "#444",
        speed: 1,
        trail: 60,
        shadow: !1,
        hwaccel: !1,
        className: "filepicker-spinner",
        zIndex: 2E9,
        left: 140
    },
    Filepicker = {
        refresh: function () {
            function b(b) {
                function e(b) {
                    var f = [];
                    f.push(b.name);
                    b = moment(b.modifiedAt);
                    var g = moment().startOf("day"),
                        m = !!Prefs.get("use-24-hour-time");
                    24 <= b.diff(g, "hours") ? f.push(b.format(m ? "MMM D, YYYY, H:mm" : "MMM D, YYYY, h:mm A")) : f.push(b.fromNow());
                    return f
                }
                var f = Filepicker.selectedFilename(),
                    l = $("#filepicker-table");
                l.empty();
                for (var n = [], p = 0; p < b.length; p++)
                    if (!b[p].isFolder) {
                        var m = e(b[p]),
                            q = [],
                            w = $(document.createElement("td"));
                        w.text(m[0]);
                        var u = Filepicker.isFilenameValid(m[0]);
                        u || w.css("color", "lightgray");
                        q.push(w);
                        w = $(document.createElement("td"));
                        u || w.css("color", "lightgray");
                        w.text(m[1]);
                        q.push(w);
                        w = $(document.createElement("tr"));
                        w.append(q);
                        w.data("filename", m[0]);
                        n.push(w);
                        w.click(function () {
                            var b = $(this).data("filename"),
                                e = Filepicker.isFilenameValid(b);
                            Filepicker.setSelectedFilename(e ?
                                b : null);
                            $("#filepicker-outfilename").is(":visible") && e && ($("#filepicker-outfilename").val(b), Filepicker.setActionButtonEnabled(!0))
                        })
                    } n.length && l.append(n);
                l.find("td").unbind("dblclick").bind("dblclick", function () {
                    if (!Filepicker.selectedFilename()) return !1;
                    $(".ui-dialog-buttonset:visible").children(":last").click()
                });
                $("#filepicker-table-container").unbind("click").bind("click", function (b) {
                    b.target.id && Filepicker.setSelectedFilename(null)
                });
                f && !$("#filepicker-outfilename").is(":visible") && Filepicker.setSelectedFilename(f)
            }

            function e(b) {
                Utils.showGenericPrompt({
                    title: "Could Not Retrieve File List",
                    message: b,
                    buttons: [{
                        text: "OK",
                        width: 100,
                        click: function () {
                            $(this).dialog("close")
                        }
                    }]
                })
            }
            Filepicker.spinner.spin($(".ui-dialog-buttonpane:visible").eq(0).get(0));
            var f = (Prefs.get("user") || {})["dropbox-token"] || "";
            $.ajax({
                contentType: "application/json",
                data: JSON.stringify({
                    path: ""
                }),
                beforeSend: function (b) {
                    b.setRequestHeader("Authorization", "Bearer " + f)
                },
                url: "https://api.dropboxapi.com/2/files/list_folder",
                type: "POST",
                success: function (e) {
                    Filepicker.spinner.stop();
                    var f = [];
                    $.each(e.entries, function (b, e) {
                        if ("file" == e[".tag"]) {
                            var g = {};
                            g.name = e.name;
                            g.modifiedAt = e.server_modified;
                            f.push(g)
                        }
                    });
                    b(f)
                },
                error: function (b, f, h) {
                    Filepicker.spinner.stop();
                    e(h)
                }
            })
        },
        isFilenameValid: function (b) {
            if ($("#export-cell").is(":visible")) {
                var e = Prefs.get("export-format");
                switch (e) {
                    case "csv-sessions":
                    case "csv-tasks":
                        e = "csv";
                        break;
                    default:
                        e = "radata"
                }
            } else e = "radata";
            e = "." + e;
            return b.length > e.length && b.length - e.length == b.indexOf(e)
        },
        setActionButtonEnabled: function (b) {
            var e = $(".ui-dialog-buttonset:visible").children(":last");
            e.toggleClass("ui-button-disabled, ui-state-disabled", !b);
            e.attr("aria-disabled", !b);
            e.attr("disabled", !b)
        },
        selectedFilename: function () {
            return $("#filepicker-outfilename").is(":visible") ? $("#filepicker-outfilename").val() : $("#filepicker-table tr.tr-selected").data("filename") || null
        },
        setExportFormat: function (b) {
            if (b && 0 == b.indexOf("csv")) var e = Period.selectedMonthString(),
                e = e + (-1 != b.indexOf("tasks") ? "-Tasks" : "-Sessions"),
                f = "csv";
            else e = "Backup", f = "radata";
            e = e.replace(/-(\d)-/g, "-0$1-");
            $("#filepicker-outfilename").val(e +
                "." + f).focus();
            Utils.setCaretPosition("filepicker-outfilename", 0, e.length);
            Filepicker.setActionButtonEnabled(!0);
            $("#export-format").val(b || "radata");
            Filepicker.setSelectedFilename(null);
            Filepicker.updateValidFilenames()
        },
        setSelectedFilename: function (b) {
            var e = $("#filepicker-table"),
                f = null;
            e.find("tr").each(function () {
                b && b == $(this).data("filename") && (f = $(this))
            });
            e.find("tr").removeClass("tr-selected");
            if (f) {
                var g = f.data("filename");
                (e = Filepicker.isFilenameValid(g)) && f.addClass("tr-selected");
                Filepicker.setActionButtonEnabled(e)
            }
            $("#filepicker-infilename").text(f ?
                g : "*.radata");
            $("#filepicker-infilename").is(":visible") && !f && Filepicker.setActionButtonEnabled(!1)
        },
        showExporter: function () {
            function b() {
                var b = Filepicker.selectedFilename(),
                    g = $("#export-dialog").dialog({
                        title: "Exporting...",
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        dialogClass: "no-close dialog",
                        resizable: !1,
                        open: function () {
                            $("#export-progressbar").progressbar({
                                value: !1
                            });
                            $(this).find("p").eq(0).text('Exporting to "' + b + '"...');
                            var k = Prefs.get("export-format");
                            k && 0 == k.indexOf("csv") ? (3 > Period.highlightedIndex() &&
                                Period.highlightPeriod(3), "csv-tasks" == k && (Selection.setSessionSelection([]), Selection.setTaskTypeSelection([])), Tables.update({
                                    callback: function () {
                                        function h(b) {
                                            var e = b.split(":");
                                            b = 0 == b.indexOf("-");
                                            var f = e.length,
                                                g = 2 < f ? parseInt(e[f - 3], 10) : 0,
                                                m = parseInt(e[f - 2], 10),
                                                e = parseInt(e[f - 1], 10),
                                                g = Math.abs(g),
                                                m = Math.abs(m),
                                                e = Math.abs(e);
                                            return (b ? "-" : "") + (3600 * g + 60 * m + e).toString()
                                        }
                                        var l = [],
                                            n = [];
                                        if ("csv-tasks" == k) {
                                            $("#task-header-table .column-header-row td").each(function (b) {
                                                switch (b) {
                                                    case 2:
                                                    case 3:
                                                    case 4:
                                                    case 5:
                                                        b =
                                                            $(this).prop("title").replace("h:mm:ss", "s").replace("m:ss", "s");
                                                        l.push(b);
                                                        break;
                                                    default:
                                                        l.push($(this).text())
                                                }
                                            });
                                            var p = "surplus" == Prefs.get("task-productivity-mode");
                                            $("#tasks-table tr:visible").each(function (b) {
                                                var e = {};
                                                $(this).find("td").each(function (b) {
                                                    if (2 == b || 3 == b || 4 == b || 5 == b && p) {
                                                        var f = $(this).text().replace(",", "");
                                                        e[l[b]] = h(f)
                                                    } else e[l[b]] = $(this).text()
                                                });
                                                n.push(e)
                                            })
                                        } else {
                                            $("#session-header-table .column-header-row td").each(function (b) {
                                                switch (b) {
                                                    case 4:
                                                    case 5:
                                                    case 6:
                                                        b = $(this).prop("title").replace("h:mm:ss",
                                                            "s").replace("m:ss", "s");
                                                        l.push(b);
                                                        break;
                                                    default:
                                                        l.push($(this).text())
                                                }
                                            });
                                            var m = "speed" == Prefs.get("session-productivity-mode");
                                            $("#sessions-table tr:visible").each(function () {
                                                var b = {};
                                                $(this).find("td").each(function (e) {
                                                    if (4 == e || 5 == e && !m) var f = $(this).text().replace(",", ""),
                                                        f = h(f);
                                                    else f = 0 == e ? $(this).prop("title") : 1 == e ? $(this).find("span").eq(0).text() : $(this).text();
                                                    b[l[e]] = f
                                                });
                                                n.push(b)
                                            })
                                        }
                                        chrome.runtime.sendMessage({
                                            method: "export-csv",
                                            filename: b,
                                            values: n
                                        }, function (m) {
                                            g.dialog("close");
                                            if (m.error) Utils.showGenericPrompt({
                                                title: "Could Not Export File",
                                                message: m.error,
                                                buttons: [{
                                                    text: "OK",
                                                    width: 100,
                                                    click: function () {
                                                        $(this).dialog("close")
                                                    }
                                                }]
                                            });
                                            else {
                                                var h = "csv-tasks" == k ? "task type" : "session";
                                                m = "Exported " + Utils.numberWithCommas(m.count) + " " + h + (1 == m.count ? "" : "s") + ' to "' + b + '".';
                                                Utils.showGenericPrompt({
                                                    title: "Success!",
                                                    message: m,
                                                    buttons: [{
                                                        text: "OK",
                                                        width: 100,
                                                        click: function () {
                                                            $(this).dialog("close");
                                                            e.dialog("close")
                                                        }
                                                    }],
                                                    close: function () {
                                                        $("#filepicker-dialog").dialog("close")
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })) : chrome.runtime.sendMessage({
                                    method: "export-radata",
                                    filename: b
                                },
                                function (h) {
                                    g.dialog("close");
                                    h.error ? Utils.showGenericPrompt({
                                        title: "Could Not Export File",
                                        message: h.error,
                                        buttons: [{
                                            text: "OK",
                                            width: 100,
                                            click: function () {
                                                $(this).dialog("close")
                                            }
                                        }]
                                    }) : (h = "Exported " + Utils.numberWithCommas(h.count) + " session" + (1 == h.count ? "" : "s") + ' to "' + b + '".', Utils.showGenericPrompt({
                                        title: "Success!",
                                        message: h,
                                        buttons: [{
                                            text: "OK",
                                            width: 100,
                                            click: function () {
                                                $(this).dialog("close");
                                                e.dialog("close")
                                            }
                                        }],
                                        close: function () {
                                            $("#filepicker-dialog").dialog("close");
                                            Filepicker.refresh()
                                        }
                                    }))
                                })
                        }
                    })
            }
            var e = $("#filepicker-dialog");
            e.dialog({
                width: e.attr("data-width"),
                height: "auto",
                modal: !0,
                title: "Export Sessions",
                resizable: !1,
                buttons: [{
                    text: "Refresh",
                    width: 120,
                    click: function () {
                        Filepicker.refresh()
                    }
                }, {
                    text: "Cancel",
                    width: 120,
                    click: function () {
                        $(this).dialog("close")
                    }
                }, {
                    text: "Export",
                    width: 120,
                    click: function () {
                        b()
                    }
                }],
                create: function () {
                    $("#filepicker-outfilename").bind("input", function () {
                        Filepicker.setActionButtonEnabled(Filepicker.isFilenameValid($(this).val()))
                    });
                    $("#filepicker-outfilename").bind("keydown",
                        function (b) {
                            13 == b.which ? $(".ui-dialog-buttonset:visible").children(":last").click() : Filepicker.setActionButtonEnabled(Filepicker.isFilenameValid($(this).val()))
                        });
                    $("#export-format").change(function () {
                        var b = $("option:selected", this).val();
                        Prefs.set("export-format", b, function () {
                            Filepicker.setExportFormat(b)
                        })
                    })
                },
                open: function () {
                    var b = $(".ui-dialog-buttonset:visible").children(":first");
                    $(".ui-widget-overlay.ui-front").click(function () {
                        e.dialog("close")
                    });
                    b.css("position", "absolute");
                    b.css("left", "22px");
                    b = $(".ui-dialog-buttonpane:visible").get(0);
                    Filepicker.spinner ? Filepicker.spinner.spin(b) : Filepicker.spinner = (new Spinner(SpinnerOpts)).spin(b);
                    $("#import-cell").hide();
                    $("#export-cell").show();
                    Filepicker.refresh();
                    Filepicker.setExportFormat(Prefs.get("export-format"));
                    $("#export-format-container").show()
                }
            })
        },
        showImporter: function () {
            function b() {
                var b = Filepicker.selectedFilename();
                if (b) var g = $("#import-dialog").dialog({
                    title: "Importing...",
                    modal: !0,
                    width: "auto",
                    dialogClass: "no-close dialog",
                    resizable: !1,
                    open: function () {
                        $("#import-progressbar").progressbar({
                            value: !1
                        });
                        $(this).find("p").eq(0).text('Importing "' + b + '"...');
                        chrome.runtime.sendMessage({
                            method: "import-file",
                            filename: b
                        }, function (b) {
                            g.dialog("close");
                            b.error ? Utils.showGenericPrompt({
                                title: "Could Not Import File",
                                message: b.error,
                                buttons: [{
                                    text: "OK",
                                    width: 100,
                                    click: function () {
                                        $(this).dialog("close")
                                    }
                                }]
                            }) : (b = Utils.numberWithCommas(b.result.adds) + " session" + (1 == b.result.adds ? " was" : "s were") + " imported.", Utils.showGenericPrompt({
                                title: "Success!",
                                message: b,
                                buttons: [{
                                    text: "OK",
                                    width: 100,
                                    click: function () {
                                        $(this).dialog("close")
                                    }
                                }],
                                close: function () {
                                    e.dialog("close")
                                }
                            }), Cache.clear(), Tables.update({
                                reason: "finished import"
                            }))
                        })
                    }
                })
            }
            var e = $("#filepicker-dialog");
            e.dialog({
                width: e.attr("data-width"),
                height: "auto",
                modal: !0,
                title: "Import Sessions",
                resizable: !1,
                buttons: [{
                    text: "Refresh",
                    width: 120,
                    click: function () {
                        Filepicker.refresh()
                    }
                }, {
                    text: "Cancel",
                    width: 120,
                    click: function () {
                        $(this).dialog("close")
                    }
                }, {
                    text: "Import",
                    width: 120,
                    click: function () {
                        b()
                    }
                }],
                open: function () {
                    var b = $(".ui-dialog-buttonset:visible").children(":first");
                    $(".ui-widget-overlay.ui-front").click(function () {
                        e.dialog("close")
                    });
                    b.css("position", "absolute");
                    b.css("left", "22px");
                    b = $(".ui-dialog-buttonpane:visible").get(0);
                    Filepicker.spinner ? Filepicker.spinner.spin(b) : Filepicker.spinner = (new Spinner(SpinnerOpts)).spin(b);
                    $("#import-cell").show();
                    $("#export-cell").hide();
                    $("#export-format-container").hide();
                    Filepicker.setSelectedFilename(null);
                    Filepicker.setActionButtonEnabled(!1);
                    Filepicker.refresh()
                }
            })
        },
        updateValidFilenames: function () {
            $("#filepicker-table tr").each(function () {
                var b = $(this).find("td:first-child").text(),
                    b = Filepicker.isFilenameValid(b);
                $(this).find("td").css("color", b ? "black" : "lightgray")
            })
        },
        spinner: null
    };
$(document).on("click", "#filepicker-dialog td.dropbox-link", function () {
    window.open("https://www.dropbox.com/home/Apps/RaterAide")
});
var Period = {
    initialize: function () {
        $("#top-left-header td.period").click(function (b) {
            $(".dropdown:visible").length || $(b.target).is(".stepper, .stepcell") || (b = parseInt($(this).attr("data-value"), 10), 3 < b || (Period.highlightPeriod(b), $("#sessions-body-container, #tasks-body-container").removeClass("expanded"), Tables.scrollSessionsToBottom(), Period.setSelectedMonthString(Period.periodStringForIndex(b)), Tables.update({
                reason: "User changed period",
                scrollToBottom: !0
            })))
        });
        $("#right-month-stepper").click(function () {
            if (!$(".dropdown:visible").length &&
                !$(this).hasClass("disabled")) {
                var b = Prefs.get("month-counts") || {},
                    b = Object.keys(b).sort(function (b, e) {
                        var f = b.split("-"),
                            l = e.split("-");
                        return f[0] != l[0] ? parseInt(f[0], 10) < parseInt(l[0], 10) ? -1 : 1 : parseInt(f[1], 10) < parseInt(l[1], 10) ? -1 : 1
                    }),
                    f = Period.selectedMonthString();
                b.indexOf(f) < b.length - 1 && (f = Period.setSelectedMonthString(b[b.indexOf(f) + 1]), Period.highlightPeriod(4), Tables.update({
                    reason: "User changed period",
                    scrollToBottom: !0
                }))
            }
        });
        $("#left-month-stepper").click(function () {
            if (!$(".dropdown:visible").length &&
                !$(this).hasClass("disabled")) {
                var b = Prefs.get("month-counts") || {},
                    b = Object.keys(b).sort(function (b, e) {
                        var f = b.split("-"),
                            g = e.split("-");
                        return f[0] != g[0] ? parseInt(f[0], 10) < parseInt(g[0], 10) ? -1 : 1 : parseInt(f[1], 10) < parseInt(g[1], 10) ? -1 : 1
                    }),
                    f = Period.selectedMonthString();
                if (0 < b.indexOf(f)) {
                    var g = 4 == Period.highlightedIndex(),
                        f = Period.setSelectedMonthString(b[b.indexOf(f) - (g ? 1 : 0)]);
                    Period.highlightPeriod(4);
                    Tables.update({
                        reason: "User changed period",
                        scrollToBottom: !0
                    })
                }
            }
        });
        var b = $("#month-dropdown");
        b.on("show", function (b) {
            $(this).find("ul").scrollTop(0);
            $("#show-month-item").addClass("enabled")
        });
        b.on("hide", function () {
            Period.update()
        });
        b.mouseup(function (b) {
            if ($(b.target).hasClass("dropdown-disabled")) return !1;
            b = $(b.target).closest("li").attr("data-mstr");
            if (!Utils.isValidMonthString(b)) return !1;
            Period.highlightPeriod(4);
            Period.setSelectedMonthString(b);
            Tables.update({
                reason: "User changed period",
                scrollToBottom: !0
            })
        });
        chrome.storage.onChanged.addListener(function (b) {
            b["month-counts"] && Period.update()
        });
        Period.update()
    },
    selectedMonthString: function () {
        var b = Selection.winStore("selected-month");
        return Utils.isValidMonthString(b) ? b : Period.periodStringForIndex(4)
    },
    setSelectedMonthString: function (b) {
        b || (b = Period.periodStringForIndex(4));
        Selection.winStore("selected-month", b);
        return b
    },
    dateRangeForPeriod: function (b) {
        var e = moment();
        switch (b) {
            case 1:
                return b = moment(), Prefs.get("date-offset") || b.tz(PACIFIC_TIMEZONE), b.startOf("day"), e = b.clone().subtract(1, "d"), [e, b];
            case 2:
                return e = e.clone(), Prefs.get("date-offset") ||
                    e.tz(PACIFIC_TIMEZONE), e.startOf("week"), b = e.clone().add(1, "w"), [e, b];
            case 3:
                e = e.clone();
                Prefs.get("date-offset") || e.tz(PACIFIC_TIMEZONE);
                e.startOf("week");
                b = "lionbridge" == Prefs.get("user-vendor") ? moment("May 21 2017").tz(PACIFIC_TIMEZONE) : moment("May 28 2017").tz(PACIFIC_TIMEZONE);
                0 != e.diff(b, "weeks") % 2 && e.subtract(1, "w");
                e.add(Prefs.get("week-offset") || 0, "d");
                b = e.clone().add(2, "w");
                if (!Prefs.get("date-offset")) {
                    var f = moment.tz.zone(PACIFIC_TIMEZONE),
                        g = moment.tz.zone(moment.tz.guess()),
                        f = f.offset(e) -
                        g.offset(e);
                    e.add(f, "m");
                    b.add(f, "m")
                }
                return [e, b];
            case 4:
                return e = moment(), b = Period.periodStringForIndex(b).split("-"), e.year(b[0]), e.month(b[1] - 1), Prefs.get("date-offset") || e.tz(PACIFIC_TIMEZONE), e.startOf("month"), b = e.clone().add(1, "M"), [e, b];
            default:
                return e = moment(), Prefs.get("date-offset") || e.tz(PACIFIC_TIMEZONE), e.startOf("day"), b = e.clone().add(1, "d"), [e, b]
        }
    },
    monthDateRangeForSelectedPeriod: function () {
        return 3 < Period.highlightedIndex() ? Period.dateRangeForPeriod(4) : Period.dateRangeForPeriod(3)
    },
    highlightedIndex: function () {
        var b = null;
        $headerTitles.each(function (e) {
            if (-1 != $(this).css("text-decoration").indexOf("underline")) return b = e, !1
        });
        return null !== b ? b : 4
    },
    highlightPeriod: function (b) {
        Selection.winStore("selected-period-index", null !== b ? b : null);
        Period.update()
    },
    highlightPeriodForSessions: function (b) {
        if (Object.keys(b).length) {
            var e = Period.latestPeriodIndexForSessions(b);
            e !== Period.highlightedIndex() && Period.highlightPeriod(e);
            if (4 == e) {
                var f = Period.latestPeriodStringForSessions(b);
                Utils.isValidMonthString(f) &&
                    Period.setSelectedMonthString(f)
            } else Period.setSelectedMonthString(f, null)
        } else console.log("Warning: Empty smap")
    },
    latestPeriodIndexForSessions: function (b) {
        var e = [],
            f;
        for (f in b) e.push(b[f]);
        e.sort(function (b, e) {
            return b.start < e.start ? 1 : -1
        });
        b = function (b, e) {
            return b.start >= e[0] && b.start < e[1]
        };
        var g = [0, 1, 3, 4];
        g.unshift(Period.highlightedIndex());
        for (f = 0; f < g.length; f++) {
            var k = Period.dateRangeForPeriod(g[f]);
            if (b(e[0], k)) return g[f]
        }
        return 4
    },
    latestPeriodStringForSessions: function (b) {
        var e = [],
            f;
        for (f in b) e.push(b[f]);
        e.sort(function (b, e) {
            return b.start < e.start ? 1 : -1
        });
        return Period.periodStringForSession(e[e.length - 1])
    },
    periodStringForIndex: function (b) {
        if (4 == b && (b = Selection.winStore("selected-month"), Utils.isValidMonthString(b))) return b;
        b = Utils.localizedMoment();
        return b.year() + "-" + (b.month() + 1)
    },
    periodStringForSession: function (b) {
        b = moment(b.start).tz(PACIFIC_TIMEZONE);
        return b.year() + "-" + (1 + b.month())
    },
    populateMonthDropbown: function (b) {
        $("#month-dropdown:visible").dropdown("hide");
        var e = [];
        if (b) {
            var f = function (b) {
                    return $(document.createElement("li")).append($(document.createElement("a")).text(b).addClass("dropdown-disabled"))
                },
                g = function (b) {
                    return $(document.createElement("li")).append($(document.createElement("a")).text(b))
                };
            b = Object.keys(b).sort(function (b, e) {
                var f = b.split("-"),
                    g = e.split("-");
                return f[0] != g[0] ? parseInt(f[0], 10) < parseInt(g[0], 10) ? 1 : -1 : parseInt(f[1], 10) < parseInt(g[1], 10) ? -1 : 1
            });
            for (var k = -1, h = 0; h < b.length; h++) {
                var l = moment(b[h], "YYYY-M");
                k != l.year() && (k = l.year(), e.length && e.push($(document.createElement("li")).addClass("dropdown-divider")), e.push(f(k)));
                l = g(l.format("MMMM"));
                l.attr("data-mstr", b[h]);
                e.push(l)
            }
        }
        $("#show-months-item").dropdown(1 <
            e.length ? "enable" : "disable");
        $("#month-dropdown .dropdown-menu").eq(0).empty().append(e)
    },
    selectedPeriodText: function () {
        var b = Period.highlightedIndex();
        if (2 <= b) return b = Period.dateRangeForPeriod(b), b[1] = b[1].subtract(1, "d"), " " + b[0].format("L") + " - " + b[1].format("L");
        b = Period.dateRangeForPeriod(b);
        return " " + b[0].format("L")
    },
    update: function () {
        var b = Prefs.get("month-counts") || {},
            e = Period.periodStringForIndex(0);
        b[e] || (b[e] = 0);
        Period.populateMonthDropbown(b);
        var f = Selection.winStore("selected-period-index"),
            f = "undefined" === typeof f || null === f ? 3 : parseInt(f, 10);
        $headerTitles.css("text-decoration", "none");
        $headerTitles.eq(f).css("text-decoration", "underline");
        var g = Period.selectedMonthString();
        4 <= Period.highlightedIndex() && $("#month-dropdown li").each(function () {
            var b = $(this);
            b.toggleClass("checkmark", g == b.attr("data-mstr"))
        });
        b = Object.keys(b).sort(function (b, e) {
            var f = b.split("-"),
                g = e.split("-");
            return f[0] != g[0] ? parseInt(f[0], 10) < parseInt(g[0], 10) ? -1 : 1 : parseInt(f[1], 10) < parseInt(g[1], 10) ? -1 : 1
        });
        f = 0 < b.indexOf(g);
        e = 0 > Utils.compareMonthStrings(g, e);
        $("#left-month-stepper").toggleClass("disabled", !f);
        $("#right-month-stepper").toggleClass("disabled", !e);
        $("#show-months-item").toggleClass("disabled", 1 >= b.length);
        $("#show-months-item").dropdown(1 >= b.length ? "disable" : "enable")
    }
};
var LB_EXTENSION_ID = "imbankdmoclhcdmdejkklikkpaidaeij",
    LF_EXTENSION_ID = "belncckcaakhmonmcfmegbglccbjlebc",
    PQ_SEARCH_EXTENSION_ID = "ilobhiadnbcdmgnflkkdjaecmafmajcf";

function log(b) {
    chrome.runtime.sendMessage({
        method: "log",
        message: b
    })
}
Options = {
    initialize: function () {
        function b(b) {
            Options.updateUserVendor();
            PQ_SEARCH_EXTENSION_ID == b.id && Options.isDialogVisible() && Options.updateDialog()
        }
        $("#login-table .button").on("mousedown", function () {
            $(this).addClass("active")
        }).on("mouseup mouseout", function () {
            $(this).removeClass("active")
        });
        $("input.wage-field").numeric({
            negative: !1
        });
        Prefs.monitor("exchange-rate-data", function (b) {
            chrome.runtime.sendMessage({
                method: "refresh-tables",
                reason: "exchange rate changed"
            })
        });
        Prefs.monitor("show-pro-account",
            function (b) {
                b && $(".account-item").eq(0).mouseup()
            });
        Prefs.monitor("user", function (b) {
            Options.setTablesShown(!!b);
            b && Options.updateExchangeRatesIfNecessary()
        });
        Prefs.monitor("user-vendor", function (b) {
            b && Options.updateUserVendor()
        });
        chrome.storage.onChanged.addListener(function (b, f) {
            Options.isDialogVisible() && Options.updateDialog()
        });
        chrome.management.onEnabled.addListener(b);
        chrome.management.onDisabled.addListener(b);
        chrome.management.onInstalled.addListener(b);
        chrome.management.onUninstalled.addListener(b);
        Options._manageExchangeRate();
        Options.updateUserVendor()
    },
    currentExchangeRate: function () {
        if ("USD" == Prefs.get("disbursed-currency") && Prefs.get("displayed-currency-convert")) {
            var b = Prefs.get("displayed-currency") || "USD",
                e = Prefs.get("exchange-rate-data");
            return e && e.rates && e.rates[b] && e.rates[b].rate || 1
        }
        return 1
    },
    currentRegion: function () {
        var b = Prefs.get("disbursed-currency");
        "USD" == b && (b = Prefs.get("displayed-currency-convert") && Prefs.get("displayed-currency") || "USD");
        return {
            BRL: "pt-BR",
            CAD: "en-CA",
            EGP: "ar-EG",
            EUR: "it",
            HKD: "zh-HK",
            IDR: "id-ID",
            INR: "en-IN",
            JPY: "ja",
            TWD: "zh-TW",
            GBP: "en-GB",
            RUB: "ru-RU",
            USD: "en-US"
        } [b]
    },
    isDialogVisible: function () {
        return $("#options-dialog").is(":visible")
    },
    setTablesShown: function (b) {
        b ? ($("#connecting-content").hide(), $("#login-content").hide(), $("#user-content").show()) : ($("#user-content").hide(), $("#login-content").show())
    },
    setDefaultsForVendor: function (b) {
        chrome.storage.local.set({
            "date-offset": "lionbridge" == b ? 1 : 0,
            "show-toolbar-notification": null,
            "task-time-format": "hours",
            "user-vendor": b,
            "week-offset": 0
        }, function () {
            chrome.runtime.sendMessage({
                method: "refresh-tables",
                reason: "user vendor changed"
            })
        })
    },
    showDialog: function (b, e) {
        function f(b) {
            $("#options-tabs td").removeClass("selected");
            $("#options-tabs td").eq(b).addClass("selected");
            $("#options-dialog table:not(:first-child)").hide();
            $("#options-dialog table:not(:first-child)").eq(b).show()
        }

        function g() {
            var b = "hourly-rate";
            switch ($("#project-for-wage").val()) {
                case "2":
                    b = "hourly-rate-nile";
                    break;
                case "3":
                    b = "hourly-rate-blue-nile";
                    break;
                case "4":
                    b = "hourly-rate-sonora";
                    break;
                case "5":
                    b = "hourly-rate-white-nile";
                    break;
                case "6":
                    b = "hourly-rate-caribou";
                    break;
                case "7":
                    b = "hourly-rate-kwango";
                    break;
                case "8":
                    b = "hourly-rate-platte";
                    break;
                case "9":
                    b = "hourly-rate-thames";
                    break;
                case "10":
                    b = "hourly-rate-danube";
                    break;
                case "11":
                    b = "hourly-rate-shasta";
                    break;
                case "12":
                    b = "hourly-rate-tahoe";
                    break;
                case "13":
                    b = "hourly-rate-kern";
                    break;
                case "14":
                    b = "hourly-rate-hudson";
                    break;
                case "15":
                    b = "hourly-rate-truckee"
            }
            var e = 13500;
            "undefined" !== typeof Prefs.get(b) &&
                (e = Prefs.get(b));
            var f = parseFloat($("input.wage-field").val()),
                f = isNaN(f) ? 0 : Math.min(Math.max(f, 0), 9999),
                f = Math.round(100 * f) / 100 * 1E3;
            $("input.wage-field").val(Utils.convertToMoney(f / 1E3).replace(",", "")).select();
            0 <= f && f != e && (Options.isEditingWage = !0, Prefs.set(b, f, function () {
                Options.isEditingWage = !1;
                h()
            }))
        }

        function k(b) {
            var e = $("#reload-email-enabled").closest("tr"),
                f = $("#reload-push-enabled").closest("tr"),
                g = $("#reload-autostart").closest("tr"),
                h = $("#reload-sms-enabled").closest("tr"),
                k = $("#reload-types").find("tr");
            setTimeout(function () {
                "email" == b ? e.css("outline", "2px solid red") : "schedule" == b ? g.css("outline", "2px solid red") : "sms" == b ? h.css("outline", "2px solid red") : "types" == b ? k.css("outline", "2px solid red") : "push" == b && f.css("outline", "2px solid red")
            }, 250);
            Options.outline_timer && clearTimeout(Options.outline_timer);
            Options.outline_timer = setTimeout(function () {
                e.css("outline", "none");
                f.css("outline", "none");
                g.css("outline", "none");
                h.css("outline", "none");
                k.css("outline", "none");
                Options.outline_timer = 0
            }, 1E3)
        }

        function h() {
            chrome.runtime.sendMessage({
                method: "update-months-earnings"
            }, function () {
                chrome.runtime.sendMessage({
                    method: "refresh-tables",
                    reason: "monthly earnings changed"
                })
            })
        }
        $("#options-dialog").dialog({
            modal: !0,
            width: 680,
            height: "auto",
            title: "Settings",
            dialogClass: "dialog",
            resizable: !1,
            autoOpen: !1,
            create: function () {
                function b(e, f) {
                    var g = !1,
                        h = Prefs.get("goals") || {};
                    $.each(f, function (b, f) {
                        h[e] || (h[e] = {});
                        h[e][b] = f;
                        "enabled" == b || "hour" == b || "minute" == b ? (h[e].last_completed = 0, h[e].last_sid = 0, h[e].fore_sid =
                            0, h[e].ignore_repeating = 0, g = !0) : "fore" == b || "fore_enabled" == b ? h[e].fore_sid = 0 : "repeat" == b && (h[e].ignore_repeating = 0)
                    });
                    Prefs.set("goals", h, function () {
                        g && chrome.runtime.sendMessage({
                            method: "goals-did-change"
                        })
                    })
                }

                function e() {
                    return 1 == $("#reload-email-picker option").length && "configure" == $("#reload-email-picker option").eq(0).val()
                }

                function h() {
                    return 1 == $("#reload-sms-picker option").length && "configure" == $("#reload-sms-picker option").eq(0).val()
                }
                $("#adblock-enabled").change(function () {
                    var b = $(this).prop("checked");
                    !Prefs.get(_v_) && b ? ($(this).prop("checked", !1), $(".account-item").eq(0).mouseup()) : Prefs.set($(this).attr("id"), b)
                });
                $("#autologout-enabled").change(function () {
                    chrome.storage.local.set({
                        "autologout-enabled": $(this).prop("checked")
                    })
                });
                $("#autologout-interval-picker").change(function () {
                    var b = parseInt($("option:selected", this).val(), 10);
                    chrome.storage.local.set({
                        "autologout-interval": b
                    })
                });
                $("#configure-blocker").click(function () {
                    var b = $("#blocker-options-dialog").dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "Anti-Paywall",
                        dialogClass: "dialog",
                        resizable: !1,
                        create: function () {
                            $("#adblock-nyt, #adblock-wsj").change(function () {
                                Prefs.set($(this).attr("id"), $(this).prop("checked"))
                            })
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            })
                        }
                    })
                });
                $("#configure-link-openers").click(function () {
                    var b = $("#link-opening-options").dialog({
                        modal: !0,
                        width: 600,
                        height: "auto",
                        title: "Task Features",
                        dialogClass: "dialog",
                        resizable: !1,
                        create: function () {
                            $("#open-unique-results").change(function () {
                                chrome.storage.local.set({
                                    "open-unique-results": $(this).prop("checked")
                                })
                            });
                            $("#auto-open-results").change(function () {
                                Prefs.set("auto-open-results", $(this).prop("checked"))
                            });
                            $("#auto-open-results-mode").change(function () {
                                Prefs.set("auto-open-results-mode", $(this).val())
                            });
                            $("#open-right-to-left").change(function () {
                                Prefs.set("open-right-to-left", $(this).prop("checked"))
                            });
                            $("#show-block-labels").change(function () {
                                chrome.storage.local.set({
                                    "show-block-labels": $(this).prop("checked")
                                })
                            });
                            $("#use-separate-window").change(function () {
                                chrome.storage.local.set({
                                    "use-separate-window": $(this).prop("checked")
                                })
                            });
                            $("#open-links-separately").change(function () {
                                Prefs.set("open-links-separately", $(this).prop("checked"))
                            });
                            $("#focus-on-hover").change(function () {
                                Prefs.set("focus-on-hover", $(this).prop("checked"))
                            });
                            $("#quarter-tick-warning").change(function () {
                                Prefs.set("quarter-tick-warning", $(this).prop("checked"))
                            });
                            $("#hide-contextual-results").change(function () {
                                Prefs.set("hide-contextual-results", $(this).prop("checked"))
                            });
                            $("#close-s2d-dialog").change(function () {
                                Prefs.set("close-s2d-dialog", $(this).prop("checked"))
                            });
                            $('input[name="link-opening-speed"]').change(function () {
                                Prefs.set("link-opening-speed", $(this).val())
                            })
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            })
                        }
                    })
                });
                $("#configure-mobile-app").click(function () {
                    var b = $("#mobile-app-options-dialog").dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "Send to Mobile",
                        dialogClass: "dialog",
                        resizable: !1,
                        create: function () {
                            $("#send-to-desktop-mode").change(function () {
                                Prefs.set("send-to-desktop-mode", parseInt($(this).val(), 10))
                            });
                            $("#highlight-live-results").change(function () {
                                Prefs.set("highlight-live-results", $(this).prop("checked"))
                            });
                            $("#maps-links-mode").change(function () {
                                Prefs.set("maps-links-mode", parseInt($(this).val(), 10))
                            })
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            })
                        }
                    })
                });
                $("#configure-pq-extension").click(function () {
                    var b = $("#pq-extension-options-dialog").dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "Search Extension",
                        dialogClass: "dialog",
                        resizable: !1,
                        buttons: [{
                            text: "Cancel",
                            width: 180,
                            click: function () {
                                $(this).dialog("close")
                            }
                        }, {
                            text: "Save",
                            width: 180,
                            disabled: !0,
                            click: function () {
                                $(this).dialog("close")
                            }
                        }],
                        create: function () {
                            $(this).click(function () {
                                $(".ui-dialog-buttonset:visible").children().button("enable")
                            })
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            })
                        }
                    })
                });
                $("#configure-querybar").click(function () {
                    var b = $("#querybar-options-dialog").dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "Query Bar",
                        dialogClass: "dialog",
                        resizable: !1,
                        create: function () {
                            function b(e) {
                                $.each(e, function (b, e) {
                                    $(".qb-colors input").eq(b).spectrum("set", e)
                                })
                            }

                            function e() {
                                var b = [];
                                $(".qb-colors input").each(function () {
                                    b.push($(this).spectrum("get").toHexString())
                                });
                                Prefs.set("querybar-color-list", b)
                            }
                            var f = "#99ff99 #ff9999 #a0ffff #ffabff #ffc266 #b2d1ff".split(" ");
                            $(".qb-colors").sortable({
                                axis: "x",
                                stop: function (b, f) {
                                    e()
                                }
                            });
                            $(".qb-colors input").spectrum({
                                showButtons: !0,
                                showInitial: !0,
                                showInput: !1,
                                change: function () {
                                    e()
                                }
                            });
                            $("#restore-qb-defaults").click(function () {
                                b(f);
                                e()
                            });
                            var g = Prefs.get("querybar-color-list");
                            b(g || f)
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            })
                        }
                    })
                });
                $("#date-offset-picker").change(function () {
                    var b = parseInt($("option:selected", this).val(), 10);
                    Prefs.set("date-offset", b);
                    chrome.runtime.sendMessage({
                        method: "refresh-tables",
                        reason: "time zone changed"
                    })
                });
                $("#project-for-wage").change(function () {
                    Options.updateDialog()
                });
                $("#disbursed-currency").change(function () {
                    Prefs.set("disbursed-currency", $(this).val());
                    chrome.runtime.sendMessage({
                        method: "refresh-tables",
                        reason: "disbursed currency changed"
                    })
                });
                $("#displayed-currency").change(function () {
                    Prefs.set("displayed-currency", $(this).val());
                    chrome.runtime.sendMessage({
                        method: "refresh-tables",
                        reason: "displayed currency changed"
                    })
                });
                $("#displayed-currency-convert").change(function () {
                    Prefs.set("displayed-currency-convert", $(this).prop("checked"));
                    chrome.runtime.sendMessage({
                        method: "refresh-tables",
                        reason: "displayed currency changed"
                    })
                });
                $("#search-extension-enabled").change(function () {
                    var b =
                        $(this).prop("checked");
                    !Prefs.get(_v_) && b ? ($("#search-extension-enabled").prop("checked", !1), $(".account-item").eq(0).mouseup()) : chrome.management.get(PQ_SEARCH_EXTENSION_ID, function (e) {
                        chrome.runtime.lastError ? ($("#search-extension-enabled").prop("checked", !1), $("#pq-extension-dialog").dialog({
                            modal: !0,
                            title: "Install Search Extension?",
                            buttons: [{
                                text: "Cancel",
                                width: 150,
                                click: function () {
                                    $(this).dialog("close")
                                }
                            }, {
                                text: "Install Search Extension...",
                                click: function () {
                                    window.open("https://chrome.google.com/webstore/detail/rateraide-search/ilobhiadnbcdmgnflkkdjaecmafmajcf");
                                    $(this).dialog("close")
                                }
                            }],
                            width: 600,
                            open: function () {
                                $(".ui-widget-overlay.ui-front").click(function () {
                                    $("#pq-extension-dialog").dialog("close")
                                })
                            }
                        })) : chrome.management.setEnabled(e.id, b)
                    })
                });
                $("#locale-picker").change(function () {
                    var b = $("option:selected", this).val();
                    Prefs.set("user-locale", "0" !== b ? b : null)
                });
                $("#midnight-restart").change(function () {
                    $(this).prop("checked", !0)
                });
                $("#midnight-restart-mode").change(function () {
                    Prefs.set("midnight-restart-mode", parseInt($(this).val(), 10))
                });
                $("#start-on-acquire").change(function () {
                    Prefs.set("start-on-acquire",
                        $(this).prop("checked"))
                });
                $("#stop-on-index").change(function () {
                    Prefs.set("stop-on-index", $(this).prop("checked"))
                });
                $("#stop-on-nrt").change(function () {
                    Prefs.set("stop-on-nrt", $(this).prop("checked"))
                });
                $("#stop-on-sasr").change(function () {
                    Prefs.set("stop-on-sasr", $(this).prop("checked"))
                });
                $("#resume-sessions").change(function () {
                    Prefs.set("resume-sessions", $(this).prop("checked"))
                });
                $("#rounding-box").click(function () {
                    chrome.storage.local.set({
                        "round-sessions": $(this).prop("checked")
                    })
                });
                $("#send-to-mobile-app").click(function () {
                    var b =
                        $(this).prop("checked");
                    Accounts.s(function (e) {
                        !e && b ? ($("#send-to-mobile-app").prop("checked", !1), $(".account-item").eq(0).mouseup()) : Prefs.set("send-to-device", b)
                    })
                });
                $("#show-querybar").click(function () {
                    var b = $(this).prop("checked");
                    Accounts.s(function (e) {
                        !e && b ? ($("#show-querybar").prop("checked", !1), $(".account-item").eq(0).mouseup()) : b ? chrome.storage.local.set({
                            "querybar-collapsed": !1,
                            "show-querybar": !0
                        }) : chrome.storage.local.set({
                            "show-querybar": !1
                        })
                    })
                });
                $("#task-features-enabled").click(function () {
                    var b =
                        $(this).prop("checked");
                    Accounts.s(function (e) {
                        !e && b ? ($("#task-features-enabled").prop("checked", !1), $(".account-item").eq(0).mouseup()) : chrome.storage.local.set({
                            "task-features-enabled": !!b
                        })
                    })
                });
                $("#timing-mode-picker").change(function () {
                    var b = parseInt($("option:selected", this).val(), 10);
                    Prefs.set("session-timing-mode", b, function () {})
                });
                $("#update-session-timings").click(function () {
                    chrome.runtime.sendMessage({
                        method: "update-session-timings"
                    }, function () {
                        setTimeout(function () {
                            chrome.runtime.sendMessage({
                                method: "refresh-tables",
                                reason: "timing mode changed"
                            })
                        }, 100)
                    })
                });
                $('input[name="user-vendor"]').change(function () {
                    Options.setDefaultsForVendor($(this).val())
                });
                $("input.wage-field").click(function () {
                    $(this).select();
                    return !1
                }).keydown(function (b) {
                    13 == b.keyCode && g()
                });
                $("#week-offset-picker").change(function () {
                    var b = parseInt($("option:selected", this).val(), 10);
                    Prefs.set("week-offset", b);
                    chrome.runtime.sendMessage({
                        method: "refresh-tables",
                        reason: "start of week changed"
                    })
                });
                $("#autosubmit-enabled").change(function () {
                    if ($(this).prop("checked")) {
                        var b =
                            Prefs.get("autosubmit-info") || {};
                        b.enabled = !0;
                        b.mode || (b.mode = "always");
                        Prefs.set("autosubmit-info", b)
                    } else if (b = Prefs.get("autosubmit-info")) b.enabled = !1, Prefs.set("autosubmit-info", b)
                });
                $("#autosubmit-mode").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.mode = $(this).val();
                    Prefs.set("autosubmit-info", b)
                });
                $("#autosubmit-picker").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.when = parseInt($(this).val(), 10);
                    Prefs.set("autosubmit-info", b)
                });
                $("#autosubmit-sooner").change(function () {
                    var b =
                        Prefs.get("autosubmit-info") || {};
                    b.sooner = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b)
                });
                $("#autosubmit-activate-tab").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.activate_tab = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b)
                });
                $("#autosubmit-focus-window").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.focus_window = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b)
                });
                $("#submit-sound-enabled").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.sound_enabled = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b, function () {
                        chrome.runtime.sendMessage({
                            type: "play-submit-sound",
                            stop: !b.sound_enabled
                        })
                    })
                });
                $("#submit-sound").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.sound = $(this).val();
                    Prefs.set("autosubmit-info", b, function () {
                        chrome.runtime.sendMessage({
                            type: "play-submit-sound"
                        })
                    })
                });
                $("#volume-slider").bind("slider:didchange", function (b, e) {
                    var f = Prefs.get("autosubmit-info") || {};
                    f.sound_volume = Math.max($(this).val(), .01);
                    Prefs.set("autosubmit-info",
                        f,
                        function () {
                            chrome.runtime.sendMessage({
                                type: "play-submit-sound"
                            })
                        })
                });
                $("#send-autosubmit-notification").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.push_enabled = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b)
                });
                $("#send-autosubmit-notification-only-if-away").change(function () {
                    var b = Prefs.get("autosubmit-info") || {};
                    b.push_if_away = $(this).prop("checked");
                    Prefs.set("autosubmit-info", b)
                });
                $("#auto-show-popout").change(function () {
                    Prefs.set("auto-show-popout", $(this).prop("checked"))
                });
                $("#toggle-timer-on-click").change(function () {
                    Prefs.set("toggle-timer-on-click", $(this).prop("checked"))
                });
                $("#float-popout-window").change(function () {
                    Prefs.set("float-popout-window", $(this).prop("checked"))
                });
                $("#show-login-notification").click(function () {
                    Prefs.set("show-login-notification", $(this).prop("checked"))
                });
                $("#show-submit-notification").click(function () {
                    Prefs.set("show-submit-notification", $(this).prop("checked"))
                });
                $("#send-mobile-alerts").click(function () {
                    Prefs.set("send-mobile-alerts",
                        $(this).prop("checked"))
                });
                $("#test-submit-alerts").click(function () {
                    var b = $(this);
                    b.prop("disabled", !0);
                    chrome.runtime.sendMessage({
                        method: "test-submit-alerts"
                    }, function () {
                        b.prop("disabled", !1)
                    })
                });
                $("#test-autosubmit-alerts").click(function () {
                    var b = $(this);
                    b.prop("disabled", !0);
                    chrome.runtime.sendMessage({
                        method: "test-autosubmit-alerts"
                    }, function () {
                        b.prop("disabled", !1)
                    })
                });
                $("#show-autosubmit-notification").click(function () {
                    Prefs.set("show-autosubmit-notification", $(this).prop("checked"))
                });
                $("#show-toolbar-notification").click(function () {
                    Prefs.set("show-toolbar-notification",
                        $(this).prop("checked"))
                });
                $("#push-notification-idle-interval").change(function () {
                    Prefs.set("push-notification-idle-interval", parseInt($(this).val(), 10))
                });
                $("#push-notification-idle-only").change(function () {
                    Prefs.set("push-notification-idle-only", $(this).prop("checked"))
                });
                $("#reload-enabled").change(function () {
                    $(this).prop("checked") && !Prefs.get(_v_) ? ($(this).prop("checked", !1), $(".account-item").eq(0).mouseup()) : Prefs.set("reload-enabled", $(this).prop("checked"))
                });
                $("#reload-auto-acquire").change(function () {
                    Prefs.set("reload-acquire-enabled",
                        $(this).prop("checked"))
                });
                $("#reload-acquire-mode").change(function () {
                    Prefs.set("reload-acquire-mode", parseInt($(this).val(), 10))
                });
                $("#reload-monitor-changes").change(function () {
                    Prefs.set("reload-monitor-changes", !$(this).prop("checked"))
                });
                $("#reload-send-only-if-away").change(function () {
                    Prefs.set("reload-send-only-if-away", $(this).prop("checked"))
                });
                $("#reload-types input").change(function () {
                    val = 0;
                    $("#reload-types input").each(function () {
                        $(this).prop("checked") && (val |= Math.pow(2, $(this).val()))
                    });
                    Prefs.set("reload-types", val)
                });
                $("#show-reloader-notification").change(function () {
                    Prefs.set("show-reloader-notification", $(this).prop("checked"))
                });
                $("#reload-sound-enabled").change(function () {
                    Prefs.set("reload-sound-enabled", $(this).prop("checked"))
                });
                $("#reload-interval-minutes, #reload-interval-seconds").change(function () {
                    var b = 6E4 * $("#reload-interval-minutes").val(),
                        b = b + 1E3 * $("#reload-interval-seconds").val();
                    "reload-interval-minutes" == $(this).attr("id") && (b -= b % 6E4, 0 == $(this).val() && (b += 3E4));
                    b = Math.max(b, 2E3);
                    Prefs.set("reload-interval", b);
                    Options.updateReloadInterval()
                });
                $("#reload-sound-name").change(function () {
                    Prefs.set("reload-sound-name", $(this).val())
                });
                $("#reload-sound-repeat").change(function () {
                    Prefs.set("reload-sound-repeat", $(this).prop("checked"))
                });
                $("#reload-autostart").change(function () {
                    if ($(this).prop("checked") && !Prefs.get(_v_)) $(this).prop("checked", !1), $(".account-item").eq(0).mouseup();
                    else {
                        var b = Prefs.get("reload-autostart") || {};
                        b.enabled = $(this).prop("checked");
                        Prefs.set("reload-autostart",
                            b)
                    }
                });
                $("#reload-autostart-hour-24").change(function () {
                    var b = Prefs.get("reload-autostart") || {};
                    b.hour = parseInt($(this).val(), 10);
                    Prefs.set("reload-autostart", b)
                });
                $("#reload-autostart-hour, #reload-autostart-ampm").change(function () {
                    var b = Prefs.get("reload-autostart") || {};
                    b.hour = parseInt($("#reload-autostart-hour").val(), 10);
                    "pm" == $("#reload-autostart-ampm").val() && (b.hour += 12);
                    Prefs.set("reload-autostart", b)
                });
                $("#reload-autostart-minute").change(function () {
                    var b = Prefs.get("reload-autostart") || {};
                    b.minute = parseInt($(this).val(), 10);
                    Prefs.set("reload-autostart", b)
                });
                $("#reload-autostart-mode").change(function () {
                    var b = Prefs.get("reload-autostart") || {};
                    b.mode = $(this).val();
                    Prefs.set("reload-autostart", b)
                });
                $("#reload-autostop").change(function () {
                    if ($(this).prop("checked") && !Prefs.get(_v_)) $(this).prop("checked", !1), $(".account-item").eq(0).mouseup();
                    else {
                        var b = Prefs.get("reload-autostop") || {};
                        b.enabled = $(this).prop("checked");
                        Prefs.set("reload-autostop", b)
                    }
                });
                $("#reload-autostop-hour-24").change(function () {
                    var b =
                        Prefs.get("reload-autostop") || {};
                    b.hour = parseInt($(this).val(), 10);
                    Prefs.set("reload-autostop", b)
                });
                $("#reload-autostop-hour, #reload-autostop-ampm").change(function () {
                    var b = Prefs.get("reload-autostop") || {};
                    b.hour = parseInt($("#reload-autostop-hour").val(), 10);
                    "pm" == $("#reload-autostop-ampm").val() && (b.hour += 12);
                    Prefs.set("reload-autostop", b)
                });
                $("#reload-autostop-minute").change(function () {
                    var b = Prefs.get("reload-autostop") || {};
                    b.minute = parseInt($(this).val(), 10);
                    Prefs.set("reload-autostop", b)
                });
                $("#reload-autostop-mode").change(function () {
                    var b = Prefs.get("reload-autostop") || {};
                    b.mode = $(this).val();
                    Prefs.set("reload-autostop", b)
                });
                $("#options-tabs td:not(.rule)").click(function () {
                    $(this).parent().find("td").removeClass("selected");
                    $(this).addClass("selected");
                    f($(this).index());
                    Prefs.set("last-selected-option-pane", $(this).index())
                });
                $("#dropbox-account-link").click(function () {
                    var b = $("#dropbox-account-dialog"),
                        e = Prefs.get("user");
                    e && b.dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "Dropbox Account",
                        dialogClass: "dialog",
                        resizable: !1,
                        buttons: [{
                            text: "Restore Defaults...",
                            width: 200,
                            click: function () {
                                Utils.showGenericPrompt({
                                    title: "Restore Defaults?",
                                    message: "Restoring defaults will set any user-configured options back to their original values.",
                                    buttons: [{
                                        text: "Cancel",
                                        width: 180,
                                        click: function () {
                                            $(this).dialog("close")
                                        }
                                    }, {
                                        text: "Restore Defaults",
                                        width: 180,
                                        click: function () {
                                            var e = $(this);
                                            chrome.runtime.sendMessage({
                                                method: "restore-defaults"
                                            }, function (f) {
                                                e.dialog("close");
                                                b.dialog("close");
                                                $("#options-dialog").dialog("close");
                                                Options.updateUserVendor()
                                            })
                                        }
                                    }]
                                })
                            }
                        }, {
                            text: "Sign Out",
                            width: 200,
                            click: function () {
                                signOutOfDropbox(function (e) {
                                    e && (b.dialog("close"), $("#options-dialog").dialog("close"))
                                })
                            }
                        }],
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                b.dialog("close")
                            });
                            $("#dropbox-account-name").text(e.name || e.display_name);
                            $("#dropbox-account-email").text(e.email);
                            $("#dropbox-account-uid").text(e.uid);
                            $(":focus").blur()
                        }
                    })
                });
                $.each(["session", "day", "week", "month"], function (e, f) {
                    $("#" + f + "-goal-enabled, #" +
                        f + "-goal-hours, #" + f + "-goal-minutes").change(function () {
                        b(f, {
                            enabled: $("#" + f + "-goal-enabled").prop("checked"),
                            hour: $("#" + f + "-goal-hours").val(),
                            minute: $("#" + f + "-goal-minutes").val()
                        })
                    });
                    $("#" + f + "-goal-mode").change(function () {
                        b(f, {
                            mode: $(this).val()
                        })
                    });
                    $("#" + f + "-goal-fore, #" + f + "-goal-fore-enabled").change(function () {
                        b(f, {
                            fore: $("#" + f + "-goal-fore").val(),
                            fore_enabled: $("#" + f + "-goal-fore-enabled").prop("checked")
                        })
                    });
                    $("#" + f + "-goal-repeat").change(function () {
                        b(f, {
                            repeat: $(this).prop("checked")
                        })
                    })
                });
                $("#reload-email-enabled").change(function () {
                    e() ? ($(this).prop("checked", !1), $("#reload-email-add").click()) : Prefs.set("reload-email-enabled", $(this).prop("checked"))
                });
                $("#reload-email-picker").change(function () {
                    Prefs.set("reload-email-address", $(this).val())
                });
                $("#reload-email-picker").mousedown(function () {
                    if (e()) return setTimeout(function () {
                        $("#reload-email-add").click()
                    }, 100), $(this).blur(), !1
                });
                $("#reload-email-add").click(function () {
                    for (var b = ""; b = window.prompt("Enter email address:", b), null !==
                        b && "" !== b && !/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/.exec(b););
                    if (b) {
                        var e = Prefs.get("reload-email-list") || []; - 1 == e.indexOf(b) && e.push(b);
                        Prefs.setAll({
                            "reload-email-list": e,
                            "reload-email-address": b,
                            "reload-email-enabled": !0
                        })
                    }
                });
                $("#reload-email-remove").click(function () {
                    var b = $("#reload-email-picker option:selected"),
                        e = b.val(),
                        f = Prefs.get("reload-email-list") || []; - 1 != f.indexOf(e) && f.splice(f.indexOf(e), 1);
                    b.remove();
                    e = $("#reload-email-picker option:selected").val() || null;
                    Prefs.setAll({
                        "reload-email-list": f,
                        "reload-email-address": e,
                        "reload-email-enabled": !!e
                    })
                });
                $("#reload-email-test").click(function () {
                    var b = $(this),
                        e = {
                            method: "send-test-email",
                            address: $("#reload-email-picker").val()
                        };
                    chrome.runtime.sendMessage(e, function (e, f) {
                        b.prop("disabled", !1)
                    });
                    b.prop("disabled", !0)
                });
                $("#reload-sms-enabled").change(function () {
                    h() ? ($(this).prop("checked", !1), $("#reload-sms-add").click()) : Prefs.set("reload-sms2-enabled", $(this).prop("checked"))
                });
                $("#reload-sms-picker").change(function () {
                    Prefs.set("reload-sms2-address",
                        $(this).val())
                });
                $("#reload-sms-picker").mousedown(function () {
                    if (h()) return setTimeout(function () {
                        $("#reload-sms-add").click()
                    }, 100), $(this).blur(), !1
                });
                $("#reload-sms-add").click(function () {
                    for (var b = ""; !(b = window.prompt("Enter phone number (+ country code if outside USA):", b), null === b || "" === b || b && 10 <= b.toString().length););
                    if (b) {
                        var e = Prefs.get("reload-sms2-list") || []; - 1 == e.indexOf(b) && e.push(b);
                        Prefs.setAll({
                            "reload-sms2-list": e,
                            "reload-sms2-address": b,
                            "reload-sms2-enabled": !0
                        })
                    }
                });
                $("#reload-sms-remove").click(function () {
                    var b =
                        $("#reload-sms-picker option:selected"),
                        e = b.val(),
                        f = Prefs.get("reload-sms2-list") || []; - 1 != f.indexOf(e) && f.splice(f.indexOf(e), 1);
                    b.remove();
                    e = $("#reload-sms-picker option:selected").val() || null;
                    Prefs.setAll({
                        "reload-sms2-list": f,
                        "reload-sms2-address": e,
                        "reload-sms2-enabled": !!e
                    })
                });
                $("#reload-sms-test").click(function () {
                    var b = $(this),
                        e = {
                            method: "send-test-sms",
                            address: $("#reload-sms-picker").val()
                        };
                    chrome.runtime.sendMessage(e, function (e, f) {
                        b.prop("disabled", !1)
                    });
                    b.prop("disabled", !0)
                });
                $("#reload-push-enabled").click(function () {
                    Prefs.set("reload-push-enabled",
                        $(this).prop("checked"))
                });
                $("#test-task-alerts").click(function () {
                    var b = $(this);
                    b.prop("disabled", !0);
                    chrome.runtime.sendMessage({
                        method: "test-task-alerts"
                    }, function () {
                        b.prop("disabled", !1)
                    })
                })
            },
            open: function () {
                $(".ui-widget-overlay.ui-front").click(function () {
                    $("#options-dialog").dialog("close")
                });
                $("#options-dialog").find("input").blur();
                f(b || 0);
                e && k(e);
                $("#options-dialog").dialog({
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    }
                });
                var g = $("#displayed-currency").offset().left - $("#disbursed-currency").offset().left,
                    h = $("input.wage-field");
                h.width(g + h.width())
            },
            close: function () {
                g()
            }
        });
        $("#project-for-wage").val(0);
        Options.updateDialog(function () {
            $("#options-dialog").is(":visible") ? ("undefined" !== typeof b && f(b), "undefined" !== typeof e && k(e)) : $("#options-dialog").dialog("open")
        })
    },
    updateDialog: function (b) {
        chrome.storage.local.get(null, function (e) {
            var f = !!e[_v_];
            $("#autologout-enabled").prop("checked", !1 !== e["autologout-enabled"]);
            $("#autologout-interval-picker").val("undefined" === typeof e["autologout-interval"] ?
                1 : e["autologout-interval"]);
            $("#date-offset-picker").val(e["date-offset"] || 0);
            $("#exchange-rate").text(function () {
                var b = e["exchange-rate-data"] && e["exchange-rate-data"].rates,
                    f = e["displayed-currency"] || "USD";
                return b && b[f] && b[f].description
            }() || "1 USD to 1 USD");
            $("#midnight-restart").prop("checked", !0).prop("disabled", !0);
            $("#midnight-restart-mode").val(e["midnight-restart-mode"] || 0);
            $("#resume-sessions").prop("checked", !1 !== e["resume-sessions"]);
            $("#rounding-box").prop("checked", !1 !== e["round-sessions"]);
            $("#timing-mode-picker").val(e["session-timing-mode"] || 0);
            $("#week-offset-picker").val(e["week-offset"] || 0);
            $("#start-on-acquire").prop("checked", !!e["start-on-acquire"]);
            $("#stop-on-sasr").prop("checked", !!e["stop-on-sasr"]);
            var g = !!e["stop-on-index"];
            $("#stop-on-index").prop("checked", g);
            $("#stop-on-nrt").prop("checked", !!e["stop-on-nrt"]).prop("disabled", !g);
            $("#locale-picker").val(e["user-locale"] || "0");
            $("#show-block-labels").prop("checked", !1 !== e["show-block-labels"]);
            $("#open-unique-results").prop("checked",
                !1 !== e["open-unique-results"]);
            $("#auto-open-results").prop("checked", !!e["auto-open-results"]);
            $("#auto-open-results-mode").val(e["auto-open-results-mode"] || "left");
            $("#open-right-to-left").prop("checked", !!e["open-right-to-left"]);
            $("#quarter-tick-warning").prop("checked", !!e["quarter-tick-warning"]);
            $("#hide-contextual-results").prop("checked", !!e["hide-contextual-results"]);
            $("#close-s2d-dialog").prop("checked", !!e["close-s2d-dialog"]);
            $('input[name="link-opening-speed"][value="' + ("undefined" !==
                typeof e["link-opening-speed"] ? e["link-opening-speed"] : "medium") + '"]').prop("checked", !0);
            g = !!e["use-separate-window"];
            $("#use-separate-window").prop("checked", g);
            $("#open-links-separately").prop("disabled", !g).prop("checked", g && !!e["open-links-separately"]).closest("tr").find("label").toggleClass("disabled", !g);
            $("#focus-on-hover").prop("disabled", !g).prop("checked", g && !!e["focus-on-hover"]).closest("tr").find("label").toggleClass("disabled", !g);
            g = e["autosubmit-info"];
            $("#autosubmit-enabled").prop("checked",
                !(!g || !g.enabled));
            $("#autosubmit-picker").val(g && "undefined" !== typeof g.when ? g.when : 2);
            $("#autosubmit-mode").val(g && "undefined" !== typeof g.mode ? g.mode : "always");
            $("#autosubmit-sooner").prop("checked", !(!g || !g.sooner));
            $("#show-autosubmit-notification").prop("checked", !1 !== e["show-autosubmit-notification"]);
            $("#autosubmit-activate-tab").prop("checked", !(!g || !g.activate_tab));
            $("#autosubmit-focus-window").prop("checked", !(!g || !g.focus_window));
            $("#submit-sound-enabled").prop("checked", !(!g || !g.sound_enabled));
            $("#submit-sound").val(g && g.sound || "tones/congrats");
            $("#volume-slider").simpleSlider("setValue", g && g.sound_volume || 1);
            var k = !(!g || !g.push_enabled);
            $("#send-autosubmit-notification").prop("checked", k);
            $("#send-autosubmit-notification-only-if-away").prop("checked", !g || !1 !== g.push_if_away).prop("disabled", !k);
            k = "hourly-rate";
            switch ($("#project-for-wage").val()) {
                case "2":
                    k = "hourly-rate-nile";
                    break;
                case "3":
                    k = "hourly-rate-blue-nile";
                    break;
                case "4":
                    k = "hourly-rate-sonora";
                    break;
                case "5":
                    k = "hourly-rate-white-nile";
                    break;
                case "6":
                    k = "hourly-rate-caribou";
                    break;
                case "7":
                    k = "hourly-rate-kwango";
                    break;
                case "8":
                    k = "hourly-rate-platte";
                    break;
                case "9":
                    k = "hourly-rate-thames";
                    break;
                case "10":
                    k = "hourly-rate-danube";
                    break;
                case "11":
                    k = "hourly-rate-shasta";
                    break;
                case "12":
                    k = "hourly-rate-tahoe";
                    break;
                case "13":
                    k = "hourly-rate-kern";
                    break;
                case "14":
                    k = "hourly-rate-hudson";
                    break;
                case "15":
                    k = "hourly-rate-truckee"
            }
            g = 13500;
            "undefined" !== typeof e[k] && (g = e[k]);
            var k = $("input.wage-field"),
                h = k.is(":focus");
            k.val(Utils.convertToMoney(g /
                1E3).replace(",", ""));
            h && k.select();
            g = e["disbursed-currency"] || "USD";
            console.log(g);
            $("#disbursed-currency").val(g);
            "USD" == g ? (g = e["displayed-currency"], $("#displayed-currency").val(e["displayed-currency"] || "EUR"), $(".displayed-currency-row").show(), "USD" == g ? $("td.displayed-currency-convert").hide() : ($("td.displayed-currency-convert").show(), $("#displayed-currency-convert").prop("checked", !!e["displayed-currency-convert"])), $(".exchange-rate-row").toggle("USD" != g)) : ($("#displayed-currency").val(g),
                $(".displayed-currency-row").hide(), $(".exchange-rate-row").hide());
            g = e.user || {};
            $("#dropbox-email").text(g.email || "Unknown");
            $("#show-login-notification").prop("checked", !1 !== e["show-login-notification"]);
            $("#show-submit-notification").prop("checked", !1 !== e["show-submit-notification"]);
            $("#send-mobile-alerts").prop("checked", !!e["send-mobile-alerts"]);
            $("#show-toolbar-notification").prop("checked", !1 !== e["show-toolbar-notification"]);
            "lionbridge" == e["user-vendor"] && $("#show-toolbar-notification").closest("tr").hide();
            $("#push-notification-idle-only").prop("checked", !1 !== e["push-notification-idle-only"]);
            $("#push-notification-idle-interval").val(e["push-notification-idle-interval"] || 60);
            $("#show-reloader-notification").prop("checked", !1 !== e["show-reloader-notification"]);
            $("#reload-auto-acquire").prop("checked", !!e["reload-acquire-enabled"]);
            $("#reload-acquire-mode").val(e["reload-acquire-mode"] ? "1" : "0");
            $("#reload-enabled").prop("checked", !!e["reload-enabled"]);
            $("#reload-monitor-changes").prop("checked", !e["reload-monitor-changes"]);
            $("#reload-send-only-if-away").prop("checked", !1 !== e["reload-send-only-if-away"]);
            Options.updateReloadInterval();
            g = !1 !== e["reload-sound-enabled"];
            $("#reload-sound-enabled").prop("checked", g);
            $("#reload-sound-name").val(e["reload-sound-name"] || "default");
            $("#reload-sound-repeat").prop("checked", g && !!e["reload-sound-repeat"]).attr("disabled", !g);
            $("#reload-sound-repeat").parent().next().find("label").toggleClass("disabled", !g);
            var l = "undefined" !== typeof e["reload-types"] ? e["reload-types"] : 31;
            $("#reload-types input").each(function () {
                $(this).prop("checked",
                    0 != (Math.pow(2, $(this).val()) & l))
            });
            g = Prefs.get("reload-autostart") || {};
            $("#reload-autostart").prop("checked", f && !!g.enabled);
            k = "undefined" !== typeof g.hour ? g.hour : 6;
            $("#reload-autostart-hour-24").val(k);
            $("#reload-autostart-hour").val(k % 12);
            $("#reload-autostart-minute").val("undefined" !== typeof g.minute ? g.minute : 0);
            $("#reload-autostart-ampm").val(12 <= k ? "pm" : "am");
            $("#reload-autostart-hour-24").toggle(!!e["use-24-hour-time"]);
            $("#reload-autostart-ampm, #reload-autostart-hour").toggle(!e["use-24-hour-time"]);
            $("#reload-autostart-mode").val(g && g.mode ? g.mode : "once");
            k = Prefs.get("reload-autostop") || {};
            $("#reload-autostop").prop("checked", f && !!k.enabled);
            h = "undefined" !== typeof k.hour ? k.hour : 22;
            $("#reload-autostop-hour-24").val(h);
            $("#reload-autostop-hour").val(h % 12);
            $("#reload-autostop-minute").val("undefined" !== typeof k.minute ? k.minute : 0);
            $("#reload-autostop-ampm").val(12 <= h ? "pm" : "am");
            $("#reload-autostop-hour-24").toggle(!!e["use-24-hour-time"]);
            $("#reload-autostop-ampm, #reload-autostop-hour").toggle(!e["use-24-hour-time"]);
            $("#reload-autostop-mode").val(k && k.mode ? k.mode : "once");
            $(".extra-reload-info").toggle(!(!g.enabled && !k.enabled));
            "lionbridge" == e["user-vendor"] ? $("#lionbridge-vendor").prop("checked", !0) : $("#leapforce-vendor").prop("checked", !0);
            $("#adblock-nyt").prop("checked", !1 !== e["adblock-nyt"]);
            $("#adblock-wsj").prop("checked", !1 !== e["adblock-wsj"]);
            $("#adblock-enabled").prop("checked", f && !1 !== e["adblock-enabled"]);
            $("#auto-show-popout").prop("checked", !!e["auto-show-popout"]);
            $("#toggle-timer-on-click").prop("checked",
                !1 !== e["toggle-timer-on-click"]);
            $("#float-popout-window").prop("checked", !!e["float-popout-window"]);
            $("#show-querybar").prop("checked", f && !1 !== e["show-querybar"]);
            $("#task-features-enabled").prop("checked", f && !1 !== e["task-features-enabled"]);
            $(".extra-timer-info").toggle($("#float-popout-window").prop("checked"));
            $("#send-to-mobile-app").prop("checked", f && !1 !== e["send-to-device"]);
            $("#send-to-desktop-mode").val(e["send-to-desktop-mode"] || 0);
            $("#highlight-live-results").prop("checked", !1 !== e["highlight-live-results"]);
            $("#maps-links-mode").val(e["maps-links-mode"] || 0);
            g = (f = e.goals) && f.session || !1;
            k = 2;
            h = g && !!g.enabled;
            $("#session-goal-enabled").prop("checked", h);
            $("#session-goal-mode").val(g && g.mode || "duration");
            $("#session-goal-hours").val(g && "undefined" !== typeof g.hour && g.hour || k);
            $("#session-goal-minutes").val(g && "undefined" !== typeof g.minute && g.minute || 0);
            $("#session-goal-fore-enabled").prop("checked", !g || !1 !== g.fore_enabled).prop("disabled", !h);
            $("#session-goal-fore").val(g && g.fore || 10);
            $("#session-goal-repeat").prop("checked",
                !g || !1 !== g.repeat).prop("disabled", !h);
            g = f && f.day || !1;
            k = 8;
            h = g && !!g.enabled;
            $("#day-goal-enabled").prop("checked", h);
            $("#day-goal-mode").val(g && g.mode || "duration");
            $("#day-goal-hours").val(g && "undefined" !== typeof g.hour && g.hour || k);
            $("#day-goal-minutes").val(g && "undefined" !== typeof g.minute && g.minute || 0);
            $("#day-goal-fore-enabled").prop("checked", !g || !1 !== g.fore_enabled).prop("disabled", !h);
            $("#day-goal-fore").val(g && g.fore || 10);
            $("#day-goal-repeat").prop("checked", !g || !1 !== g.repeat).prop("disabled",
                !h);
            g = f && f.week || !1;
            k = "lionbridge" != Prefs.get("user-vendor") ? 26 : 20;
            h = g && !!g.enabled;
            $("#week-goal-enabled").prop("checked", h);
            $("#week-goal-mode").val(g && g.mode || "duration");
            $("#week-goal-hours").val(g && "undefined" !== typeof g.hour && g.hour || k);
            $("#week-goal-minutes").val(g && "undefined" !== typeof g.minute && g.minute || 0);
            $("#week-goal-fore-enabled").prop("checked", !g || !1 !== g.fore_enabled).prop("disabled", !h);
            $("#week-goal-fore").val(g && g.fore || 10);
            $("#week-goal-repeat").prop("checked", !g || !1 !== g.repeat).prop("disabled",
                !h);
            g = f && f.month || !1;
            k = 40;
            h = g && !!g.enabled;
            $("#month-goal-enabled").prop("checked", h);
            $("#month-goal-mode").val(g && g.mode || "duration");
            $("#month-goal-hours").val(g && "undefined" !== typeof g.hour && g.hour || 80);
            $("#month-goal-minutes").val(g && "undefined" !== typeof g.minute && g.minute || 0);
            $("#month-goal-fore-enabled").prop("checked", !g || !1 !== g.fore_enabled).prop("disabled", !h);
            $("#month-goal-fore").val(g && g.fore || 10);
            $("#month-goal-repeat").prop("checked", !g || !1 !== g.repeat).prop("disabled", !h);
            for (var n = !!e["reload-email-enabled"], p = e["reload-email-address"], m = e["reload-email-list"] || [], f = $("#reload-email-picker").empty(), g = "", k = 0; k < m.length; k++) h = m[k], g += '<option value="' + h + '">' + h + "</option>";
            0 == m.length ? f.append('<option value="configure">Add email address...</option>') : f.append(g).val(p);
            $("#reload-email-enabled").prop("checked", !(!n || !p));
            $("#reload-email-remove").prop("disabled", !p);
            $("#reload-email-test").prop("disabled", !p);
            n = !!e["reload-sms2-enabled"];
            p = e["reload-sms2-address"];
            m = e["reload-sms2-list"] || [];
            f = $("#reload-sms-picker").empty();
            g = "";
            for (k = 0; k < m.length; k++) h = m[k], g += '<option value="' + h + '">' + h + "</option>";
            0 == m.length ? f.append('<option value="configure">Add phone number...</option>') : f.append(g).val(p);
            $("#reload-sms-enabled").prop("checked", !(!n || !p));
            $("#reload-sms-remove").prop("disabled", !p);
            $("#reload-sms-test").prop("disabled", !p);
            $("#reload-push-enabled").prop("checked", !!e["reload-push-enabled"]);
            b && b()
        });
        is_extension ? Utils.getExtensionInfo(PQ_SEARCH_EXTENSION_ID, function (b) {
            b = !!(Prefs.get(_v_) &&
                b && b.enabled);
            $("#search-extension-enabled").prop("checked", b)
        }) : $("#search-extension-enabled").prop("checked", !1).prop("disabled", !0)
    },
    updateExchangeRates: function () {
        $.ajax({
            url: "https://rateraide.herokuapp.com/quotes/USD/live"
        }).done(function (b) {
            try {
                var e = {};
                for (itemId in b.quotes) {
                    var f = b.quotes[itemId];
                    e[itemId] = {
                        rate: f,
                        description: f + " " + (itemId + " to 1 USD"),
                        date: b.timestamp
                    }
                }
                b = {
                    date: Date(b.timestamp),
                    rates: e
                };
                Prefs.set("exchange-rate-data", b)
            } catch (g) {
                console.error("Error in updateExchangeRates: " +
                    g.message)
            }
        }).fail(function (b) {
            console.log("Error in updateExchangeRates: " + JSON.stringify(b))
        })
    },
    updateExchangeRatesIfNecessary: function () {
        var b = Prefs.get("exchange-rate-data") || {},
            b = Date.now() - (b.date || 0);
        (0 > b || 36E5 <= b) && Options.updateExchangeRates()
    },
    updateReloadInterval: function () {
        var b = Prefs.get("reload-interval");
        "undefined" == typeof b && (b = 6E4);
        var b = Math.max(b, 2E3),
            e = Math.floor(b / 6E4),
            b = Math.floor(b % 6E4 / 1E3);
        $("#reload-interval-minutes").val(e);
        $("#reload-interval-seconds").val(b)
    },
    updateUserVendor: function () {
        function b() {
            var b =
                "lionbridge" == Prefs.get("user-vendor");
            $(".leapforce-specific, #task-header-table .count-item").toggle(!b);
            $(".lionbridge-specific").toggle(b)
        }
        "undefined" === typeof Prefs.get("user-vendor") ? Utils.getExtensionInfo(LB_EXTENSION_ID, function (e) {
            Utils.getExtensionInfo(LF_EXTENSION_ID, function (f) {
                e ? Options.setDefaultsForVendor("lionbridge") : f && Options.setDefaultsForVendor("leapforce");
                b()
            })
        }) : b()
    },
    _manageExchangeRate: function () {
        function b() {
            var e = new Date;
            clearInterval(f);
            f = setInterval(b, 36E5 - 6E4 * e.getMinutes() -
                1E3 * e.getSeconds());
            Options.updateExchangeRatesIfNecessary()
        }
        var e = new Date,
            f = setInterval(b, 36E5 - 6E4 * e.getMinutes() - 1E3 * e.getSeconds());
        Options.updateExchangeRatesIfNecessary()
    }
};
var Selection = {
    initialize: function (b) {
        function e() {
            if (!$(".dropdown:visible").length && !$(".dialog:not(.timer):visible").length) {
                var b = Selection.keyTable();
                if (-1 != Selection.sessions.mousedown_row || -1 != Selection.tasks.mousedown_row || -1 != Selection.days.mousedown_row) "sessions" == b ? Selection.recalcSessionSelectionOnMouseup() : "tasks" == b && Selection.recalcTaskSelectionOnMouseup(), Selection.readTableSelectionsIntoStorage()
            }
        }
        Selection.windowId = 1;
        b && b();
        $(document.body).mousedown(function (b) {
            function e() {
                $("#sessions-table tr:visible.tr-selected, #tasks-table tr.tr-selected:visible").length &&
                    (Selection.clearSessionsTable(), Selection.clearTasksTable(), Selection.readTableSelectionsIntoStorage(), Tables.update({
                        reason: "selection cleared"
                    }), Selection.setKeyTable(""))
            }
            if (1 == b.which) {
                var k = $(b.target);
                if (!$(".dropdown:visible").length && !$(".dialog:not(.timer):visible").length) {
                    var h = k.closest("tr"),
                        l = b.metaKey || b.ctrlKey;
                    if (k.closest("#sessions-table").get(0)) {
                        var n = "tasks" == Selection.keyTable();
                        l && n || Selection.setKeyTable("sessions");
                        if (0 == k.closest("td").index()) {
                            var k = k.closest("td").attr("title"),
                                p = 0 != $("#sessions-table tr:visible td:first-child:not(.noHighlight)").length;
                            if (l) Selection.toggleDateHighlighted(k), Selection.days.lastclicked_row = h.index();
                            else if (b.shiftKey && p) {
                                b = Selection.days.lastclicked_row;
                                if (-1 == b) return;
                                Selection.setRangeHighlighted(b, h.index(), !0)
                            } else Selection.clearSessionsTable(), Selection.days.mousedown_row = h.index(), Selection.days.lastclicked_row = h.index(), Selection.setDateHighlighted(k, !0);
                            Selection.didClickDateColumnLast = !0
                        } else {
                            if (l) h.hasClass("tr-selected") ? Selection.removeSessionSelection(h.index(),
                                1) : Selection.appendSessionSelection(h.index(), 1), Selection.sessions.lastclickedrow = h.index(), Selection.sessions.shiftindexes = [];
                            else if (b.shiftKey && Selection.sessions.indexes.length) {
                                b = Selection.sessions.lastclickedrow;
                                if (-1 == b) return;
                                l = Selection.sessions.shiftindexes;
                                Selection.removeSessionSelectionIndexes(l);
                                l = Math.min(h.index(), b);
                                h = Math.abs(h.index() - b) + 1;
                                Selection.sessions.shiftindexes = Selection.appendSessionSelection(l, h)
                            } else Selection.clearSessionsTable(), Selection.sessions.mousedown_row =
                                h.index(), Selection.sessions.lastclickedrow = h.index(), Selection.appendSessionSelection(h.index(), 1);
                            Selection.didClickDateColumnLast = !1
                        }
                        Selection.updateDateHighlighting();
                        n && Selection.updateTableSelectionColor();
                        Selection.reflectChangedSessionSelection()
                    } else if (k.closest("#tasks-table").get(0)) {
                        n = "sessions" == Selection.keyTable();
                        l && n || Selection.setKeyTable("tasks");
                        if (0 == k.closest("td").index()) Selection.clearTasksTable(), Selection.tasks.mousedown_row = h.index(), Selection.tasks.lastclickedrow = h.index(),
                            Selection.appendTaskSelection(h.index(), 1), h = k.closest("td").attr("project"), Selection.setProjectHighlighted(h, !0);
                        else if (l) h.hasClass("tr-selected") ? Selection.removeTaskSelection(h.index(), 1) : Selection.appendTaskSelection(h.index(), 1), Selection.tasks.lastclickedrow = h.index(), Selection.tasks.shiftindexes = [];
                        else if (b.shiftKey && Selection.tasks.indexes.length) {
                            b = Selection.tasks.lastclickedrow;
                            if (-1 == b) return;
                            l = Selection.tasks.shiftindexes;
                            Selection.removeTaskSelectionIndexes(l);
                            l = Math.min(h.index(),
                                b);
                            h = Math.abs(h.index() - b) + 1;
                            Selection.tasks.shiftindexes = Selection.appendTaskSelection(l, h)
                        } else Selection.clearTasksTable(), Selection.tasks.mousedown_row = h.index(), Selection.tasks.lastclickedrow = h.index(), Selection.appendTaskSelection(h.index(), 1);
                        n && Selection.updateTableSelectionColor();
                        Selection.readTableSelectionsIntoStorage();
                        Tables.sumTables();
                        Tables._updateTableFooters()
                    } else "BODY" == k.prop("tagName") ? e() : "TD" != k.prop("tagName") || k.closest(".table-container").length || k.closest("#top-left-header").length ||
                        k.closest("#top-right-header").length || !Selection.selectedSids().length && !Selection.selectedTaskTypes().length || e()
                }
            }
        });
        $("#sessions-table").mouseover(function (b) {
            var e = !1,
                k = $(b.target).closest("td");
            if (0 == k.index()) {
                var h = Selection.days.mousedown_row; - 1 != h && (k = $(b.target).closest("td"), b = k.closest("tr").index(), Selection.setRangeHighlighted(h, b, !0), Selection.days.mouseover_row = b, e = !0)
            } else if (h = Selection.sessions.mousedown_row, -1 != h) {
                b = $(b.target).closest("tr").index();
                var l = Math.min(h, b),
                    n = Math.max(h,
                        b);
                $("#sessions-table tr:visible").each(function (b) {
                    $(this).toggleClass("tr-selected", b >= l && b <= n)
                });
                Selection.updateDateHighlighting();
                Selection.sessions.mouseover_row = b;
                e = !0
            }
            e && (Tables.renderTasksTable(), Tables.sumTables(), Tables.updateHeadersAndFooters())
        });
        $("#tasks-table").mouseover(function (b) {
            var e = !1,
                k = $(b.target).closest("td");
            if (0 == k.index()) {
                var h = Selection.tasks.mousedown_row; - 1 != h && (Selection.setProjectHighlighted(k.attr("project"), !0), Selection.tasks.mouseover_row = l, e = !0)
            } else if (h = Selection.tasks.mousedown_row,
                -1 != h) {
                var l = $(b.target).closest("tr").index(),
                    n = Math.min(h, l),
                    p = Math.max(h, l);
                $("#tasks-table tr:visible").each(function (b) {
                    $(this).toggleClass("tr-selected", b >= n && b <= p)
                });
                Selection.tasks.mouseover_row = l;
                e = !0
            }
            e && (Tables.sumTables(), Tables._updateTableFooters())
        });
        $(document.body).mouseup(e);
        $(document.body).mouseleave(e);
        this.clearSessionsTable();
        this.clearTasksTable()
    },
    advanceSelectedSession: function (b, e) {
        var f = $("#sessions-table tr.tr-selected:visible"),
            f = f.eq(0 >= b ? 0 : f.length - 1).attr(SESSION_SID);
        if (!f) return null;
        var f = Tables.neighboringSessionsForSession(Cache.getSession(f)),
            g = Cache.activeSessionId();
        if (0 < b && f[1])
            if (f[1] = Cache.getSession(f[1]), e && g === f[1].sid) Tables.scrollSessionToVisible(f[1]);
            else return Tables.update({
                reason: "advancing selected session by " + b,
                hsessions: Cache.sessionsMapWithSession(f[1])
            }), f[1];
        else if (0 >= b && f[0])
            if (f[0] = Cache.getSession(f[0]), e && a && a.sid == f[0]) Tables.scrollSessionToVisible(f[0]);
            else return Tables.update({
                    reason: "advancing selected session by " + b,
                    hsessions: Cache.sessionsMapWithSession(f[0])
                }),
                f[0];
        return null
    },
    advanceSelectedTask: function (b) {
        var e = Selection.selectedTaskIndexes();
        if (e.length) {
            var f = $("#tasks-table tr:visible"),
                g = f.length,
                e = b ? e[e.length - 1] : e[0],
                k = e + (b ? 1 : -1);
            0 <= k && k < g && (Selection.clearTasksTable(), Selection.appendTaskSelection(b ? e + 1 : e - 1, 1), Selection.readTableSelectionsIntoStorage(), Tables.sumTables(), Tables._updateTableFooters(), Tables.scrollTaskToVisible(f.eq(k).data("tasktype")))
        }
    },
    appendSessionSelection: function (b, e) {
        for (var f = [], g = b; g < b + e; g++) f.push(g);
        return this.appendSessionSelectionIndexes(f)
    },
    appendSessionSelectionIndexes: function (b) {
        for (var e = $("#sessions-table tr:visible"), f = 0; f < b.length; f++) - 1 == Selection.sessions.indexes.indexOf(b[f]) && Selection.sessions.indexes.push(b[f]), e.eq(b[f]).addClass("tr-selected"), e.eq(b[f]).removeClass("inactive");
        return b
    },
    appendTaskSelection: function (b, e) {
        for (var f = [], g = b; g < b + e; g++) f.push(g);
        return this.appendTaskSelectionIndexes(f)
    },
    appendTaskSelectionIndexes: function (b) {
        for (var e = $("#tasks-table tr:visible"), f = 0; f < b.length; f++) - 1 == Selection.tasks.indexes.indexOf(b[f]) &&
            Selection.tasks.indexes.push(b[f]), e.eq(b[f]).addClass("tr-selected"), e.eq(b[f]).removeClass("inactive");
        return b
    },
    clearSessionsTable: function () {
        $("#sessions-table tr").removeClass("tr-selected inactive");
        Selection.sessions.mousedown_row = Selection.sessions.mouseover_row = -1;
        Selection.sessions.lastclickedrow = -1;
        Selection.sessions.shiftindexes = [];
        Selection.sessions.indexes = [];
        Selection.days.mousedown_row = Selection.days.mouseover_row = -1;
        Selection.days.lastclicked_row = -1
    },
    clearTasksTable: function () {
        $("#tasks-table tr").removeClass("tr-selected inactive");
        Selection.tasks.mousedown_row = Selection.tasks.mouseover_row = -1;
        Selection.tasks.lastclickedrow = -1;
        Selection.tasks.shiftindexes = [];
        Selection.tasks.indexes = []
    },
    keyTable: function () {
        return Selection.winStore("key-table") || ""
    },
    recalcSessionSelectionOnMouseup: function () {
        var b = Selection.sessions.mousedown_row,
            e = Selection.sessions.mouseover_row;
        Selection.sessions.mousedown_row = Selection.sessions.mouseover_row = -1;
        Selection.days.mousedown_row = Selection.days.mouseover_row = -1;
        Selection.sessions.indexes = [];
        if (-1 !=
            b || -1 != e) - 1 == b && -1 != e ? this.appendSessionSelection(e, 1) : -1 != b && -1 == e ? this.appendSessionSelection(b, 1) : this.appendSessionSelection(Math.min(b, e), Math.abs(b - e) + 1)
    },
    recalcTaskSelectionOnMouseup: function () {
        var b = Selection.tasks.mousedown_row,
            e = Selection.tasks.mouseover_row;
        Selection.tasks.mousedown_row = Selection.tasks.mouseover_row = -1;
        Selection.tasks.indexes = []; - 1 == b && -1 == e ? console.log("Invalid task selection") : -1 == b && -1 != e ? this.appendTaskSelection(e, 1) : -1 != b && -1 == e ? this.appendTaskSelection(b, 1) : this.appendTaskSelection(Math.min(b,
            e), Math.abs(b - e) + 1)
    },
    readTableSelectionsIntoStorage: function () {
        var b = Selection.selectedSids();
        Selection.winStore("selected-sids", b.join("`"));
        b = Selection.selectedTaskTypes();
        Selection.winStore("selected-task-types", b.join("`"))
    },
    removeSessionSelection: function (b, e) {
        for (var f = [], g = b; g < b + e; g++) f.push(g);
        return this.removeSessionSelectionIndexes(f)
    },
    removeSessionSelectionIndexes: function (b) {
        for (var e = $("#sessions-table tr:visible"), f = 0; f < b.length; f++) {
            var g = Selection.sessions.indexes.indexOf(b[f]); - 1 !=
                g && Selection.sessions.indexes.splice(g, 1);
            e.eq(b[f]).removeClass("tr-selected")
        }
        return b
    },
    removeTaskSelection: function (b, e) {
        for (var f = [], g = b; g < b + e; g++) f.push(g);
        return this.removeTaskSelectionIndexes(f)
    },
    removeTaskSelectionIndexes: function (b) {
        for (var e = $("#tasks-table tr:visible"), f = 0; f < b.length; f++) {
            var g = Selection.tasks.indexes.indexOf(b[f]); - 1 != g && Selection.tasks.indexes.splice(g, 1);
            e.eq(b[f]).removeClass("tr-selected")
        }
        return b
    },
    reset: function () {
        window.sessionStorage.setItem("prefs", "{}")
    },
    selectAllSessions: function () {
        if ("tasks" ==
            Selection.keyTable()) {
            var b = $("#tasks-table tr:visible");
            Selection.appendTaskSelection(0, b.length)
        } else b = $("#sessions-table tr:visible"), Selection.appendSessionSelection(0, b.length);
        Selection.readTableSelectionsIntoStorage();
        Tables.update({
            reason: "selected all sessions"
        })
    },
    selectedSessionsOrdered: function () {
        var b = [];
        $("#sessions-table tr.tr-selected:visible").each(function (e) {
            (e = $(this).attr("data-sid")) && b.push(e)
        });
        var e = Cache.getSessions(b);
        e.sort(function (e, g) {
            return b.indexOf(e.sid) < b.indexOf(g.sid) ?
                -1 : 1
        });
        return e
    },
    selectedSids: function (b) {
        if (b) return b = Selection.winStore("selected-sids") || "", b.length ? b.split("`") : "";
        var e = [];
        $("#sessions-table tr:visible.tr-selected").each(function (b) {
            e.push($(this).attr("data-sid"))
        });
        return e
    },
    selectedSmap: function (b) {
        b = Selection.selectedSids();
        return Cache.sessionsMapWithSessions(Cache.getSessions(b))
    },
    selectedTaskIndexes: function () {
        var b = [];
        $("#tasks-table tr.tr-selected:visible").each(function (e) {
            b.push($(this).index())
        });
        return b
    },
    selectedTaskTypes: function (b) {
        if (b) return b =
            Selection.winStore("selected-task-types") || "", b.length ? b.split("`") : "";
        var e = [];
        $("#tasks-table tr.tr-selected:visible").each(function (b) {
            e.push($(this).attr("data-tasktype"))
        });
        return e
    },
    setKeyTable: function (b) {
        Selection.winStore("key-table", b)
    },
    setSessionSelection: function (b) {
        this.setKeyTable("sessions");
        $("#sessions-table tr:visible").each(function (e) {
            $(this).toggleClass("tr-selected", -1 != b.indexOf(e));
            $(this).removeClass("inactive")
        });
        this.readTableSelectionsIntoStorage()
    },
    setTaskTypeSelection: function (b) {
        this.setKeyTable("tasks");
        $("#tasks-table tr:visible").each(function (e) {
            $(this).toggleClass("tr-selected", -1 != b.indexOf(e));
            $(this).removeClass("inactive")
        });
        this.readTableSelectionsIntoStorage()
    },
    winStore: function (b, e) {
        var f = window.localStorage.getItem("prefs") || "{}",
            g = Selection.windowId,
            f = JSON.parse(f);
        f[g] || (f[g] = {});
        f[g].lastAccessed = Date.now();
        "undefined" !== typeof e && (null === e ? delete f[g][b] : f[g][b] = e, window.localStorage.setItem("prefs", JSON.stringify(f)));
        return f[g][b]
    },
    updateTableSelectionColor: function () {
        "tasks" ==
        Selection.keyTable() ? ($("#sessions-table tr.tr-selected:visible, #sessions-footer td.td-selected:visible").addClass("inactive"), $("#tasks-table tr.tr-selected:visible, #tasks-footer td.td-selected:visible").removeClass("inactive")) : ($("#sessions-table tr.tr-selected:visible, #sessions-footer td.td-selected:visible").removeClass("inactive"), $("#tasks-table tr.tr-selected:visible, #tasks-footer td.td-selected:visible").addClass("inactive"))
    },
    writeSmapToStorage: function (b) {
        Selection.setKeyTable("sessions");
        var e = [],
            f;
        for (f in b) e.push(f);
        Selection.winStore("selected-sids", e.join("`"));
        Selection.didClickDateColumnLast = !1
    },
    writeTaskTypesToStorage: function (b) {
        Selection.setKeyTable("tasks");
        Selection.winStore("selected-task-types", b.join("`"))
    },
    windowId: 1,
    sessions: {},
    tasks: {},
    days: {},
    appendDateSelection: function (b) {
        var e = b.attr("title"),
            f = [];
        $("#sessions-table tr:visible").each(function (b) {
            e == $(this).find("td:first-child").attr("title") && f.push(b)
        });
        this.appendSessionSelectionIndexes(f);
        this.updateDateHighlighting()
    },
    isDateHighlighted: function (b) {
        b = $('#sessions-table td:first-child[title="' + b + '"]');
        for (var e = 0; e < b.length; e++)
            if (b.eq(e).hasClass("noHighlight")) return !1;
        return !0
    },
    setDateHighlighted: function (b, e) {
        var f = $('#sessions-table td:first-child[title="' + b + '"]');
        f.each(function () {
            $(this).toggleClass("noHighlight", !e);
            $(this).parent().toggleClass("tr-selected", !!e)
        });
        return f
    },
    setProjectHighlighted: function (b, e) {
        $('#tasks-table td:first-child[project="' + b + '"]').each(function () {
            $(this).parent().toggleClass("tr-selected",
                !!e)
        })
    },
    setRangeHighlighted: function (b, e, f) {
        var g = Math.min(b, e),
            k = Math.max(b, e),
            h = {};
        $("#sessions-table tr:visible").each(function (b) {
            b = b >= g && b <= k;
            $(this).toggleClass("tr-selected", b);
            b && (h[$(this).find("td:first-child").attr("title")] = 1)
        });
        $.each(h, function (b) {
            Selection.setDateHighlighted(b, !!f)
        })
    },
    toggleDateHighlighted: function (b) {
        this.setDateHighlighted(b, !this.isDateHighlighted(b))
    },
    updateDateHighlighting: function () {
        var b = "",
            e = [],
            f = !0;
        $("#sessions-table tr:visible").each(function (g) {
            g = $(this).find("td:first-child");
            var k = g.attr("title");
            k != b && (b && $.each(e, function (b, e) {
                $(e).toggleClass("noHighlight", !f)
            }), b = k, e = [], f = !0);
            $(this).hasClass("tr-selected") || (f = !1);
            e.push(g)
        });
        $.each(e, function (b, e) {
            $(e).toggleClass("noHighlight", !f)
        })
    },
    advanceKeyTableUp: function () {
        if ("tasks" != Selection.keyTable())
            if (Selection.didClickDateColumnLast) {
                var b = $("#sessions-table tr:visible.tr-selected").eq(0).prev();
                if (b.is(":visible")) {
                    b = b.children().eq("0").attr("title");
                    Selection.clearSessionsTable();
                    b = Selection.setDateHighlighted(b,
                        !0);
                    Selection.reflectChangedSessionSelection();
                    var e = [];
                    b.each(function () {
                        e.push($(this).parent().attr("data-sid"))
                    });
                    Tables.scrollSessionsToVisible(Cache.getSessionsMap(e))
                }
            } else Selection.advanceSelectedSession(0);
        else Selection.advanceSelectedTask(0)
    },
    advanceKeyTableDown: function () {
        if ("tasks" != Selection.keyTable())
            if (Selection.didClickDateColumnLast) {
                var b = $("#sessions-table tr.tr-selected:visible").last().next();
                if (b.is(":visible")) {
                    b = b.children().eq(0).attr("title");
                    Selection.clearSessionsTable();
                    b = Selection.setDateHighlighted(b, !0);
                    Selection.reflectChangedSessionSelection();
                    var e = [];
                    b.each(function () {
                        e.push($(this).parent().attr("data-sid"))
                    });
                    Tables.scrollSessionsToVisible(Cache.getSessionsMap(e))
                }
            } else Selection.advanceSelectedSession(1);
        else Selection.advanceSelectedTask(1)
    },
    reflectChangedSessionSelection: function () {
        Selection.readTableSelectionsIntoStorage();
        Tables.renderTasksTable();
        Tables.sumTables();
        Tables.updateHeadersAndFooters()
    }
};
var Tables = {
    initialize: function () {
        chrome.runtime.onMessage.addListener(function (b, e, f) {
            "close-summary-timer" == b.method ? Popout.hideTimerWindow() : "did-begin-login" == b.method ? (Options.setTablesShown(!1), $("#login-content").hide(), $("#connecting-content").show()) : "did-begin-session" == b.method ? (e = Cache.sessionsMapWithSession(b.session), Period.highlightPeriodForSessions(e), Cache.addSessions(e), Cache.setActiveSession(b.session), Tables.update({
                    reason: "user began session",
                    fetch: !1,
                    hsessions: e,
                    callback: function () {
                        Cache.isEditingActiveSession() &&
                            $("#edit-dialog").dialog("close")
                    }
                }), Tables._updateHeaderTotals()) : "did-end-session" == b.method ? (e = Cache.sessionsMapWithSession(b.session), Period.highlightPeriodForSessions(e), b.willDelete ? Cache.removeSessions(e) : Cache.addSessions(e), Cache.setActiveSession(null), Tables.update({
                    reason: "user ended session",
                    fetch: !1,
                    hsessions: e,
                    callback: function () {
                        b.willDelete || "leapforce" != Prefs.get("user-vendor") || Prefs.get("has-seen-invoice") ? b.willDelete || "lionbridge" != Prefs.get("user-vendor") || Prefs.get("has-seen-timesheet") ||
                            $("#timesheet-reminder").show() : $("#invoice-reminder").show()
                    }
                }), Tables._updateHeaderTotals()) : "refresh-tables" == b.method ? Tables.update({
                    fetch: !0,
                    reason: b.reason,
                    scrollToBottom: !0
                }) : "show-options-dialog" == b.method ? "reload" == b.pane ? Options.showDialog($('#options-tabs td:contains("Reload")').index(), b.section) : "advanced" == b.pane ? Options.showDialog($('#options-tabs td:contains("Advanced")').index()) : "goals" == b.pane ? Options.showDialog($('#options-tabs td:contains("Goals")').index()) : b.from_controller &&
                $(".options-item").first().mouseup() : "update-active-session" == b.method ? (Cache.setActiveSession(b.session), Tables._updateRowWithSid(b.session.sid), b.didSubmit && Tables.update(), Cache.isEditingActiveSession(), Tables._updateHeaderTotals()) : "update-was-requested" == b.method && Tables.update({
                    fetch: !0,
                    reason: b.reason ? b.reason : "update requested",
                    scrollToBottom: !b.isLocal
                })
        });
        $(window).resize(function () {
            Tables.scrollSessionsToBottom();
            Tables.sizeTablesToFit();
            Tables._updateExpansionLinks()
        });
        $("#expand-sessions-item").click(function () {
            $sessionsBodyContainer.hasClass("expanded") ?
                ($sessionsBodyContainer.removeClass("expanded"), Tables.scrollSessionsToBottom()) : $sessionsBodyContainer.addClass("expanded");
            Tables.sizeTablesToFit();
            Tables.scrollSessionsToBottom();
            Tables._updateExpansionLinks()
        });
        $expandTasksItem.click(function () {
            $tasksBodyContainer.toggleClass("expanded");
            Tables.sizeTablesToFit();
            Tables._updateExpansionLinks()
        });
        $(".count-item").mouseup(Tables.showCount);
        $sessionsBodyContainer.dblclick(function (b) {
            if (!b.metaKey && !b.ctrlKey) {
                var e = $(b.target).closest("tr:visible").attr("data-sid");
                if (e = Cache.getSession(e)) {
                    b = $(b.target);
                    var f = b.closest("td");
                    5 == f.index() && $zeroSessionButton.is(":visible") ? Edits.zeroOutSelectedSessions() : (0 == f.index() ? b = f : 1 == f.index() && (b = "SPAN" == b.prop("tagName") && 0 == b.index() ? f.children().first() : f.children().last()), Edits.beginEditingSession(e, b))
                } else console.error("Double-clicked session not found")
            }
        });
        $("#total-session-duration, #session-duration-cell").click(function () {
            $(".session-time-format-item:not(.checkmark)").eq(0).mouseup()
        });
        $("#total-session-surplus, #session-surplus-cell").click(function () {
            $(".session-productivity-item:not(.checkmark)").eq(0).mouseup()
        });
        $("#total-session-earnings, #session-earnings-cell").click(function () {
            $("#convert-currency-menu-item").mouseup()
        });
        $("#total-task-speed, #task-speed-cell").click(function () {
            $(".task-productivity-item:not(.checkmark)").eq(0).mouseup()
        });
        $("#total-task-duration, #task-duration-cell").click(function () {
            $(".task-time-format-item:not(.checkmark)").eq(0).mouseup()
        });
        $("#total-task-aet, #task-allotted-cell").click(function () {
            $(".task-time-format-item:not(.checkmark)").eq(0).mouseup()
        });
        $("#total-task-count, #task-count-cell").click(function () {
            $(".task-count-format-item:not(.checkmark)").eq(0).mouseup()
        });
        $(".time-zone-item").parent().click(function () {
            "hidden" != $(this).find(".time-zone-item").css("visibility") && (Prefs.set("show-pacific-time", !Prefs.get("show-pacific-time")), Tables.update())
        });
        $tasksBodyContainer.dblclick(function (b) {
            if (!b.metaKey && !b.ctrlKey) {
                var e = $(b.target),
                    f = $(b.target).closest("tr:visible").attr("data-tasktype");
                b = Cache.getSessionsWithTaskType(f);
                if (b.length) {
                    var g = b[b.length - 1];
                    g && (b = Cache.activeSessionId(), g.sid != b ? e.closest("tr").attr("data-isnegative") && 5 == e.index() ? Edits.Tasks.zeroOutSelectedTasks() :
                        (e = e.closest("td"), Tables.update({
                            hsessions: Cache.sessionsMapWithSessions([g]),
                            htypes: [f],
                            callback: function () {
                                Edits.Tasks.editTasksForSession(g, f, e, !1, !1)
                            }
                        })) : Utils.showGenericPrompt({
                            title: "Could Not Edit Tasks",
                            message: "End the active session to edit its tasks.",
                            buttons: [{
                                text: "OK",
                                width: 100,
                                click: function () {
                                    $(this).dialog("close")
                                }
                            }]
                        }))
                }
            }
        });
        $("#sessions-dropdown").on("show", function () {
            var b = !!Prefs.get("is-active"),
                e = Tables.resumableSelectedSession(),
                f = e && e.sid,
                g = Prefs.get("resumable") && Prefs.get("resumable").sid,
                f = !b && !(!g || g == f),
                e = !b && !!e;
            $("#start-item").parent().toggleClass("hidden", b);
            $("#stop-item").parent().toggleClass("hidden", !b);
            $("#resume-item").parent().toggleClass("hidden", !f);
            $("#resume-selected-item").parent().toggleClass("hidden", !e);
            $(".if-resume").toggle(f || e);
            $("#add-item").toggleClass("dropdown-disabled", !$addSessionButton.is(":visible"));
            $("#delete-item").toggleClass("dropdown-disabled", !$deleteSessionButton.is(":visible"));
            $("#edit-item").toggleClass("dropdown-disabled", !$editSessionButton.is(":visible"));
            $("#join-item").toggleClass("dropdown-disabled", !$joinSessionButton.is(":visible"));
            $("#zero-item").toggleClass("dropdown-disabled", !$zeroSessionButton.is(":visible"))
        });
        $("#tasks-dropdown").on("show", function () {
            $("#add-tasks-menu-item").toggleClass("dropdown-disabled", !$addTaskButton.is(":visible"));
            $("#edit-tasks-menu-item").toggleClass("dropdown-disabled", !$deleteTaskButton.is(":visible"));
            $("#delete-tasks-menu-item").toggleClass("dropdown-disabled", !$editTaskButton.is(":visible"));
            $("#zero-tasks-menu-item").toggleClass("dropdown-disabled",
                !$zeroTaskButton.is(":visible"))
        });
        $(".main-action").click(function () {
            Prefs.get("is-active") ? chrome.runtime.sendMessage({
                method: "stop-session"
            }) : chrome.runtime.sendMessage({
                method: "start-session"
            })
        });
        Prefs.monitor("datastore-busy", Tables.updateSpinner);
        Prefs.monitor("is-active", Tables._updateMainActions);
        Prefs.monitor("resumable", Tables._updateMainActions);
        Prefs.monitor("totals", Tables._updateHeaderTotals);
        Tables._updateHeaderTotals()
    },
    highlightTaskTypes: function (b) {
        Tables.selectTaskTypes(b);
        Selection.writeTaskTypesToStorage(b);
        Tables.updateHeadersAndFooters()
    },
    mergeSessionRowWithValues: function (b, e, f) {
        b.children().each(function (b) {
            var k = $(this);
            if (0 == b) {
                var h = e[b].split(" ");
                h[0] || (h[0] = "");
                h[1] || (h[1] = "");
                var l = k.children();
                l.eq(0).text() != h[0] && l.eq(0).text(h[0]);
                l.eq(1).text() != h[1] && l.eq(1).text(h[1]);
                k.prop("title", e[9])
            } else 1 == b ? (l = k.children(), l.eq(0).text() != e[b] && l.eq(0).text(e[b]).prop("title", e[b]), l.eq(1).text() != e[8] && l.eq(1).text(e[8] || "").prop("title", e[8] || ""), k.toggleClass("has-note", !!e[8])) : k.text() !=
                e[b] && k.text(e[b]);
            5 == b ? Tables.hasMixedProjects && 0 != e[11] ? k.css("color", "DarkGray") : k.css("color", e[10]) : 6 == b && "undefined" !== typeof k.formatCurrency && k.formatCurrency({
                region: Options.currentRegion(),
                symbol: ""
            });
            !f || 4 != b && 5 != b || (b = e[b].replace(":", " "), k.text() != b && k.text(b))
        });
        b.attr("data-sid", e[7])
    },
    neighboringSessionsForSession: function (b) {
        var e = -1,
            f = $("#sessions-table tr:visible");
        f.each(function (f) {
            if ($(this).attr("data-sid") == b.sid) return e = f, !1
        });
        return -1 != e ? [0 < e ? f.eq(e - 1).attr("data-sid") :
            null, f.eq(e + 1).attr("data-sid")
        ] : [null, null]
    },
    neighboringTasksForTask: function (b) {
        var e = -1,
            f = $("#tasks-table tr:visible");
        f.each(function (f) {
            if ($(this).attr(TASK_TYPE) == b) return e = f, !1
        });
        return -1 != e ? [0 < e ? f.eq(e - 1).attr(TASK_TYPE) : null, f.eq(e + 1).attr(TASK_TYPE)] : [null, null]
    },
    orderSessionsAccordingToTable: function (b) {
        var e = [],
            f;
        for (f in b) e.push(b[f].sid);
        $("#sessions-table tr.tr-selected:visible").each(function (b) {
            (b = $(this).attr(SESSION_SID)) && e.push(b)
        });
        b = Cache.getSessions(e);
        b.sort(Tables._sessionSorter);
        return b
    },
    removeAllRows: function () {
        $("#sessions-table, #tasks-table").empty();
        $("#sessions-footer, #tasks-footer").removeClass("bordered");
        Selection.clearSessionsTable();
        Selection.clearTasksTable();
        Selection.reset();
        Cache.clear();
        Tables.sumTables();
        Tables.updateHeadersAndFooters();
        $("#show-months-item").removeClass("enabled").addClass("disabled");
        $("#left-month-stepper").removeClass("enabled").addClass("disabled");
        $("#right-month-stepper").removeClass("enabled").addClass("disabled")
    },
    renderTasksTable: function () {
        function b(b,
            e, f) {
            var g = Utils.noteForDeviceId(e[11]);
            b.children().each(function (b) {
                var h = $(this);
                if (0 == b) {
                    var k = h.children();
                    k.eq(0).text(f ? e[12] : "");
                    k.eq(1).text(e[b]);
                    h.attr("project", e[12])
                } else 1 == b ? (k = h.children(), k.eq(0).text(e[b]), k.eq(1).text(g), h.toggleClass("has-note", !!g)) : h.text() != e[b] && h.text(e[b]);
                5 == b && h.css("color", e[7])
            });
            b.attr("data-count", e[0].toString()).attr("data-tasktype", e[8]).toggleClass("tr-selected", e[9]);
            e[10] ? b.attr("data-isnegative", !0) : b.removeAttr("data-isnegative")
        }
        var e = Cache.getActionableSessions(!1),
            f = 0,
            g = Selection.selectedTaskTypes(!0),
            k = "minutes" == Prefs.get("task-time-format"),
            h = "surplus" == Prefs.get("task-productivity-mode"),
            l = function () {
                for (var b = {}, n = 0; n < e.length; n++)
                    for (var l in e[n].types) {
                        b[l] || (b[l] = [0, 0, 0]);
                        var m = e[n].types[l][1],
                            p = e[n].types[l][2];
                        b[l][0] += e[n].types[l][0];
                        b[l][1] += m;
                        b[l][2] += p;
                        f += m
                    }
                l = [];
                m = Object.keys(b).sort(function (b, e) {
                    var f = b.split(","),
                        g = e.split(",");
                    return f[0] != g[0] ? f[0] < g[0] ? -1 : 1 : parseInt(f[1], 10) < parseInt(g[1], 10) ? -1 : 1
                });
                for (n = 0; n < m.length; n++) {
                    var p = m[n],
                        q = p.split(","),
                        u = q[0],
                        r = b[p],
                        w = 1 < q.length ? 1E3 * q[1] : r[1] / r[0],
                        z = h ? Utils.surplusFromValues(r[1], r[2]) : Utils.speedFromValues(r[1], r[2]),
                        I = (Math.floor(1E3 * (f ? r[1] / f : 0)) / 10).toFixed(1),
                        J = -1 != $.inArray(p, g),
                        M = r[2] > r[1],
                        q = 2 < q.length ? parseInt(q[2], 10) : 0,
                        K = "EXP",
                        E = u.toLowerCase();
                    0 == E.indexOf("rr") ? K = "RR" : 0 == E.indexOf("sxs") && (K = "SxS");
                    l.push([r[0], u, Utils.formattedTime(w), Utils.formattedTime(r[1], 0, k), Utils.formattedTime(r[2], 0, k), z, I, Utils.colorFromValues(r[1], r[2]), p, J, M, q, K])
                }
                return l
            }(),
            n = 0,
            p = "tasks" ==
            Selection.keyTable(),
            m = null;
        $("#tasks-table tr").each(function (e) {
            e = $(this);
            if (n < l.length) {
                var f = !1,
                    g = l[n++],
                    h = e.find("td").eq(0);
                m == g[12] ? h.removeClass("top-border") : (f = !0, m = g[12], 0 < n && h.addClass("top-border"));
                b(e, g, f);
                e.toggleClass("inactive", !p).show()
            } else e.hide()
        });
        for (var q = [], w = n; w < l.length; w++) {
            var u = [],
                r;
            r = $(document.createElement("td"));
            0 == w && r.width(60);
            r.append('<span style="float:left"></span><span></span>');
            u.push(r);
            r = $(document.createElement("td"));
            0 == w && r.width(219);
            r.append('<span></span><span class="note"></span>');
            u.push(r);
            r = $(document.createElement("td"));
            0 == w && r.width(40);
            u.push(r);
            r = $(document.createElement("td"));
            0 == w && r.width(60);
            u.push(r);
            r = $(document.createElement("td"));
            0 == w && r.width(60);
            u.push(r);
            r = $(document.createElement("td"));
            0 == w && r.width(60);
            u.push(r);
            r = $(document.createElement("td"));
            u.push(r);
            r = l[w];
            var z = !1;
            m == r[12] ? u[0].removeClass("top-border") : (z = !0, m = r[12], u[0].addClass("top-border"));
            u[0].css("border-right", "1px solid DarkGray");
            u = $(document.createElement("tr")).attr("data-count", r[0].toString()).attr("data-tasktype",
                r[8]).toggleClass("tr-selected", r[9]).toggleClass("inactive", !p).append(u);
            b(u, r, z);
            q.push(u);
            n++
        }
        q.length && $("#tasks-table").append(q)
    },
    resumableSelectedSession: function () {
        if (!Prefs.get("is-active")) {
            var b = $("#sessions-table tr:visible.tr-selected");
            if (1 == b.length && (b = Cache.getSession(b.eq(0).attr("data-sid")))) {
                var e = Date.now();
                if (0 <= e - b.stop && 432E5 > e - b.stop) return b
            }
        }
        return null
    },
    scrollSessionToVisible: function (b) {
        var e = $('#sessions-table tr[data-sid="' + b.sid + '"]:visible').eq(0);
        e.length && (b = $sessionsBodyContainer,
            e.position().top < b.position().top ? (e = b.position().top - e.position().top + .8 * b.height(), b.scrollTop(b.scrollTop() - e)) : e.position().top + e.height() > b.position().top + b.height() && (e = b.position().top + e.position().top - b.height(), b.scrollTop(b.scrollTop() + e)))
    },
    scrollSessionsToVisible: function (b) {
        b = Tables.orderSessionsAccordingToTable(b);
        b.length && (Tables.scrollSessionToVisible(b[b.length - 1]), Tables.scrollSessionToVisible(b[0]))
    },
    scrollTaskToVisible: function (b) {
        var e = $('#tasks-table tr[data-tasktype="' + b + '"]:visible').eq(0);
        e.length && (b = $tasksBodyContainer, e.position().top < b.position().top ? (e = b.position().top - e.position().top + .9 * b.height(), b.scrollTop(b.scrollTop() - e)) : e.position().top + e.height() > b.position().top + b.height() && (e = b.position().top + e.position().top - b.height(), b.scrollTop(b.scrollTop() + e)))
    },
    scrollSessionsToBottom: function () {
        var b = $sessionsBodyContainer.prop("scrollHeight");
        $sessionsBodyContainer.scrollTop(b)
    },
    scrollSessionsToTop: function () {
        $sessionsBodyContainer.scrollTop(0)
    },
    scrollSessionsUp: function () {
        var b =
            $sessionsBodyContainer;
        b.scrollTop(b.scrollTop() - b.height())
    },
    scrollSessionsDown: function () {
        var b = $sessionsBodyContainer;
        b.scrollTop(b.scrollTop() + b.height())
    },
    selectSessions: function (b) {
        var e = [];
        $("#sessions-table tr:visible").each(function (f) {
            b[$(this).attr("data-sid")] && e.push(f)
        });
        Selection.setSessionSelection(e)
    },
    selectTaskTypes: function (b) {
        var e = [];
        $("#tasks-table tr:visible").each(function (f) {
            -1 != b.indexOf($(this).attr("data-tasktype")) && e.push(f)
        });
        Selection.setTaskTypeSelection(e)
    },
    showCount: function () {
        chrome.runtime.sendMessage({
                method: "fetch-rolling-30"
            },
            function (b) {
                if (b.error) console.error(b.error);
                else {
                    var e = $("#count-dialog");
                    e.dialog({
                        modal: !0,
                        width: "auto",
                        height: "auto",
                        title: "30-Day Task Count",
                        dialogClass: "no-close dialog",
                        resizable: !1,
                        buttons: [{
                            text: "OK",
                            width: 100,
                            click: function () {
                                e.dialog("close")
                            }
                        }],
                        open: function () {
                            $("#task-count").text(Utils.numberWithCommas(b.count));
                            $("#task-count-yukon").toggle("lionbridge" != Prefs.get("user-vendor"));
                            $("#task-count-plural").text(1 == b.count ? "" : "s");
                            $("#task-count-start").text(moment(b.head).format("MMMM Do, YYYY"));
                            $(".ui-widget-overlay.ui-front").click(function () {
                                e.dialog("close")
                            })
                        }
                    })
                }
            })
    },
    sizeTablesToFit: function (b) {
        b = $sessionsBodyContainer.is(".expanded");
        var e = $tasksBodyContainer.is(".expanded"),
            f = $(window).height();
        $sessionsBodyContainer.css("max-height", b ? "none" : Math.floor(f / 3) + "px");
        f = f - $sessionsBodyContainer.height() - 270;
        $tasksBodyContainer.css("max-height", e ? "none" : f + "px");
        b = b || e || 0 >= f;
        $(document.body).css("overflow-y", b ? "auto" : "hidden")
    },
    sumTables: function () {
        var b = Cache.getSelectedSessions(),
            e = 2 > b.length ?
            Cache.getAllDisplayedSessions() : b,
            f = {};
        $.each(b, function (b, e) {
            f[e.sid] = 1
        });
        var g = 0 < Object.keys(f).length,
            k = Cache.active_session,
            h = {};
        $("#tasks-table tr:visible.tr-selected").each(function () {
            h[$(this).attr("data-tasktype")] = 1
        });
        for (var l = 0 < Object.keys(h).length, b = {}, n = {}, p = 0; p < e.length; p++) {
            var m = e[p],
                q = Utils.localizedMoment(m.start),
                w = q.month() + "/" + q.date() + "/" + q.year();
            (q = n[w]) || (q = n[w] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            w = Tables.hasMixedProjects && 0 != (m.pid || 0);
            k && m.sid == k.sid || (q[0] += m.duration, q[8] += m.earnings,
                w ? q[9] += m.duration : (q[1] += m.surplus, q[2] = 0 == m.allotted ? q[2] + m.duration : q[2] + m.allotted));
            if (!g || f[m.sid]) {
                var m = m.types,
                    u;
                for (u in m)
                    if (!l || h[u]) q[3] += m[u][0], q[4] += m[u][1], q[5] += m[u][2], 0 == u.toLowerCase().indexOf("sxs") && (q[6] += m[u][1]), q[7] += m[u][1] - m[u][2], b[u] = 1
            }
        }
        e = [0, 0, 0, 0, 0, 0];
        u = [0, 0, 0, 0, 0, 0];
        for (p in n) e[0] += n[p][0], e[1] += n[p][1], e[2] += n[p][8], e[3] += n[p][2], e[4] += n[p][0], e[5] += n[p][9], u[0] += n[p][3], u[1] += n[p][4], u[2] += n[p][5], u[3] += n[p][6], u[4] += n[p][7];
        u[5] = Object.keys(b).length;
        Tables.sums =
            e;
        Tables.taskSums = u
    },
    update: function (b) {
        function e(e) {
            Tables.isFetching = !1;
            if (e.error) b.callback && b.callback({
                error: e.error
            });
            else {
                Prefs.set("datastore-busy", !1);
                var f = e.sessions;
                Cache.setActiveSession(e.active);
                Cache.setSessions(f, l);
                var g = {};
                $.each(f, function (b, e) {
                    var f = e.pid || 0;
                    g[f] = g[f] ? g[f] + 1 : 1
                });
                Tables.projectCounts = g;
                h(f, k);
                (e = Cache.getEditingSession()) && !f[e.sid] && ($("#add-tasks-dialog").is(":visible") && $("#add-tasks-dialog").dialog("close"), $("#edit-dialog").is(":visible") && $("#edit-dialog").dialog("close"));
                Tables._updateHeaderTotals()
            }
            Tables.updateSpinner()
        }
        b = b || {};
        var f = function (b, e) {
                var f = Selection.selectedSids(!0),
                    g = 0,
                    h = "tasks" != Selection.keyTable(),
                    k = null;
                $("#sessions-table tr").each(function (l) {
                    l = $(this);
                    if (g < b.length) {
                        var r = b[g],
                            v = Tables.valuesForSession(r, e && e.sid == r.sid),
                            y = l.find("td").eq(0);
                        k == v[0] ? (v[0] = "", y.removeClass("top-border")) : (k = v[0], 0 < g && y.addClass("top-border"));
                        Tables.mergeSessionRowWithValues(l, v);
                        r = -1 != $.inArray(r.sid, f);
                        l.toggleClass("tr-selected", r);
                        l.toggleClass("inactive",
                            !h);
                        l.show();
                        g++
                    } else l.hide()
                });
                for (var l = [], z = g; z < b.length; z++) {
                    var y = [],
                        v;
                    v = $(document.createElement("td"));
                    0 == z && v.width(60);
                    v.append('<span style="float:left"></span><span></span>');
                    y.push(v);
                    v = $(document.createElement("td"));
                    0 == z && v.width(205);
                    v.append('<span></span><span class="note"></span>');
                    y.push(v);
                    v = $(document.createElement("td"));
                    0 == z && v.width(54);
                    y.push(v);
                    v = $(document.createElement("td"));
                    0 == z && v.width(60);
                    y.push(v);
                    v = $(document.createElement("td"));
                    0 == z && v.width(60);
                    y.push(v);
                    v = $(document.createElement("td"));
                    0 == z && v.width(60);
                    y.push(v);
                    v = $(document.createElement("td"));
                    y.push(v);
                    var x = b[z],
                        C = -1 != $.inArray(x.sid, f);
                    v = $(document.createElement("tr"));
                    v.attr("data-sid", b[z].sid).append(y).toggleClass("tr-selected", C).toggleClass("inactive", !h);
                    x = Tables.valuesForSession(x, e && e.sid == x.sid);
                    k == x[0] ? (x[0] = "", y[0].removeClass("top-border")) : (k = x[0], y[0].addClass("top-border"));
                    y[0].css("border-right", "1px solid DarkGray");
                    Tables.mergeSessionRowWithValues(v, x);
                    l.push(v);
                    g++
                }
                l.length && $("#sessions-table").append(l);
                Selection.updateDateHighlighting()
            },
            g = function (b) {
                var e = Cache.active_session;
                e && (b[e.sid] = e);
                var g = 0,
                    h = {},
                    k = Period.dateRangeForPeriod(Period.highlightedIndex()),
                    l = 4 == Period.highlightedIndex() ? Period.dateRangeForPeriod(4) : Period.dateRangeForPeriod(3),
                    r = [];
                $.each(b, function (b, e) {
                    e.start >= k[0] && e.start < k[1] && r.push(e);
                    e.start >= l[0] && e.start < l[1] && (g += e.duration, h[e.pid || 0] = 1)
                });
                Tables.hasMixedProjects = 1 < Object.keys(h).length;
                Tables.monthDuration = Tables._roundedDuration(g);
                r = r.sort(Tables._sessionSorter);
                f(r, e);
                Tables.renderTasksTable();
                Selection.readTableSelectionsIntoStorage();
                Tables.sumTables()
            },
            k = function (e) {
                Tables.sizeTablesToFit();
                e = Cache.mapOfSelectedSessions();
                b.hsessions && !b.noHighlight ? Tables.scrollSessionsToVisible(b.hsessions) : "initial render" == b.reason && Object.keys(e).length ? Tables.scrollSessionsToVisible(e) : b.scrollToBottom && Tables.scrollSessionsToBottom();
                Tables.updateHeadersAndFooters();
                b.callback && b.callback({})
            },
            h = function (e, f) {
                b.hsessions && !b.noHighlight && (Selection.writeSmapToStorage(b.hsessions),
                    Selection.setKeyTable("sessions"));
                b.htypes && !b.noHighlight && (Selection.writeTaskTypesToStorage(b.htypes), Selection.setKeyTable("tasks"));
                Options.setTablesShown(!0);
                g(e);
                Period.update();
                Tables.updateSpinner();
                f && f(e)
            };
        b.hsessions && !b.noHighlight && Period.highlightPeriodForSessions(b.hsessions);
        var l = Period.selectedMonthString();
        l != Cache.mstr && ($("#sessions-table-title").text("Loading..."), $("#expand-sessions-item").css("visibility", "hidden"), Prefs.set("datastore-busy", !0), Tables.isFetching = !0, Tables.updateSpinner(),
            b.scrollToBottom = !0, b.fetch = !0);
        b.fetch ? chrome.runtime.sendMessage({
            method: "fetch-greater-month",
            mstr: l
        }, e) : h(Cache.smap, k)
    },
    updateHeadersAndFooters: function () {
        Tables._updateTableFooters()
    },
    updateSpinner: function () {
        Prefs.get("datastore-busy") || Tables.isFetching ? SpinController.start() : SpinController.stop()
    },
    valuesForSession: function (b, e) {
        var f = moment(b.start),
            g = moment(b.stop);
        Prefs.get("show-pacific-time") && (f.tz(PACIFIC_TIMEZONE), g.tz(PACIFIC_TIMEZONE));
        var k = f.format("ddd M/DD"),
            h = f.format("M/DD/YYYY"),
            l = "minutes" == Prefs.get("session-time-format"),
            n = "speed" == Prefs.get("session-productivity-mode") ? Utils.speedFromValues(b.allotted, b.duration) : Utils.formattedTime(b.surplus, 0, l),
            p = (b.earnings / 1E3 * Options.currentExchangeRate()).toString(),
            m = Prefs.get("use-24-hour-time") ? "H:mm" : "h:mm A";
        return [k, b.name || "", f.format(m), e ? "" : g.format(m), Utils.formattedTime(b.duration, 0, l), n, p, b.sid, b.note, h, Utils.colorFromValues(b.allotted, b.duration), b.pid || 0]
    },
    _roundedDuration: function (b) {
        var e = Math.floor(b || 0) % 6E4;
        3E4 >
            e ? b -= e : b += 6E4 - e;
        return b
    },
    _sessionSorter: function (b, e) {
        return b.sid == Cache.active_session_sid ? 1 : e.sid == Cache.active_session_sid ? -1 : b.start != e.start ? b.start < e.start ? -1 : 1 : 0
    },
    _updateExpansionLinks: function () {
        var b = $sessionsBodyContainer.hasScrollBar() || $sessionsBodyContainer.hasClass("expanded");
        $expandSessionsItem.css("visibility", b ? "visible" : "hidden");
        $expandSessionsItem.find("img").attr("src", $sessionsBodyContainer.hasClass("expanded") ? "img/small-up-arrow.png" : "img/small-down-arrow.png");
        b = $tasksBodyContainer.hasScrollBar() ||
            $tasksBodyContainer.hasClass("expanded");
        $expandTasksItem.css("visibility", b ? "visible" : "hidden");
        $expandTasksItem.find("img").attr("src", $tasksBodyContainer.hasClass("expanded") ? "img/small-up-arrow.png" : "img/small-down-arrow.png")
    },
    _updateHeaderTotals: function () {
        function b(b) {
            36E5 <= b && (b = Tables._roundedDuration(b));
            var e = moment.duration(b);
            b = Math.floor(e.asHours());
            var f = e.minutes(),
                e = e.seconds();
            $headerTotalsSession.text((0 < b ? b + "h " : "") + (0 < b || 0 < f ? f + "m " : "") + (0 == b ? e + "s" : ""));
            $headerTotalsSession.css("visibility",
                "visible")
        }
        var e = Prefs.get("totals");
        if (e && e.duration) {
            var f = Cache.active_session && Cache.active_session.duration || 0,
                g = Tables._roundedDuration((e.duration.day || 0) + f),
                k = Tables._roundedDuration(e.duration.yday || 0),
                h = Tables._roundedDuration((e.duration.period || 0) + f),
                l = Tables._roundedDuration((e.duration.week || 0) + f);
            Tables._roundedDuration((e.duration.month || 0) + f);
            f = moment.duration(g);
            e = Math.floor(f.asHours());
            f = f.minutes();
            $headerTotals.eq(0).text((0 < e ? e + "h " : "") + f + "m");
            f = moment.duration(k);
            e = Math.floor(f.asHours());
            f = f.minutes();
            $headerTotals.eq(1).text((0 < e ? e + "h " : "") + f + "m");
            f = moment.duration(l);
            e = Math.floor(f.asHours());
            f = f.minutes();
            $headerTotals.eq(2).text((0 < e ? e + "h " : "") + f + "m");
            f = moment.duration(h);
            e = Math.floor(f.asHours());
            f = f.minutes();
            $headerTotals.eq(3).text((0 < e ? e + "h " : "") + f + "m")
        }
        Cache.active_session ? (b(Cache.active_session.duration), $headerTotalsSession.css("visibility", "visible")) : (k = Prefs.get("resumable") && Prefs.get("resumable").session) ? (b(k.duration), $headerTotalsSession.css("visibility", "visible")) :
            $headerTotalsSession.css("visibility", "hidden");
        4 == Period.highlightedIndex() ? (f = moment.duration(Tables.monthDuration), e = Math.floor(f.asHours()), f = f.minutes(), $headerTotals.eq(4).text((0 < e ? e + "h " : "") + f + "m"), $headerTotals.eq(4).css("visibility", "visible")) : $headerTotals.eq(4).css("visibility", "hidden")
    },
    _updateMainActions: function () {
        var b = !!Prefs.get("is-active");
        $startAction.toggle(!b);
        $stopAction.toggle(b);
        $startActionLabel.text(Prefs.get("resumable") ? "Resume" : "Start");
        Tables._updateHeaderTotals()
    },
    _updateRowWithSid: function (b) {
        var e = Cache.getSession(b);
        if (e && ($tr = $('#sessions-table tr:visible[data-sid="' + b + '"]').eq(0), $tr.length)) {
            var f = Cache.active_session;
            b = !1;
            if (f && !f.task && 0 != (Prefs.get("session-timing-mode") || 0)) {
                var g = Date.now();
                Tables.last_flash ? 200 <= g - Tables.last_flash && (Tables.is_flashing = !Tables.is_flashing, Tables.is_flashing && (b = !0), Tables.last_flash = g) : (Tables.is_flashing = !0, Tables.last_flash = g, b = !0)
            } else Tables.is_flashing = !1, Tables.last_flash = 0;
            e = Tables.valuesForSession(e, f &&
                e.sid == f.sid);
            $tr.children().eq(0).text() || (e[0] = "");
            Tables.mergeSessionRowWithValues($tr, e, b);
            Tables._updateTableFooters()
        }
    },
    _updateTableFooters: function () {
        var b = Prefs.get("session-timing-mode") ? 0 : -3E4,
            e = $.formatCurrency.regions[Options.currentRegion()],
            f = !!Prefs.get("show-pacific-time"),
            g = "minutes" == Prefs.get("session-time-format"),
            k = "speed" == Prefs.get("session-productivity-mode"),
            h = "minutes" == Prefs.get("task-time-format"),
            l = "surplus" == Prefs.get("task-productivity-mode"),
            n = "types" == Prefs.get("task-count-format"),
            p = Cache.active_session,
            m = p && p.sid,
            q = !1,
            w = !1,
            u = !1,
            r = !1,
            z = [],
            y = [],
            v = 0;
        $("#sessions-table tr:visible").each(function (e) {
            var f = $(this),
                g = f.attr("data-sid"),
                h = Cache.smap[g];
            f.is(".tr-selected") && (z.push(g), m == g && (r = !0), h && h.surplus < b && (w = !0), y.push(e));
            m == g && (u = !0);
            v++
        });
        r && (w = !1);
        var x = p && u && (2 > z.length || r),
            C = z.length;
        if (2 == y.length && 1 == Math.abs(y[0] - y[1])) {
            var A = Cache.smap[z[0]],
                B = Cache.smap[z[1]];
            A && B && A.sid != m && B.sid != m && (B.start < A.start && (q = A, A = B, B = q), q = !0)
        }
        var F = 0,
            D = 0,
            G = 0,
            H = 0;
        $("#tasks-table tr:visible").each(function () {
            var b =
                $(this);
            b.is(".tr-selected") && (b.attr("data-isnegative") && D++, F++);
            G += parseInt(b.attr("data-count"), 10);
            H++
        });
        var I = Tables.hasMixedProjects && p && 0 != (p.pid || 0),
            B = Tables.sums,
            A = B[3] + (!I && x ? 0 < p.allotted ? p.allotted : p.duration : 0),
            J = B[0] + (x ? p.duration : 0),
            M = B[2] + (x ? p.earnings : 0),
            I = B[1] + (!I && x ? p.surplus : 0),
            K = B[4] + (x ? p.duration : 0),
            E = Tables.taskSums,
            p = E[3] / E[1],
            x = E[1],
            O = E[0],
            L = E[2],
            E = E[5],
            N = "tasks" == Selection.keyTable(),
            P = 1 < C,
            Q = 0 < F;
        $sessionsTableFooter.toggleClass("bordered", !!v);
        $sessionsTableTotals.toggleClass("td-selected",
            P).toggleClass("inactive", N);
        $sessionsTotalCell.css("visibility", v ? "visible" : "hidden");
        $totalSessionDuration.text(Utils.formattedTime(J, !1, g));
        J = M / 1E3 * Options.currentExchangeRate();
        $totalSessionEarnings.text(J).formatCurrency({
            region: Options.currentRegion()
        });
        $totalSessionEarnings.outerWidth() > $sessionEarningsCell.outerWidth() && $totalSessionEarnings.text(J).formatCurrency({
            region: Options.currentRegion(),
            roundToDecimalPlace: 0
        });
        B = K - (Tables.hasMixedProjects ? B[5] : 0);
        $totalSessionSurplus.text(k ? Utils.speedFromValues(A,
            B) : Utils.formattedTime(I, !1, g));
        $totalSessionSurplus.css("color", Utils.colorFromValues(A, B));
        $projectPercentage.text(isNaN(p) ? "" : "SxS: " + Utils.formattedPercent(p));
        $tasksTableTotals.toggleClass("td-selected", Q).toggleClass("inactive", !N);
        $totalTaskAET.text(Utils.formattedTime(x, !1, h));
        n ? $totalTaskCount.text(Utils.prettyCount(E, "type")) : $totalTaskCount.text(Utils.prettyCount(O));
        $totalTaskDuration.text(Utils.formattedTime(L, !1, h));
        $totalTaskSpeed.text(l ? Utils.surplusFromValues(x, L) : Utils.speedFromValues(x,
            L));
        $totalTaskSpeed.css("color", Utils.colorFromValues(x, L));
        $tasksTableFooter.toggleClass("bordered", !!H);
        $tasksTotalCell.css("visibility", H ? "visible" : "hidden");
        $localTimezoneItem.toggle(!!v);
        $localTimezoneItem.parent().toggle(!f);
        $pacificTimezoneItem.toggle(!!v);
        $pacificTimezoneItem.parent().toggle(f);
        $addSessionButton.show();
        $deleteSessionButton.toggle(0 < C && !r);
        $editSessionButton.toggle(1 == C && !r);
        $joinSessionButton.toggle(q);
        $zeroSessionButton.toggle(w);
        $addTaskButton.toggle(0 == C || 1 == C && !r);
        $deleteTaskButton.toggle(1 ==
            F && !r);
        $editTaskButton.toggle(1 == F && !r);
        $zeroTaskButton.toggle(0 < D);
        $taskSpeedCell.prop("title", l ? "Surplus (m:ss)" : "Speed (%)").text(l ? "Surplus" : "Speed");
        $taskDurationCell.prop("title", h ? "Duration (m:ss)" : "Duration (h:mm:ss)");
        $taskAllottedCell.prop("title", h ? "Total AET (m:ss)" : "Total AET (h:mm:ss)");
        $sessionDurationCell.prop("title", g ? "Duration (m:ss)" : "Duration (h:mm:ss)");
        $sessionEarningsCell.prop("title", "Earnings (" + (e ? e.symbol : "$") + ")");
        $sessionSurplusCell.prop("title", k ? "Speed (%)" : "Surplus (m:ss)").text(k ?
            "Speed" : "Surplus");
        f = (v ? Utils.numberWithCommas(v) : "No") + " Session" + (1 == v ? "" : "s");
        e = Period.selectedPeriodText();
        $sessionsTableTitle.text(f + e);
        1 == C && r ? e = "for Active Session" : 1 == C ? e = "for Selected Session" : 1 < C ? e = "for " + Utils.prettyCount(C, "Selected Session") : 4 == Period.highlightedIndex() && (e = " in " + e);
        C = 0 < G ? Utils.prettyCount(G, "Task") : "No Tasks";
        $tasksTableTitle.text(C + " " + e);
        this._updateExpansionLinks();
        this._updateMainActions()
    },
    hasDoneInitialRender: !1,
    monthDuration: 0,
    projectCounts: {},
    sums: [],
    taskSums: []
};
(function (b) {
    b.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.height()
    };
    b.fn.center = function () {
        this.css("position", "absolute");
        this.css("top", Math.max(0, (b(window).height() - b(this).outerHeight()) / 3 + b(window).scrollTop()) + "px");
        this.css("left", Math.max(0, (b(window).width() - b(this).outerWidth()) / 2 + b(window).scrollLeft()) + "px");
        return this
    }
})(jQuery);
(function (b, e) {
    var f = function (b, e, f) {
        var l;
        return function () {
            var n = this,
                p = arguments;
            l ? clearTimeout(l) : f && b.apply(n, p);
            l = setTimeout(function () {
                f || b.apply(n, p);
                l = null
            }, e || 100)
        }
    };
    jQuery.fn[e] = function (b) {
        return b ? this.bind("resize", f(b)) : this.trigger(e)
    }
})(jQuery, "smartresize");
var STACK_CAPACITY = 16,
    Undo = {
        initialize: function () {
            chrome.windows.getCurrent(function (b) {
                Undo.windowId = b.id
            })
        },
        doUndo: function () {
            var b = function (b) {
                    Utils.showGenericPrompt({
                        title: "Could Not Undo Changes",
                        message: b || DEFAULT_ERROR_MSG,
                        buttons: [{
                            text: "OK",
                            width: 100,
                            click: function () {
                                $(this).dialog("close")
                            }
                        }]
                    })
                },
                e = Undo.getStack();
            if (e.index < e.items.length) {
                var f = e.items[e.index];
                if ("add-session" == f.type) Edits.deleteSessionsMap(f.data, function () {
                    e.index++;
                    Undo.setStack(e)
                });
                else if ("delete-sessions" == f.type) Edits.insertSessionsMap(f.data,
                    null,
                    function () {
                        e.index++;
                        Undo.setStack(e)
                    });
                else if ("edit-sessions" == f.type) {
                    var g = Cache.copySessionsMap(Cache.getSessionsMapFromSmap(f.data.sessions)),
                        k = f.data.itypes || f.data.types;
                    k || Selection.setKeyTable("sessions");
                    Edits.updateSessionsMap(f.data.sessions, null, function (h) {
                        h.error ? b(h.error) : (f.data.sessions = g, e.index++, Undo.setStack(e))
                    }, {
                        hsessions: f.data.noHighlightSessions ? null : g,
                        htypes: k
                    })
                } else "join-sessions" == f.type ? (k = Cache.combineSessionsMaps(f.data.s1map, f.data.s2map), Edits.insertSessionsMap(k,
                    null,
                    function () {
                        e.index++;
                        Undo.setStack(e)
                    })) : console.error("Unknown undo action: " + f.type)
            }
        },
        doRedo: function () {
            var b = function (b) {
                    Utils.showGenericPrompt({
                        title: "Could Not Redo Changes",
                        message: b || DEFAULT_ERROR_MSG,
                        buttons: [{
                            text: "OK",
                            width: 100,
                            click: function () {
                                $(this).dialog("close")
                            }
                        }]
                    })
                },
                e = Undo.getStack();
            if (0 < e.index) {
                var f = e.items[e.index - 1];
                if ("add-session" == f.type) Edits.insertSessionsMap(f.data, null, function () {
                    e.index--;
                    Undo.setStack(e)
                });
                else if ("delete-sessions" == f.type) Edits.deleteSessionsMap(f.data,
                    function () {
                        e.index--;
                        Undo.setStack(e)
                    });
                else if ("edit-sessions" == f.type) {
                    var g = Cache.copySessionsMap(Cache.getSessionsMapFromSmap(f.data.sessions)),
                        k = f.data.types || f.data.itypes;
                    k || Selection.setKeyTable("sessions");
                    Edits.updateSessionsMap(f.data.sessions, null, function (h) {
                        h.error ? b(h.error) : (f.data.sessions = g, e.index--, Undo.setStack(e))
                    }, {
                        hsessions: f.data.noHighlightSessions ? null : g,
                        htypes: k
                    })
                } else "join-sessions" == f.type ? Edits.joinSessionsMaps(f.data.s1map, f.data.s2map, function (f) {
                    f.error ? b(f.error) :
                        (e.index--, Undo.setStack(e))
                }) : console.error("Unknown redo action: " + f.type)
            }
        },
        getActions: function () {
            var b = Undo.getStack(),
                e = null,
                f = null;
            b.items.length && b.index < b.items.length && (e = b.items[b.index].name);
            b.items.length && 0 < b.index && (f = b.items[b.index - 1].name);
            return [e, f]
        },
        getStack: function () {
            return JSON.parse(sessionStorage.getItem("undo")) || {
                index: 0,
                items: []
            }
        },
        printStack: function () {
            console.log(JSON.stringify(Undo.getStack()))
        },
        registerAction: function (b, e, f) {
            var g = Undo.getStack();
            0 < g.index ? (g.items =
                g.items.slice(g.index), g.index = 0) : g.items.length > STACK_CAPACITY && g.items.pop();
            g.items.unshift({
                name: b,
                type: e,
                data: f
            });
            Undo.setStack(g)
        },
        setStack: function (b) {
            sessionStorage.setItem("undo", JSON.stringify(b))
        },
        windowId: 1
    };
var Utils = {
    colorFromValues: function (b, e) {
        if (null === b || "undefined" === typeof b) return "#000000";
        if (0 == b || 0 == e) return "#228b22";
        var f = b / e;
        return 1 <= f ? "#228b22" : .98 > f ? "#ee2c2c" : "#ff9000"
    },
    compareMonthStrings: function (b, e) {
        var f = b.split("-");
        f[0] = parseInt(f[0], 10);
        f[1] = parseInt(f[1], 10);
        var g = e.split("-");
        g[0] = parseInt(g[0], 10);
        g[1] = parseInt(g[1], 10);
        var k = 0;
        f[0] != g[0] && (k += 12 * (f[0] - g[0]));
        f[1] != g[1] && (k += f[1] - g[1]);
        return k
    },
    convertToMoney: function (b, e, f, g) {
        c = isNaN(e) ? 2 : Math.abs(e);
        d = f || ".";
        t = "undefined" ===
            typeof g ? "," : g;
        sign = 0 > b ? "-" : "";
        i = parseInt(b = Math.abs(b).toFixed(c)) + "";
        j = 3 < (j = i.length) ? j % 3 : 0;
        return sign + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(b - i).toFixed(c).slice(2) : "")
    },
    deviceIdForTypeStr: function (b) {
        b = b.split(",");
        return 2 < b.length ? parseInt(b[2], 10) : 0
    },
    formattedPercent: function (b) {
        return (Math.floor(1E3 * b) / 10).toFixed(1)
    },
    formattedTime: function (b, e, f) {
        var g = 0 > b;
        b = Math.abs(b);
        var k = moment.duration(b);
        b = k.seconds();
        f ? (f = Math.floor(k.asMinutes()), k = 0,
            e = !1) : (f = k.minutes(), k = Math.floor(k.asHours()));
        var h = Utils.numberWithCommas;
        return (g ? "-" : "") + (0 < k || e ? h(k) + ":" : "") + ((e || 0 < k) && 10 > f ? "0" : "") + h(f) + ":" + (10 > b ? "0" : "") + b
    },
    fullNameForTaskType: function (b) {
        b = b.split(",");
        var e = Utils.formattedTime(1E3 * b[1]);
        return b[0] + " (" + e + ")"
    },
    getExtensionInfo: function (b, e) {
        chrome.management.getAll(function (f) {
            for (var g = 0; g < f.length; g++)
                if (b == f[g].id && f[g].enabled) {
                    e(f[g]);
                    return
                } e(null)
        })
    },
    isDeviceNote: function (b) {
        return "Android" == b || "Android Phone" == b || "Android Tablet" ==
            b || "iPhone" == b || "iPad" == b
    },
    isValidMonthString: function (b) {
        if ("string" !== typeof b) return !1;
        b = b.split("-");
        return !isNaN(parseInt(b[0]), 10) && !isNaN(parseInt(b[1], 10))
    },
    localizedMoment: function (b) {
        b = moment(b || void 0);
        Prefs.get("date-offset") || b.tz(PACIFIC_TIMEZONE);
        return b
    },
    noteForDeviceId: function (b) {
        switch (b) {
            case 1:
                return "Android Phone";
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
    numberWithCommas: function (b) {
        return b ? b.toString().replace(/\B(?=(\d{3})+(?!\d))/g,
            ",") : "0"
    },
    presentError: function (b) {
        var e = $("#generic-dialog").clone();
        e.find("p").eq(0).text(b.message || "An unknown error occurred");
        b.error && e.find("p").eq(1).text(b.error);
        e.dialog({
            modal: !0,
            width: b.width || "auto",
            title: b.title || "\u00a0",
            dialogClass: "no-close dialog",
            resizable: !1,
            buttons: b.buttons || [{
                text: "OK",
                width: 100,
                click: function () {
                    e.dialog("close")
                }
            }],
            open: b.open || [],
            open: function () {
                $(".ui-widget-overlay.ui-front").click(function () {
                    e.dialog("close")
                })
            },
            close: function () {
                e.remove();
                b.close &&
                    b.close()
            }
        });
        return e
    },
    prettyCount: function (b, e) {
        var f = 1 == b ? "" : "s";
        return e ? Utils.numberWithCommas(b) + " " + e + f : Utils.numberWithCommas(b)
    },
    setCaretPosition: function (b, e, f) {
        b = document.getElementById(b);
        null != b && (b.createTextRange ? (f = b.createTextRange(), f.move("character", e), f.select()) : b.selectionStart ? (b.focus(), b.setSelectionRange(e, f || e)) : b.focus())
    },
    showGenericPrompt: function (b) {
        var e = $("#generic-dialog").clone();
        e.find("p").eq(0).text(b.message || "\u00a0");
        e.dialog({
            modal: !0,
            width: b.width || "auto",
            title: b.title || "\u00a0",
            dialogClass: "no-close dialog",
            resizable: !1,
            buttons: b.buttons || [{
                text: "OK",
                width: 100,
                click: function () {
                    $(this).dialog("close")
                }
            }],
            open: function () {
                $(".ui-widget-overlay.ui-front").click(function () {
                    e.dialog("close")
                });
                b.open && b.open()
            },
            close: function () {
                e.remove();
                b.close && b.close()
            }
        });
        return e
    },
    speedFromValues: function (b, e) {
        var f = 0 != e ? (0 != b ? b : e) / e : 0 != b ? 9.99 : 1;
        return 9.99 <= f ? "+999.9" : 0 > f ? "0" : Utils.formattedPercent(f)
    },
    surplusFromValues: function (b, e) {
        return this.formattedTime(b -
            e)
    },
    Projects: {
        nameForPid: function (b) {
            switch (b) {
                case 0:
                    return "Yukon";
                case 1:
                    return "Orange";
                case 2:
                    return "Nile";
                case 3:
                    return "Blue Nile";
                case 4:
                    return "Sonora";
                case 5:
                    return "White Nile";
                case 6:
                    return "Caribou";
                case 7:
                    return "Kwango";
                case 8:
                    return "Platte";
                case 9:
                    return "Thames";
                case 10:
                    return "Danube";
                case 11:
                    return "Shasta";
                case 12:
                    return "Tahoe";
                case 13:
                    return "Kern";
                case 14:
                    return "Hudson";
                case 15:
                    return "Truckee";
                default:
                    return "Untitled Project"
            }
        },
        nameForSession: function (b) {
            var e = function (b, e) {
                    var f = parseInt(b,
                            10),
                        g = parseInt(e, 10);
                    return f != g ? g - f : e > b ? -1 : 1
                },
                f = "untitled session",
                f = [];
            if (0 < Object.keys(b.types).length) {
                var g = {},
                    k;
                for (k in b.types) {
                    var h = k.split(",")[0],
                        l = h.toLowerCase();
                    if (0 == l.indexOf("exp") || 0 == l.indexOf("sxs") || 0 == l.indexOf("rr")) h = h.split(" "), h = h.length && h[0].length ? h[0] : null;
                    h && (g[h] = g[h] ? g[h] + b.types[k][0] : b.types[k][0])
                }
                for (var n in g) f.push(g[n] + " " + n);
                f.length ? (f.sort(e), f = f.join(", ")) : f = "untitled session"
            } else f = 0 == (b.pid || 0) ? "untitled session" : Utils.Projects.nameForPid(b.pid ||
                0) + " Rating";
            return f
        }
    }
};
var DEFAULT_ERROR_MSG = "An unknown error occurred. Please try again.",
    PACIFIC_TIMEZONE = "America/Los_Angeles",
    SESSION_SID = "data-sid",
    TASK_TYPE = "data-tasktype",
    USER_ADDED_SESSION = "data-user-added-session",
    VERSION_KEY = "9.26",
    IS_DEBUG = !1;
try {
    IS_DEBUG = !chrome.runtime.getManifest().update_url
} catch (e$$37) {}
var is_extension = 0 == document.URL.indexOf("chrome-extension:"),
    is_node = "undefined" !== typeof process,
    Popout = {
        initialize: function () {
            Prefs.monitor("popout-timer-port", function (b) {
                if ("popout-did-open" == b.type) Popout.updateCurrentTask(), Popout.updateTaskList();
                else if ("clicked-submit-task" == b.type) chrome.runtime.sendMessageToPort({
                    type: "did-submit-task"
                }, "popout-timer"), Tracker.handleSubmit(null);
                else if ("clicked-toggle-session" == b.type) Prefs.set("dont-hide-popout", !0), Tracker.toggleSession(!!b.forceNew);
                else if ("did-select-task" == b.type) {
                    if (Tracker.session) {
                        var e = Tracker.session.task;
                        e && e.type == b.info.typeStr || (b.info.retainTask = !0, Tracker.handleAcquire(b.info, function (b, e) {
                            e && console.log("Error changing task type: " + e)
                        }))
                    }
                } else "open-in-separate-window" == b.type && (Prefs.set("pop-out-summary-timer", !0), $("#timer-dialog").dialog("close"), Popout.showTimerWindows(!0))
            })
        },
        handleLogin: function () {
            Prefs.get("dont-hide-popout") ? Prefs.set("dont-hide-popout", null) : this.showTimerWindow(!1)
        },
        handleLogout: function () {
            Prefs.get("dont-hide-popout") ?
                Prefs.set("dont-hide-popout", null) : this.hideTimerWindow()
        },
        handleSubmit: function () {},
        hideTimerWindow: function () {
            $("#timer-dialog").is(":visible") && $("#timer-dialog").dialog("close");
            is_node ? Popout.node_window && Popout.node_window.close() : is_extension || chrome.runtime.sendMessageToPort({
                type: "do-close"
            }, "popout-timer")
        },
        setTaskInfo: function (b) {
            b = {
                type: "set-task-info",
                info: b,
                nonce: Date.now()
            };
            Prefs.set("popout-timer-port", b)
        },
        showTimerWindow: function (b) {
            function e() {
                var b = Popout.node_window;
                b && Prefs.set("popout-timer-state", {
                    top: b.y,
                    left: b.x,
                    width: b.width,
                    height: b.height
                })
            }

            function f() {
                var b = Prefs.get("popout-timer-state") || {};
                b.width || (b.width = 400);
                b.height || (b.height = 300);
                b.top || (b.top = screen.height / 2 - b.height / 2);
                b.left || (b.left = screen.width / 2 - b.width / 2);
                return b
            }

            function g() {
                var b = $("#timer-dialog").closest(".ui-dialog"),
                    e = b.position(),
                    b = {
                        top: e.top,
                        left: e.left,
                        width: Math.round(b.width()),
                        height: Math.round(b.height())
                    };
                Prefs.set("summary-timer-state", b)
            }

            function k() {
                if (!$("#timer-dialog").is(":visible")) {
                    var b = Prefs.get("summary-timer-state") || {},
                        e = b.left && b.top ? {
                            my: "left top",
                            at: "left+" + b.left + " top+" + b.top,
                            of: "body"
                        } : {
                            my: "center",
                            at: "center",
                            of: window
                        };
                    $("#timer-dialog").dialog({
                        width: b.width || 420,
                        height: b.height || 340,
                        position: e,
                        dialogClass: "dialogShadowed",
                        resizable: !0,
                        title: "Timer",
                        modal: !1,
                        create: function () {
                            $(this).find("iframe").attr("src", "popout-timer.html")
                        },
                        dragStop: function () {
                            g()
                        },
                        resizeStop: function () {
                            g()
                        },
                        close: function () {
                            $(this).dialog("destroy")
                        }
                    })
                }
            }
            if (is_node)
                if (Popout.node_window) Popout.node_window.focus();
                else {
                    var h = f();
                    h.x = h.left;
                    h.y = h.top;
                    var l = require("nw.gui");
                    Popout.node_window = l.Window.open("popout-timer.html", {
                        position: "center",
                        focus: !0,
                        toolbar: !1,
                        frame: !0,
                        x: h.x,
                        y: h.y,
                        width: h.width,
                        height: h.height
                    });
                    Popout.node_window.on("move", e);
                    Popout.node_window.on("resize", e);
                    Popout.node_window.on("close", function () {
                        Popout.node_window = null;
                        this.close(!0)
                    });
                    Popout.node_window.setAlwaysOnTop(!0)
                }
            else Prefs.get("pop-out-summary-timer") ? (Prefs.set("popout-timer-ping", Date.now()), setTimeout(function () {
                if (Prefs.get("popout-timer-ping")) {
                    var e =
                        "",
                        g = f();
                    g.width = 320;
                    g.height = 246;
                    e += "width=" + g.width + ",";
                    e += "height=" + g.height + ",";
                    e += "top=" + g.top + ",";
                    e += "left=" + g.left + ",";
                    (e = window.open("popout-timer.html", "ra-popout-timer", e + "scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no")) && e.focus()
                } else b && (chrome.runtime.sendMessageToPort({
                    type: "do-close"
                }, "popout-timer"), Prefs.set("pop-out-summary-timer", !1), k())
            }, 10)) : k()
        },
        toggleTimerWindow: function () {
            $("#timer-dialog").is(":visible") ? this.hideTimerWindow() : this.showTimerWindow()
        },
        updateCurrentTask: function () {
            var b = Tracker.session && Tracker.session.task;
            b ? (b = {
                type: /[^,]*/.exec(b.type)[0],
                time: b.allotted / 1E3
            }, Popout.setTaskInfo(b)) : Popout.setTaskInfo(null)
        },
        updateTaskList: function () {}
    };

function signOutOfDropbox(b) {
    SpinController.start();
    chrome.runtime.sendMessage({
        method: "signout-requested"
    }, function (e) {
        SpinController.stop();
        e.error ? (Utils.showGenericPrompt({
            title: "Could Not Sign Out",
            message: e.error,
            buttons: [{
                text: "OK",
                width: 100,
                click: function () {
                    $(this).dialog("close")
                }
            }]
        }), b && b(!1)) : (Cache.clear(), Tables.removeAllRows(), Popout.hideTimerWindow(), b && b(!0))
    })
}
var Keys = {
        initialize: function () {
            $(document.body).keydown(function (b) {
                if (!$(".dialog:not(.timer):visible").length) switch (b.which) {
                    case 37:
                        0 < Period.highlightedIndex() && (4 > Period.highlightedIndex() ? $("#top-left-header .period").eq(Period.highlightedIndex() - 1).click() : $("#right-month-stepper").click());
                        break;
                    case 39:
                        3 > Period.highlightedIndex() ? $("#top-left-header .period").eq(Period.highlightedIndex() + 1).click() : $("#left-month-stepper").click();
                        break;
                    case 38:
                        return Selection.advanceKeyTableUp(), !1;
                    case 40:
                        return Selection.advanceKeyTableDown(),
                            !1;
                    case 49:
                    case 50:
                    case 51:
                    case 52:
                        $("#top-left-header td.period").eq(b.which - 49).click();
                        break;
                    case 97:
                    case 98:
                    case 99:
                    case 100:
                        $("#top-left-header td.period").eq(b.which - 97).click();
                        break;
                    case 13:
                        Edits.beginEditingSelectedSession();
                        b.preventDefault();
                        break;
                    case 35:
                        Tables.scrollSessionsToBottom();
                        break;
                    case 36:
                        Tables.scrollSessionsToTop();
                        break;
                    case 33:
                        Tables.scrollSessionsUp();
                        break;
                    case 34:
                        Tables.scrollSessionsDown();
                        break;
                    case 65:
                        (b.metaKey || b.ctrlKey) && Selection.selectAllSessions();
                        break;
                    case 90:
                        if (b.metaKey ||
                            b.ctrlKey) b.shiftKey ? Undo.doRedo() : Undo.doUndo();
                        break;
                    case 8:
                    case 46:
                        return "tasks" == Selection.keyTable() && $("#delete-tasks-item").is(":visible") ? $("#delete-tasks-item").click() : $deleteSessionButton.is(":visible") && $deleteSessionButton.click(), !1
                }
            })
        }
    },
    _v_ = atob("c3Vic2NyaXB0aW9u"),
    Menus = {
        initialize: function () {
            function b(b) {
                "set-timesheet-title" == b.type && $("#timesheet-dialog").dialog("option", "title", b.title)
            }

            function e(b) {
                "set-calendar-title" == b.type && $("#calendar-dialog").dialog("option", "title",
                    b.title)
            }

            function f(b) {
                if ("invoice-did-load" == b.type) {
                    var e = $("#invoice-dialog").dialog().position(),
                        f = Math.max(Math.min(b.height + 130, 600), 60);
                    $("#invoice-dialog").dialog("option", "height", f).dialog("option", "position", e);
                    $("#invoice-dialog iframe")[0].contentWindow.scrollTo(0, 999999);
                    $("#invoice-dialog").offset().top + $("#invoice-dialog").height() + 100 >= $(document).height() && $("#invoice-dialog").dialog("option", "position", {
                        my: "center",
                        at: "center",
                        of: window
                    });
                    b = moment(b.mstr, "YYYY-M");
                    $("#invoice-dialog").dialog("option",
                        "title", b.format("MMMM YYYY"));
                    $("#invoice-dialog").parent().css("visibility", "visible")
                }
            }
            $("#ra-dropdown").mouseup(function () {});
            $("#about-item").mouseup(function () {
                var b = $("#about-dialog");
                b.dialog({
                    width: "auto",
                    height: "auto",
                    dialogClass: "dialog",
                    resizable: !1,
                    title: "About",
                    modal: !0,
                    open: function () {
                        $(".ui-widget-overlay.ui-front").click(function () {
                            b.dialog("close")
                        });
                        var e = chrome.runtime.getManifest();
                        $("#version-string").text(e.name + " version " + e.version)
                    }
                })
            });
            $(".options-item").mouseup(function () {
                Options.showDialog()
            });
            $(".show-goals-options").click(function () {
                $(".goals-item").click()
            });
            $(".show-reload-options").click(function () {
                Options.showDialog(2)
            });
            $(".show-submit-options").click(function () {
                Options.showDialog(3)
            });
            $(".show-task-features-options").click(function () {
                $("#options-item").mouseup();
                setTimeout(function () {
                    $("#configure-link-openers").click()
                }, 10)
            });
            $("#signout-item").mouseup(function () {
                signOutOfDropbox()
            });
            $("#update-item").mouseup(function () {
                var b = $("#checking-updates-dialog").dialog({
                    title: "Checking for Updates...",
                    modal: !0,
                    width: 320,
                    height: "auto",
                    dialogClass: "no-close dialog",
                    resizable: !1,
                    open: function () {
                        $("#updates-progressbar").progressbar({
                            value: !1
                        })
                    }
                });
                chrome.runtime.requestUpdateCheck(function (e, f) {
                    b.dialog("close");
                    if ("throttled" == e) {
                        var l = Prefs.get("last-update-info");
                        l && (e = l.status, f = l.details)
                    } else Prefs.set("last-update-info", {
                        status: e,
                        details: f
                    });
                    var n = chrome.runtime.getManifest(),
                        l = n.version,
                        n = n.name;
                    "throttled" === e && (e = "no_update");
                    switch (e) {
                        case "throttled":
                            Utils.showGenericPrompt({
                                title: "Could Not Check for Updates",
                                message: "You are checking for updates too often.",
                                buttons: [{
                                    text: "OK",
                                    width: 100,
                                    click: function () {
                                        $(this).dialog("close")
                                    }
                                }]
                            });
                            break;
                        case "no_update":
                            Utils.showGenericPrompt({
                                title: "You're Up to Date!",
                                message: n + " " + l + " is the newest version available.",
                                buttons: [{
                                    text: "What's New",
                                    width: "auto",
                                    click: function () {
                                        window.open("http://www.rateraide.com/updates")
                                    }
                                }, {
                                    text: "OK",
                                    width: 100,
                                    click: function () {
                                        $(this).dialog("close")
                                    }
                                }]
                            });
                            break;
                        case "update_available":
                            Utils.showGenericPrompt({
                                width: 500,
                                title: "New " +
                                    n + " Available!",
                                message: n + " " + f.version + " is now available. You have version " + l + ". The new version will finish installing in a few moments...",
                                buttons: [{
                                    text: "OK",
                                    width: 140,
                                    click: function () {
                                        $(this).dialog("close")
                                    }
                                }]
                            })
                    }
                })
            });
            $("#edit-dropdown").mouseup(function (b) {
                if (!$(b.target).hasClass("dropdown-disabled")) switch (b.target.id) {
                    case "undo-action":
                        Undo.doUndo();
                        break;
                    case "redo-action":
                        Undo.doRedo();
                        break;
                    case "print-action":
                        Undo.printStack();
                        break;
                    case "clear-action":
                        Undo.clearStack()
                }
            });
            $("#24-hour-time-menu-item").mouseup(function () {
                Prefs.set("use-24-hour-time",
                    !Prefs.get("use-24-hour-time"));
                Tables.update()
            });
            $("#convert-currency-menu-item").mouseup(function () {
                "USD" != Prefs.get("displayed-currency") && (Prefs.set("displayed-currency-convert", !Prefs.get("displayed-currency-convert")), Tables.update())
            });
            $("#time-zone-menu-item").mouseup(function () {
                Prefs.set("show-pacific-time", !Prefs.get("show-pacific-time"));
                Tables.update()
            });
            $(".session-productivity-item").mouseup(function () {
                if (!$(this).hasClass("checkmark")) {
                    var b = Prefs.get("session-productivity-mode");
                    Prefs.set("session-productivity-mode",
                        "speed" == b ? "surplus" : "speed");
                    Tables.update()
                }
            });
            $(".session-time-format-item").mouseup(function () {
                if (!$(this).hasClass("checkmark")) {
                    var b = Prefs.get("session-time-format");
                    Prefs.set("session-time-format", "minutes" == b ? "hours" : "minutes");
                    Tables.update()
                }
            });
            $(".task-productivity-item").mouseup(function () {
                if (!$(this).hasClass("checkmark")) {
                    var b = Prefs.get("task-productivity-mode");
                    Prefs.set("task-productivity-mode", "surplus" == b ? "speed" : "surplus");
                    Tables.update()
                }
            });
            $(".task-time-format-item").mouseup(function () {
                if (!$(this).hasClass("checkmark")) {
                    var b =
                        Prefs.get("task-time-format");
                    Prefs.set("task-time-format", "minutes" == b ? "hours" : "minutes");
                    Tables.update()
                }
            });
            $(".task-count-format-item").mouseup(function () {
                if (!$(this).hasClass("checkmark")) {
                    var b = Prefs.get("task-count-format");
                    Prefs.set("task-count-format", "types" == b ? "tasks" : "types");
                    Tables.update()
                }
            });
            $("#invoice-menu-item").mouseup(function () {
                $(this).hasClass("dropdown-disabled") || Accounts.i(!1)
            });
            $("#open-timecard-menu-item").mouseup(function () {
                $(this).hasClass("dropdown-disabled") || Accounts.t()
            });
            $("#invoice-in-background-item").mouseup(function () {
                $(this).hasClass("dropdown-disabled") || Accounts.i(!0)
            });
            $("#contact-menu-item").mouseup(function () {
                window.open("http://www.rateraide.com/contact")
            });
            $("#help-menu-item").mouseup(function () {
                window.open("http://www.rateraide.com/help")
            });
            $("#whatsnew-menu-item").mouseup(function () {
                $("#whatsnew-dialog").dialog({
                    modal: !0,
                    width: "auto",
                    height: "auto",
                    title: "RaterAide Update",
                    dialogClass: "dialog wide",
                    resizable: !1,
                    open: function () {
                        $(".ui-widget-overlay.ui-front").click(function () {
                            $("#whatsnew-dialog").dialog("close")
                        });
                        $("#new-version-number").text(VERSION_KEY);
                        $(":focus").blur()
                    },
                    close: function () {
                        Prefs.set("last-update-seen", VERSION_KEY)
                    }
                })
            });
            $("#edit-dropdown").on("show", function () {
                var b = Undo.getActions(),
                    e = $("#undo-action");
                e.text(b[0] ? "Undo " + b[0] : "Undo");
                e.toggleClass("dropdown-disabled", !b[0]);
                e = $("#redo-action");
                e.text(b[1] ? "Redo " + b[1] : "Redo");
                e.toggleClass("dropdown-disabled", !b[1])
            });
            $("#view-dropdown").on("show", function () {
                $("#time-zone-menu-item").toggleClass("checkmark", !!Prefs.get("show-pacific-time"));
                $("#24-hour-time-menu-item").toggleClass("checkmark", !!Prefs.get("use-24-hour-time"));
                $("#convert-currency-menu-item").toggle("USD" != Prefs.get("displayed-currency"));
                $("#convert-currency-menu-item").toggleClass("checkmark", !!Prefs.get("displayed-currency-convert"));
                var b = "speed" == Prefs.get("session-productivity-mode");
                $(".session-productivity-item").eq(0).toggleClass("checkmark", !b);
                $(".session-productivity-item").eq(1).toggleClass("checkmark", b);
                b = "minutes" == Prefs.get("session-time-format");
                $(".session-time-format-item").eq(0).toggleClass("checkmark",
                    !b);
                $(".session-time-format-item").eq(1).toggleClass("checkmark", b)
            });
            $("#tasks-view-dropdown").on("show", function () {
                var b = "surplus" == Prefs.get("task-productivity-mode");
                $(".task-productivity-item").eq(0).toggleClass("checkmark", b);
                $(".task-productivity-item").eq(1).toggleClass("checkmark", !b);
                b = "minutes" == Prefs.get("task-time-format");
                $(".task-time-format-item").eq(0).toggleClass("checkmark", !b);
                $(".task-time-format-item").eq(1).toggleClass("checkmark", b);
                b = "types" == Prefs.get("task-count-format");
                $(".task-count-format-item").eq(0).toggleClass("checkmark", !b);
                $(".task-count-format-item").eq(1).toggleClass("checkmark", b)
            });
            $("#create-account-button").bind("click", function () {
                window.open("https://db.tt/6j3I56Cq")
            });
            $("#sign-in-dropbox").bind("click", function (b) {
                chrome.runtime.sendMessage({
                    method: "sign-in-dropbox"
                }, function (b) {
                    b && Utils.presentError({
                        title: "Could Not Sign In",
                        message: b
                    })
                })
            });
            $("#reload-button, #reload-menu-item").mouseup(function () {
                chrome.runtime.sendMessage({
                    method: "reload-extension"
                });
                $(this).css("visibility", "hidden")
            });
            $(document).on("mouseover", ".dropdown .dropdown-menu LI > A, .dropdown .dropdown-menu LABEL", function () {
                $(this).hasClass("dropdown-disabled") ? $(this).removeClass("dropdown-hover") : $(this).addClass("dropdown-hover")
            });
            $(document).on("mouseout", ".dropdown .dropdown-menu LI > A, .dropdown .dropdown-menu LABEL", function () {
                $(this).removeClass("dropdown-hover")
            });
            $(".timer-item").click(function (b) {
                Popout.toggleTimerWindow()
            });
            $(".open-popout-timer").click(function () {
                chrome.runtime.sendMessage({
                    method: "open-popout-timer"
                })
            });
            $(".add-session").click(function () {
                $("#add-session").click()
            });
            $(".timesheet-item").click(function (e) {
                var f = function () {
                    var b = {};
                    b.mstr = Period.selectedMonthString();
                    var e;
                    e = b.mstr.split("-");
                    e = (new Date(parseInt(e[0], 10), parseInt(e[1], 10) - 1)).getTime();
                    b.current_date = e;
                    b.past_month = 4 == Period.highlightedIndex();
                    return b
                }();
                e = {
                    modal: !0,
                    width: Math.min(.9 * $(window).width(), 1100),
                    height: 360,
                    title: "\u00a0",
                    resizable: !0,
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    },
                    buttons: Menus.timesheetButtons(!1),
                    create: function () {
                        $("#timesheet-dialog").closest(".ui-dialog-content").css("max-width",
                            "none")
                    },
                    open: function () {
                        $(".ui-widget-overlay.ui-front").click(function () {
                            $("#timesheet-dialog").dialog("close")
                        });
                        $("#timesheet-reminder").hide();
                        Prefs.set("has-seen-timesheet", !0);
                        chrome.runtime.onMessage.addListener(b);
                        var e = f.past_month ? "#" + f.current_date + "," + f.mstr : "";
                        $("#timesheet-dialog iframe").attr("src", "popout-timesheet.html" + e)
                    },
                    close: function () {
                        $("#timesheet-dialog iframe").attr("src", "");
                        chrome.runtime.onMessage.removeListener(b)
                    }
                };
                $("#timesheet-dialog").dialog(e)
            });
            $("#timesheet-reminder").click(function () {
                $(".timesheet-item").eq(0).click()
            });
            $(".calendar-item").click(function (b) {
                if ($(".dropdown:visible").length) $(".calendar-item").dropdown("hide");
                else {
                    var f = Period.selectedMonthString();
                    b = {
                        modal: !0,
                        width: 860,
                        height: 600,
                        title: moment(f, "YYYY-M").format("MMMM YYYY"),
                        resizable: !1,
                        position: {
                            my: "center",
                            at: "center",
                            of: window
                        },
                        create: function () {
                            $("#calendar-dialog").closest(".ui-dialog-content").css("max-width", "none")
                        },
                        open: function () {
                            $(".ui-widget-overlay.ui-front").click(function () {
                                $("#calendar-dialog").dialog("close")
                            });
                            $("#calendar-dialog iframe").attr("src",
                                "popout-calendar.html#" + f);
                            chrome.runtime.onMessage.addListener(e)
                        },
                        close: function () {
                            $("#calendar-dialog iframe").attr("src", "");
                            chrome.runtime.onMessage.removeListener(e)
                        }
                    };
                    b.buttons = Menus.timesheetButtons(!0);
                    $("#calendar-dialog").dialog(b)
                }
            });
            $(".invoice-item").click(function (b) {
                $(".dropdown:visible").length ? $(".invoice-item").dropdown("hide") : (b = {
                    modal: !0,
                    width: 860,
                    height: 600,
                    title: "Invoice",
                    resizable: !1,
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    },
                    create: function () {
                        $("#invoice-dialog").closest(".ui-dialog-content").css("max-width",
                            "none")
                    },
                    open: function () {
                        $(".ui-widget-overlay.ui-front").click(function () {
                            $("#invoice-dialog").dialog("close")
                        });
                        $("#invoice-reminder").hide();
                        Prefs.set("has-seen-invoice", !0);
                        chrome.runtime.onMessage.addListener(f);
                        $("#invoice-dialog iframe").attr("src", "popout-invoice.html#" + Period.selectedMonthString());
                        var b = $(".ui-dialog-buttonset:visible").children(":first");
                        b.css("position", "absolute");
                        b.css("left", "22px")
                    },
                    close: function () {
                        chrome.runtime.onMessage.removeListener(f);
                        $("#invoice-dialog iframe").attr("src",
                            "")
                    }
                }, b.buttons = Menus.timesheetButtons(!1), $("#invoice-dialog").dialog(b), $("#invoice-dialog").parent().css("visibility", "hidden"))
            });
            $("#invoice-reminder").click(function () {
                $(".invoice-item").eq(0).click()
            });
            $(".calendar-item").longClick(function () {
                $(".calendar-item").dropdown("show")
            });
            $(".goals-item").click(function () {
                Options.showDialog($('#options-tabs td:contains("Goals")').index())
            });
            $("#start-item").mouseup(function () {
                chrome.runtime.sendMessage({
                    method: "start-session",
                    begin_new: !0
                })
            });
            $("#stop-item").mouseup(function () {
                chrome.runtime.sendMessage({
                    method: "stop-session"
                })
            });
            $("#resume-item").mouseup(function () {
                chrome.runtime.sendMessage({
                    method: "start-session"
                })
            });
            $("#resume-selected-item").mouseup(function () {
                var b = Tables.resumableSelectedSession();
                b && chrome.runtime.sendMessage({
                    method: "resume-session",
                    session: b
                })
            });
            $("#add-item").mouseup(function () {
                $(this).is(".dropdown-disabled") || $addSessionButton.click()
            });
            $("#edit-item").mouseup(function () {
                $(this).is(".dropdown-disabled") || Edits.beginEditingSelectedSession()
            });
            $("#delete-item").mouseup(function () {
                $(this).is(".dropdown-disabled") ||
                    Edits.deleteSelectedSessions()
            });
            $("#join-item").mouseup(function () {
                $(this).is(".dropdown-disabled") || Edits.joinSelectedSessions()
            });
            $("#zero-item").mouseup(function () {
                $(this).is(".dropdown-disabled") || Edits.zeroOutSelectedSessions()
            });
            $("#export-item").mouseup(function () {
                Filepicker.showExporter()
            });
            $("#import-item").mouseup(function () {
                Filepicker.showImporter()
            });
            $("#open-dropbox-folder").mouseup(function () {
                window.open("https://www.dropbox.com/home/Apps/RaterAide")
            })
        },
        timesheetButtons: function (b) {
            var e =
                b ? "open-popout-calendar" : "open-popout-timesheet";
            if ("lionbridge" == Prefs.get("user-vendor")) return [{
                text: "Open in New Window",
                width: 244,
                click: function (f) {
                    f = $("#calendar-dialog iframe").get(0).contentWindow.location.href;
                    chrome.runtime.sendMessage({
                        method: e,
                        mstr: f.split("#")[1]
                    });
                    b ? $("#calendar-dialog").dialog("close") : $("#timesheet-dialog").dialog("close")
                }
            }, {
                text: "Open Timesheet",
                width: 244,
                click: function () {
                    var b = !(!Prefs.get("user") || "US" != Prefs.get("user").country);
                    Prefs.get("uses-ultipro") || b ? chrome.runtime.sendMessage({
                            method: "open-ultipro"
                        }) :
                        chrome.runtime.sendMessage({
                            method: "open-timesheet-assistant"
                        })
                }
            }];
            var f = [],
                f = uses_raterlabs ? 1 < Object.keys(Tables.projectCounts).length ? [{
                    text: "30-Day Count",
                    click: function () {
                        Tables.showCount()
                    }
                }, {
                    text: "Fill Leapforce Invoice...",
                    width: 236,
                    click: function () {
                        $("#invoice-menu-item").mouseup()
                    }
                }, {
                    text: "Open Timecard",
                    width: 196,
                    click: function () {
                        $("#open-timecard-menu-item").mouseup()
                    }
                }] : [{
                    text: "30-Day Count",
                    click: function () {
                        Tables.showCount()
                    }
                }, {
                    text: "Open Timecard",
                    width: 196,
                    click: function () {
                        $("#open-timecard-menu-item").mouseup()
                    }
                }] : [{
                    text: "30-Day Count",
                    click: function () {
                        Tables.showCount()
                    }
                }, {
                    text: "Fill Invoice in Background",
                    width: 236,
                    click: function () {
                        $("#invoice-in-background-item").mouseup()
                    }
                }, {
                    text: "Fill Invoice...",
                    width: 236,
                    click: function () {
                        $("#invoice-menu-item").mouseup()
                    }
                }];
            b && f.splice(1, 0, {
                text: "Open in New Window",
                click: function () {
                    var f = $("#calendar-dialog iframe").get(0).contentWindow.location.href;
                    b && chrome.runtime.sendMessage({
                        method: e,
                        mstr: f.split("#")[1]
                    });
                    $("#calendar-dialog").dialog("close")
                }
            });
            return f
        }
    },
    SpinController = {
        defaults: {
            lines: 11,
            length: 2,
            width: 2,
            radius: 3,
            corners: 0,
            rotate: 0,
            direction: 1,
            color: "#fff",
            speed: 1.2,
            trail: 60,
            shadow: !1,
            hwaccel: !1,
            className: "busy-spinner",
            zIndex: 1,
            top: 0
        },
        start: function () {
            this.isSpinning || (this.spinner || (this.spinner = new Spinner(SpinController.defaults)), this.spinner.spin($("#session-spinner").get(0)), this.isSpinning = !0)
        },
        stop: function () {
            this.spinner && this.spinner.stop();
            this.isSpinning = !1
        }
    };
if (is_extension) var Prefs = {
    initialize: function (b) {
        chrome.storage.onChanged.addListener(function (b, f) {
            if ("local" == f) {
                for (var g in b) Prefs.data[g] = b[g].newValue;
                for (g in b)
                    if (Prefs.monitors[g]) Prefs.monitors[g](Prefs.data[g])
            }
        });
        chrome.storage.local.get(null, function (e) {
            Prefs.data = e;
            b()
        })
    },
    get: function (b) {
        return this.data[b]
    },
    set: function (b, e, f) {
        if (null !== b && "undefined" !== typeof b)
            if (null !== e && "undefined" !== typeof e) {
                var g = {};
                g[b] = e;
                chrome.storage.local.set(g, f);
                this.data[b] = e
            } else chrome.storage.local.remove(b,
                f), delete this.data[b]
    },
    setAll: function (b, e) {
        var f = {};
        $.each(b, function (b, e) {
            f[b] = e
        });
        $.extend(Prefs.data, f);
        chrome.storage.local.set(f, e)
    },
    monitor: function (b, e, f) {
        this.monitors[b] = e;
        f && e(Prefs.get(b))
    },
    monitors: {},
    data: {}
};
var logo_timer = 0,
    reload_timer = 0;

function didInitialRender(b) {
    logo_timer && clearTimeout(logo_timer);
    reload_timer && clearTimeout(reload_timer);
    if (b.error)
        if (-1 == b.error.indexOf("authenticate")) {
            var e = /{\"error\": \"(.+)\"}/.exec(b.error);
            e && (b.error = e[1]);
            "(no response)" == b.error && (b.error = "No internet connection");
            Utils.showGenericPrompt({
                title: "Could Not Connect to Dropbox",
                message: b.error
            })
        } else Options.setTablesShown(!1);
    else Prefs.get("user") ? (Prefs.get("show-pro-account") ? $(".account-item").eq(0).mouseup() : setTimeout(function () {
        var b =
            Prefs.get("last-update-seen");
        Prefs.get("user");
        Prefs.get("user-vendor");
        b && VERSION_KEY != b ? $("#whatsnew-menu-item").mouseup() : Prefs.set("last-update-seen", VERSION_KEY)
    }, 250), chrome.runtime.sendMessage({
        method: "summary-page-did-load"
    })) : Options.setTablesShown(!1)
}
var uses_raterlabs = !1;
$(document).ready(function () {
    $("#included-dialogs").load("sessions-dialogs.html", function () {
        $("#included-menus").load("sessions-menus.html", function () {
            function b() {
                Selection.initialize(function () {
                    Menus.initialize();
                    Period.initialize();
                    Options.initialize();
                    Tables.initialize();
                    Edits.initialize();
                    Keys.initialize();
                    Undo.initialize();
                    Accounts.initialize();
                    Tables.update({
                        reason: "initial render",
                        callback: didInitialRender,
                        fetch: !0
                    });
                    setTimeout(function () {
                        $("#login-content").is(":visible") || $("#user-content").is(":visible") ||
                            $("#connecting-content").show()
                    }, 250);
                    reload_timer = setTimeout(function () {
                        $("#reload-button").css("visibility", "visible")
                    }, 1E4)
                })
            }
            var e = window.navigator.userLanguage || window.navigator.language;
            moment.locale(e);
            console.log("Using locale " + e);
            Prefs.initialize(function () {
                Prefs.monitor("uses-raterlabs", function (b) {
                    var e = !(!Prefs.get("user") || "US" != Prefs.get("user").country);
                    (uses_raterlabs = b || e) ? $("li.invoice-item").text("Timecard"): $("li.invoice-item").text("Invoice")
                }, !0);
                b()
            })
        });
        $(".android-link").on("click",
            function () {
                window.open("https://play.google.com/store/apps/details?id=com.raterware.rateraide")
            });
        $(".iphone-link").on("click", function () {
            window.open("https://itunes.apple.com/us/app/rateraide/id918925603?ls=0&mt=8")
        })
    })
});