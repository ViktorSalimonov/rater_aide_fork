(function () {
    function v() {
        var a = $('input[name="addRow"]').last();
        a.length && ($(window).scrollTop(a.offset().top - $(window).height() + 50), $(document).scrollLeft(99999))
    }
    var r = ["https://www.leapforceathome.com/qrp/core/vendors/invoice/edit", "https://www.leapforceathome.com/qrp/core/vendors/invoice#", "https://www.leapforceathome.com/qrp/core/vendors/invoice/add"],
        w = {
            Yukon: 0,
            Nile: 2,
            "Blue Nile": 3,
            Sonora: 4,
            "White Nile": 5,
            Caribou: 6,
            Kwango: 7,
            Platte: 8,
            Thames: 9,
            Danube: 10,
            Shasta: 11,
            Tahoe: 12,
            Kern: 13,
            Hudson: 14,
            Truckee: 15
        },
        t = {};
    $.each(w, function (a, c) {
        t[c] = a
    });
    var p = atob("c3Vic2NyaXB0aW9u"),
        x = !1,
        y = 0,
        n = {
            createFlightplan: function (a, c, d, k) {
                try {
                    var b = {
                        sessions: a,
                        month: d,
                        year: c,
                        days: {},
                        notes: {},
                        rows: {
                            adds: [],
                            updates: []
                        },
                        curr: {
                            day: 0
                        }
                    };
                    if (null === b.year) throw {
                        message: "year is null"
                    };
                    if (null === b.month) throw {
                        message: "month is null"
                    };
                    a = {};
                    for (var f in b.sessions) {
                        var g = b.sessions[f],
                            u = moment(g.start),
                            m = moment(g.stop);
                        u.tz("America/Los_Angeles");
                        m.tz("America/Los_Angeles");
                        if (u.month() != d - 1) break;
                        var l = u.date();
                        b.days[l] || (b.days[l] = {}, $.each(t, function (a, c) {
                            b.days[l][a] = 0
                        }));
                        var e = g.pid || 0,
                            q = timeForSession(g, y, k && k.sid == g.sid);
                        b.days[l][e] += q;
                        a[l] || (a[l] = {});
                        a[l][e] || (a[l][e] = {});
                        a[l][e][g.sid] = g
                    }
                    for (f in b.days) {
                        d = 0;
                        for (var n in b.days[f]) 0 >= b.days[f][n] ? delete b.days[f][n] : d += b.days[f][n];
                        0 == d && delete a[f]
                    }
                    x && $.each(a, function (a, c) {
                        $.each(c, function (c, f) {
                            var d = noteForDay(f, c);
                            d && (b.notes[a] || (b.notes[a] = {}), b.notes[a][c] || (b.notes[a][c] = {}), b.notes[a][c] = d)
                        })
                    });
                    return b
                } catch (p) {
                    console.error("Error in createFlightplan: " +
                        p.message)
                }
                return null
            },
            performNextEdit: function (a) {
                try {
                    var c = function (a, c) {
                            var f = d(a, c),
                                b = !f.is(":selected");
                            f.prop("selected", !0);
                            return b
                        },
                        d = function (a, c) {
                            return a.find("option").filter(function () {
                                return c == $(this).text().trim()
                            })
                        },
                        k = function (f, b, e) {
                            var h, k = !f.find("input").eq(0).val(),
                                g = a.month + "/" + b + "/" + (2E3 < a.year ? a.year - 2E3 : a.year);
                            h = f.find("input:visible").eq(0);
                            k && a.rows.adds.push(h.attr("name"));
                            h.val(g);
                            h = f.find("select").eq(0);
                            g = t[e];
                            if (d(h, g).length) c(h, g) && !k && a.rows.updates.push(h.attr("name"));
                            else return 'Project "' + g + '" not found.';
                            h = moment.duration(a.days[b][e]);
                            var g = Math.floor(h.hours()).toString(),
                                l = (h.minutes() + (30 <= h.seconds() ? 1 : 0)).toString();
                            60 <= l && (l %= 60, ++g);
                            h = f.find(".hours-minutes-picker").eq(0);
                            c(h, g) && !k && a.rows.updates.push(h.attr("name"));
                            h = f.find(".hours-minutes-picker").eq(1);
                            c(h, l) && !k && a.rows.updates.push(h.attr("name"));
                            if (b = a.notes[b] && a.notes[b][e] || null) f.find("a.add-description").eq(0).hide(), f.find("input.entry-description").eq(0).parent("div").show(), h = f.find("input.entry-description").eq(0),
                                b = mergeNotes(h.val(), b), b !== h.val() && (h.val(b), a.rows.updates.push(h.attr("name")));
                            return null
                        },
                        b = function () {
                            $('input[name="addRow"]').eq(0).click()
                        },
                        f = function (f, c) {
                            var b = null,
                                d = a.month + "/" + f + "/" + (2E3 < a.year ? a.year - 2E3 : a.year);
                            $("tr.invoice-entry").each(function () {
                                if (d == $(this).find("input").eq(0).val()) {
                                    var a = $(this).find("select option:selected").eq(0).text().trim();
                                    if (c == w[a]) return b = $(this), !1
                                }
                            });
                            return b
                        },
                        g = Object.keys(a.days).sort(function (a, f) {
                            return parseInt(a, 10) < parseInt(f, 10) ? -1 : 1
                        });
                    if (a.curr.day)
                        for (var e = null, m = g.indexOf(a.curr.day.toString()), m = -1 == m ? 0 : m; m < g.length && !e; m++) {
                            a.curr.day = g[m];
                            for (var l in a.days[g[m]]) {
                                var n = f(g[m], l);
                                if (n) e = k(n, g[m], l);
                                else {
                                    var q = $("table.invoice-builder tr:last-child");
                                    if (q.find("input").eq(0).val()) {
                                        b();
                                        return
                                    }
                                    e = k(q, g[m], l);
                                    if (!e && m < g.length - 1) {
                                        b();
                                        return
                                    }
                                }
                                if (e) break
                            }
                        }
                    e && (a.error = e);
                    try {
                        if (k = !1, q = $("tr.invoice-entry:last-child"), q.find("input").eq(0).val() || (q.find('input[name="deleteRow"]').click(), k = !0), k) return
                    } catch (p) {
                        console.error("Error clearing unused rows: " +
                            p.message)
                    }
                    a.curr.day = 0;
                    a.autosave && (a.needsSave = !0);
                    v()
                } catch (r) {
                    console.error("Error in performNextEdit: " + r.message)
                }
            },
            updateRowHighlighting: function (a) {
                for (var c = 0; c < a.rows.updates.length; c++) {
                    var d = $('select[name="' + a.rows.updates[c] + '"]');
                    d.length || (d = $('input[name="' + a.rows.updates[c] + '"]'));
                    d.closest("td").css("background-color", "#FFFFB2")
                }
                for (c = 0; c < a.rows.adds.length; c++) $('input[name="' + a.rows.adds[c] + '"]').closest("tr").find("td").css("background-color", "#DEFFAC")
            }
        },
        z = {
            read: function (a) {
                try {
                    var c =
                        JSON.parse(sessionStorage.getItem("ra-state"));
                    return c ? c[a] : null
                } catch (d) {
                    console.error("Error in Storage.read: " + d)
                }
                return null
            },
            write: function (a, c) {
                try {
                    var d = JSON.parse(sessionStorage.getItem("ra-state")) || {};
                    null !== c ? d[a] = c : delete d[a];
                    sessionStorage.setItem("ra-state", JSON.stringify(d));
                    return d[a]
                } catch (e) {
                    console.error("Error in Storage.write: " + e)
                }
                return null
            }
        },
        B = function () {
            var a = null;
            $("script").each(function () {
                var c = /new Date\((\d+), (\d+), \d+\)/.exec($(this).html());
                if (c) return a = [parseInt(c[1],
                    10), parseInt(c[2], 10) + 1], !1
            });
            return a
        },
        e = function (a) {
            if ("undefined" !== typeof a) z.write("flightplan", a);
            else return z.read("flightplan")
        },
        C = function (a) {
            function c(a) {
                if (a.hasSaved) chrome.storage.local.remove("invoiceOpts"), chrome.runtime.sendMessage({
                    method: "close-tab"
                });
                else if (a.needsSave) a.needsSave = !1, a.hasSaved = !0, e(a), $('input[name="save"]').click();
                else if (0 == a.curr.day) {
                    window.setTimeout(function () {
                        chrome.storage.local.remove("invoiceOpts")
                    }, 1E3);
                    var c = a.rows.adds.length,
                        b = a.rows.updates.length;
                    a.error ? (a = "Error: " + a.error, $.notify(a, {
                        className: "error",
                        autoHide: !1
                    })) : c || b ? $.notify('Invoice was updated. Review changes and click "Save Draft".', {
                        className: "success",
                        autoHide: !1
                    }) : $.notify("No changes were made: invoice is up to date.\n\nIf this is a new invoice you may have to fill out the first entry by hand, save and retry.", {
                        className: "info",
                        autoHide: !1
                    })
                }
            }
            try {
                var d = e();
                if (d) n.updateRowHighlighting(d), d.curr.day && n.performNextEdit(d), e(d), n.updateRowHighlighting(d), c(d);
                else {
                    var k = B();
                    if (!k) throw {
                        message: "Could not determine invoice period"
                    };
                    chrome.runtime.sendMessage({
                        method: "fetch",
                        period: k[0] + "-" + k[1],
                        forcePacific: !0
                    }, function (b) {
                        b.active && (b.sessions[b.active.sid] = b.active);
                        b = n.createFlightplan(b.sessions, k[0], k[1], b.active);
                        b.curr.day = 1;
                        b.autosave = a;
                        e(b);
                        n.performNextEdit(b);
                        e(b);
                        n.updateRowHighlighting(b);
                        c(b)
                    })
                }
            } catch (b) {
                console.error("Error in initialize: " + b.message), $.notify("Error: " + b.message, {
                    className: "error",
                    autoHide: !1
                })
            }
        },
        A = function (a) {
            for (var c = 0; c < r.length; c++)
                if (0 == a.indexOf(r[c])) return !0;
            return !1
        }(document.URL);
    if (A) $(document).on("ready", function () {
        v();
        $('input[name="save"]').click(function () {
            var a = e();
            a && (a.rows.adds = [], a.rows.updates = [], e(a))
        })
    });
    else if (0 == document.URL.indexOf("https://www.leapforceathome.com/qrp/core/login?")) $(document).on("ready", function () {
        chrome.storage.local.get(["invoiceOpts", p], function (a) {
            if (a.invoiceOpts && a[p] && a.invoiceOpts.auto) var c = 8,
                d = setInterval(function () {
                    $('input[name="username"]').eq(0).val() && $('input[name="password"]').eq(0).val() ? (clearInterval(d), $('input[name="login"]').eq(0).click()) :
                        0 == --c && clearInterval(d)
                }, 250)
        })
    });
    chrome.storage.local.get(["invoiceOpts", p, "annotate-invoice", "invoice-billing-mode"], function (a) {
        if (a.invoiceOpts && a[p]) {
            var c = a.invoiceOpts.auto;
            x = !1 !== a["annotate-invoice"];
            y = a["invoice-billing-mode"] || 0;
            $.notify.defaults({
                globalPosition: "top center"
            });
            A ? C(c) : (e() && e(null), $(".data-table").eq(0).bind("DOMSubtreeModified", function (a) {
                if (0 < a.target.innerHTML.length) {
                    var e = [],
                        b = [];
                    $(".data-table").find("a").each(function () {
                        -1 != $(this).attr("href").indexOf("/qrp/core/vendors/invoice/edit") &&
                            b.push($(this).attr("href"))
                    });
                    (a = $('.action-links a:contains("Create")').eq(0).attr("href")) && e.push(a)
                }
                if (e.length || b.length) $(".data-table").unbind("DOMSubtreeModified"), 1 != b.length || e.length && !c ? $.notify("Select or create an invoice to begin.", {
                    className: "info",
                    autoHide: !1
                }) : document.location.href = b[0]
            }))
        }
    })
})();