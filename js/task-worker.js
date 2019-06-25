var TXT_LATER = "Later",
    TXT_SOONER = "Sooner",
    $fc;
(function (r, l) {
    var d = function (d, l, e) {
        var k;
        return function () {
            var r = this,
                E = arguments;
            k ? clearTimeout(k) : e && d.apply(r, E);
            k = setTimeout(function () {
                e || d.apply(r, E);
                k = null
            }, l || 100)
        }
    };
    jQuery.fn[l] = function (c) {
        return c ? this.bind("resize", d(c)) : this.trigger(l)
    }
})(jQuery, "smartresize");

function start() {
    function r(a, b) {
        var f = 0 > a;
        a = Math.abs(Number(a));
        var h = Math.floor(a / 3600),
            d = Math.floor(a % 3600 / 60),
            v = Math.floor(a % 3600 % 60),
            f = (f ? "-" : "") + (0 < h || b ? h + ":" : ""),
            f = f + (0 < h || b ? (10 > d ? "0" : "") + d + ":" : d + ":");
        return f += (10 > v ? "0" : "") + v
    }

    function l() {
        return Y == document.body.getAttribute("current-ra")
    }

    function d() {
        return document.URL == sessionStorage.getItem("ra-last-url") ? sessionStorage.getItem("ra-last-clicked") || 0 : 0
    }

    function c() {
        N = 1;
        if ("USD" == A) {
            var a = O;
            N = a && a.rates && a.rates[B] && F && a.rates[B].rate ||
                1
        }
        P = {
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
        } ["USD" == A ? F ? B : "USD" : A]
    }

    function q() {
        if (w && m && "undefined" !== typeof m.surplus.session && G) {
            var a = $.grep(w, function (a) {
                return a.enabled
            });
            if (a.length) {
                var b = Date.now(),
                    f = m;
                f.taskId === t ? (H = !1, Q = 0) : 200 <= b - Q && (H = !H, Q = b);
                for (var h = [], b = !1, d = "session", v = 0; v < a.length; v++) {
                    var g = a[v],
                        n = "task" == g.period,
                        c = t && n && H,
                        n = t && n && I;
                    if ("speed" == g.value) {
                        0 == v && "task" != g.period &&
                            (d = g.period);
                        var e = (n || f)[g.value][g.period] || 0,
                            g = Math.min(e, 9.999),
                            g = 9.999 <= g ? "+999.9%" : (100 * g).toFixed(1) + "%";
                        c && (g = g.replace(/\./g, " "));
                        h.push(g)
                    } else "aet" == g.value ? (e = (n || f).allotted[g.period], "undefined" !== typeof e && ("task" != g.period && (e -= (n || f).allotted.task || 0), h.push(r(e / 1E3) + " AET"))) : "earnings" == g.value ? (b = "ar-EG" == P, e = (n || f)[g.value][g.period] || 0, c = $fc(e / 1E3 * N, {
                        region: P,
                        symbol: "",
                        roundToDecimalPlace: 2
                    }), h.push(c)) : (0 == v && "task" != g.period && (d = g.period), e = (n || f)[g.value][g.period] || 0, g =
                        r(e / 1E3), c && (g = g.replace(/:/g, " ")), h.push(g))
                }
                if (h.length) {
                    a = (b ? h.reverse() : h).join(" \u2022 ");
                    f = (n || f).surplus[d] || 0;
                    document.title = b ? a + " " + (0 <= f ? "\u25b7" : "\u25b6") : (0 <= f ? "\u25b7" : "\u25b6") + " " + a;
                    return
                }
            }
        }
        null !== y && y != document.title && (document.title = y)
    }

    function e(a) {
        function b(a) {
            var b = "submit and stop rating" == a ? $("#ewok-task-submit-done-button") : $("#ewok-task-submit-button");
            console.log("perform " + a + " with " + b.length + " buttons");
            b.focus().trigger("click");
            C = J = !1;
            K = !0;
            R = 0;
            setTimeout(function () {
                try {
                    $("#ewok-errors-list li").length ?
                        u.postMessage({
                            type: "autosubmit-failed"
                        }) : u.postMessage({
                            type: "did-autosubmit"
                        })
                } catch (a) {}
            }, 100);
            $("#ra-autosubmit").is(":visible") && $("#ra-autosubmit").hide()
        }
        var f = S,
            h = f && f.enabled && f.mode,
            e = a && "undefined" !== typeof a.surplus ? Math.round(a.surplus.session / 1E3) : void 0,
            c = a && "undefined" !== typeof a.surplus ? Math.round(a.surplus.day / 1E3) : void 0;
        a = a && a.surplus && Math.round(a.surplus.task / 1E3) || void 0;
        if ("undefined" !== typeof e && "undefined" !== typeof c && h && "undefined" !== typeof a && null !== a && !J && !C && !K && G) {
            "undefined" ===
            typeof p && (p = "undefined" !== typeof f.when ? f.when : 2, h = e, c < e && (h = c), x = 0, h < a && (x = Math.max(a - h, 0), z ? p = x >= a ? Math.min(a - p, a - Math.min(x, 30)) : Math.max(x - 2, 0) : f.sooner && (p += Math.min(x, 10))), 30 >= T && (p = Math.min(p, 2)));
            $("#ra-autosubmit").length || ($div = $("#ewok-submit-div div").eq(0), $div.css("min-width", "800px"), $div.length || ($div = $("div.buttons").last()), $div.append('<span id="ra-autosubmit" style="-webkit-user-select:none; -moz-user-select:none; display:none">\t\t\t\t<span id="ra-autosubmit-message" style="margin-left:32px; font-weight:bold; font-size:13px; color:#333"></span>\t\t\t\t<span style="margin-left:4px; font-weight:bold">\t\t\t\t<span id="ra-autosubmit-sooner" style="cursor:pointer; text-decoration:underline; display:none" title="Submit sooner if combined speed is below 100%.">' +
                (z ? TXT_LATER : TXT_SOONER) + '</span>&nbsp;&nbsp;\t\t\t\t<span id="ra-autosubmit-skip" style="cursor:pointer; text-decoration:underline" title="Skip auto-submit for this task">Skip</span>&nbsp;&nbsp;\t\t\t\t<span id="ra-autosubmit-cancel" style="cursor:pointer; text-decoration:underline" title="Disable auto-submit">Off</span>\t\t\t\t</span>'));
            f = U ? "submit and stop rating" : "submit";
            e = !!d();
            h = 5E3 >= Date.now() - Z;
            a -= p;
            c = "";
            if (L)
                if (0 < a)
                    if (e) {
                        var h = Math.floor(a / 60),
                            g = Math.floor(a % 60);
                        if (0 == h) c = "Will " + f + " in " +
                            g + " second" + (1 != g ? "s" : "") + ".";
                        else if (c = "Will " + f + " in " + h + " minute" + (1 != h ? "s" : ""), 0 != g || 1 < h) c += ", " + g + " second" + (1 != g ? "s" : "");
                        c += "..."
                    } else c = "Will " + f + " once task is started.";
            else 0 < R && !h && e ? (b(f), c = "Auto-submitting...") : (J = !0, c = "Auto-submit canceled.");
            else !e && 0 < a && !V ? c = "Will " + f + " once task is started." : 0 < a ? c = "Will " + f + " once task is complete." : (J = !0, c = "Auto-submit canceled.");
            var n = c;
            V || $.each([" submit and stop rating", " submit"], function (a, b) {
                n = n.replace(b, ' <span class="ra-autosubmit-switch" style="text-decoration:underline; cursor:pointer">' +
                    b + "</span>")
            });
            $("#ra-autosubmit-message").html() != n && $("#ra-autosubmit-message").html(n);
            $("#ra-autosubmit").is(":visible") || $("#ra-autosubmit").show();
            $("#ra-autosubmit-cancel, #ra-autosubmit-skip").toggle(!K && !C);
            f = 30 <= x && 30 < a && e && L || z;
            $("#ra-autosubmit-sooner").toggle(f);
            R = a;
            return !0
        }
        $("#ra-autosubmit").is(":visible") && $("#ra-autosubmit").hide();
        return !1
    }

    function k() {
        var a = /(\d+.\d+) (minutes?|seconds?)/.exec(document.body.textContent);
        if (!a) return null;
        var b = parseFloat(a[1]);
        if (isNaN(b)) return null;
        a = -1 != a[2].toLowerCase().indexOf("second");
        return parseInt(b * (a ? 1 : 60), 10)
    }

    function ia() {
        var a = document.getElementsByClassName("ewok-estimated-task-weight")[0];
        if (!a) return k();
        var a = a.textContent.toLowerCase(),
            b = /(\d+) minutes? (\d+) seconds?/.exec(a);
        if (b) return a = parseInt(b[1] || 0, 10), b = parseInt(b[2] || 0, 10), 60 * a + b;
        var f = parseFloat(a);
        if (isNaN(f)) return k();
        b = -1 != a.indexOf("seconds");
        return parseInt(f * (b ? 1 : 60), 10)
    }

    function E(a) {
        function b() {
            var a = document.getElementsByClassName("ewok-task-action-header")[0];
            if (!a) return null;
            var b = a.getElementsByTagName("h1");
            b.length || (b = a.children);
            if (3 > b.length) return null;
            a = "EXP"; - 1 != b[1].textContent.toLowerCase().indexOf("side by side") ? a = "SxS" : -1 != b[1].textContent.toLowerCase().indexOf("result review") && (a = "RR"); - 1 != b[2].textContent.toLowerCase().indexOf("experimental") ? a += " (EXP)" : -1 != b[2].textContent.toLowerCase().indexOf("side by side") && (a += " (SxS)");
            b = b[0].textContent.trim();
            b = b.replace(/news and blogs/i, "N&B");
            return a + " " + b
        }

        function f() {
            try {
                var a = document.getElementsByClassName("ewok-task-action-header")[0];
                if (!a) return null;
                var b = a.getElementsByTagName("h1");
                b.length || (b = a.children);
                if (3 < b.length) {
                    var f = b[2].textContent.trim();
                    if (null === f.match(/\d+/)) return f
                }
            } catch (c) {}
            return null
        }
        var c = function () {
            var a = /taskIds=(\d+)/.exec(document.URL);
            return a ? a[1] : (a = document.getElementById("taskIds")) ? a.value : null
        }();
        if (c) {
            var d = b();
            if (d) {
                $(document.body).attr("ra-task-type", d);
                var e = ia();
                if (null === e) a(null, "No average estimated time");
                else {
                    $(document.body).attr("ra-aet", e);
                    c = {
                        taskId: c,
                        type: d,
                        time: e,
                        projectId: 0
                    };
                    if (d = f()) c.subtype = d;
                    a(c)
                }
            } else a(null, "No task type")
        } else a(null, "No task ID")
    }

    function ja(a) {
        var b = $("#sub-navigation").text().trim().toLowerCase(),
            f = $(".set-element").eq(0).text().trim(),
            c = 0; - 1 != b.indexOf("sonora") ? c = 4 : -1 != b.indexOf("caribou") ? c = 6 : -1 != b.indexOf("kwango") ? c = 7 : -1 != b.indexOf("platte") ? c = 8 : -1 != b.indexOf("thames") ? c = 9 : -1 != b.indexOf("danube") ? c = 10 : -1 != b.indexOf("shasta") ? c = 11 : -1 != b.indexOf("kern") ? c = 13 : -1 != b.indexOf("hudson") ? c = 14 : -1 != b.indexOf("truckee") && (c = 15);
        if (0 != c) {
            var d = /Type: ([^-|\|]+)/.exec(f);
            if (d)
                if (b = d[1].trim().replace("(", "").replace(")", ""), (d = /(\d+) mins?, (\d+) secs?/.exec(f)) && 3 <= d.length) {
                    var e = parseInt(d[1].trim(), 10),
                        d = parseInt(d[2].trim(), 10),
                        d = d + 60 * e;
                    (f = f.hashCode().toString()) ? a({
                        taskId: f,
                        type: b,
                        time: d,
                        projectId: c
                    }): a(null, "Invalid task ID")
                } else a(null, "Invalid AET");
            else a(null, "Invalid task type")
        } else a(null, "Invalid project")
    }

    function aa() {
        V ? ja(function (a, b) {
            b ? console.log("Could not parse task: " + b) : (W = !0, T = a.time, t = a.taskId, D = a.projectId, u.postMessage({
                type: "did-acquire",
                data: a
            }), $("#save-button").on("click", function () {
                l() && u.postMessage({
                    type: "did-click-submit",
                    task_id: t,
                    project_id: D
                })
            }), $("#release-button").on("click", function () {
                l() && u.postMessage({
                    type: "did-click-release",
                    task_id: t,
                    project_id: D
                })
            }))
        }) : E(function (a, b) {
            if (b) {
                console.log("Could not parse task: " + b);
                var c = -1 != document.body.textContent.indexOf("already been ACQUIRED");
                (c |= -1 != document.body.textContent.indexOf("already been EXPIRED")) && chrome.storage.local.remove(["lastNRT", "reload-last-types", "reload-last-mobile-types"])
            } else W = !0, T = a.time, t = a.taskId, D = a.projectId, u.postMessage({
                type: "did-acquire",
                data: a,
                test: ka
            })
        })
    }

    function X() {
        if (l()) {
            var a = !0,
                b = !1;
            M.each(function () {
                var a = $(this).attr("name") || "";
                if (-1 != a.indexOf("stars") || -1 != a.indexOf("pagequality") || -1 != a.indexOf("BaseUtility") || -1 != a.indexOf("ExptUtility") || -1 != a.indexOf("imagerelevance") || -1 != a.indexOf("representativeness") || 0 == a.indexOf("score")) $(this).val() && "0" != $(this).val() || (b = !0)
            });
            $('input[name="unanswerable_question"]').prop("checked") || (ba.length && !ba.is(":checked") ?
                a = !1 : b && (a = !1));
            if (a && ca.length) {
                var c = !1,
                    d = !1;
                ca.each(function () {
                    if ($(this).is(":checked") && (c = !0, "AboutTheSameAs" == $(this).val())) return d = !0, !1
                });
                var k = !0;
                da.length && da.each(function () {
                    if (!$(this).val()) return k = !1
                });
                c && (d || k) || (a = !1)
            }
            a && ea.length && ea.each(function () {
                if (!$(this).is(":checked") && $(this).is(":visible")) return a = !1
            });
            if (a && fa.length) {
                var p = !1;
                fa.each(function () {
                    $(this).is(":checked") && (p = !0)
                });
                p || (a = !1)
            }
            a && ga.length && (ga.filter(":checked").length || (a = !1));
            0 != D && (a = !0);
            var g = L != a;
            L = a;
            g && e(m)
        }
    }
    var V = -1 != document.URL.indexOf("leapforceathome.com/qrp/core/vendors/task"),
        ka = -1 != document.URL.indexOf("rateraide.com/test/tasks/");
    String.prototype.hashCode = function () {
        var a = 0,
            b, c, d;
        if (0 == this.length) return a;
        b = 0;
        for (d = this.length; b < d; b++) c = this.charCodeAt(b), a = (a << 5) - a + c, a |= 0;
        return a
    };
    var Y = Date.now();
    document.body.setAttribute("current-ra", Y);
    var J = !1,
        S = {},
        C = !1,
        P = "en-US",
        W = !1,
        A = "USD",
        B = "USD",
        F = !1,
        U = !1,
        N = 1,
        O, I = null,
        K = !1,
        G = !1,
        H = !1,
        R = 0,
        Q = 0,
        Z = 0,
        ha = null,
        x = 0,
        m = null,
        z = !1,
        w = [],
        T = 0,
        t = null,
        D = 0;
    chrome.storage.local.get("autosubmit-info is-active tab-countdowns disbursed-currency displayed-currency displayed-currency-convert exchange-rate-data".split(" "), function (a) {
        w = a["tab-countdowns"];
        if ("undefined" === typeof w || null === w) w = [{
            enabled: !0,
            period: "task",
            value: "surplus"
        }, {
            enabled: !0,
            period: "task",
            value: "aet"
        }];
        S = a["autosubmit-info"] || {};
        A = a["disbursed-currency"];
        B = a["displayed-currency"];
        F = !!a["displayed-currency-convert"];
        O = a["exchange-rate-data"];
        G = !!a["is-active"];
        c();
        q();
        e(null)
    });
    chrome.storage.onChanged.addListener(function (a) {
        if (l()) {
            var b = !1;
            a["tab-countdowns"] && (w = a["tab-countdowns"].newValue, b = !0);
            if (a["autosubmit-info"]) {
                S = a["autosubmit-info"].newValue || {};
                p = void 0;
                var d = e(m),
                    h = a["autosubmit-info"].newValue && a["autosubmit-info"].newValue.enabled,
                    k = a["autosubmit-info"].oldValue && a["autosubmit-info"].oldValue.enabled;
                d && h && !k && window.scrollTo(0, document.body.scrollHeight);
                k && !h && (C = !1)
            }
            a["disbursed-currency"] && (A = a["disbursed-currency"].newValue, c(), b = !0);
            a["displayed-currency"] &&
                (B = a["displayed-currency"].newValue, c(), b = !0);
            a["displayed-currency-convert"] && (F = !!a["displayed-currency-convert"].newValue, c(), b = !0);
            a["exchange-rate-data"] && (O = a["exchange-rate-data"].newValue, c(), b = !0);
            a["is-active"] && (G = !!a["is-active"].newValue, b = !0);
            b && q()
        }
    });
    var y = localStorage.getItem("ra-original-tab-title");
    y || (y = document.title, localStorage.setItem("ra-original-tab-title", y));
    var u = chrome.runtime.connect({
        name: "ra-task-page"
    });
    u.onMessage.addListener(function (a) {
        l() && "post-user-totals" ==
            a.type && ((m = a.totals) && m.taskId ? (I = null, e(m)) : (t && !I && (I = ha), e(null)), q(), ha = m)
    });
    chrome.runtime.onMessage.addListener(function (a, b, c) {
        l() && "attempt-to-acquire" == a.type && aa()
    });
    chrome.runtime.sendMessage({
        type: "get-user-totals"
    });
    $(document.body).on("click", "#ra-autosubmit-cancel", function () {
        l() && chrome.storage.local.get("autosubmit-info", function (a) {
            (a = a["autosubmit-info"]) && a.enabled && (a.enabled = !1, chrome.storage.local.set({
                "autosubmit-info": a
            }))
        })
    });
    $(document.body).on("click", "#ra-autosubmit-skip",
        function () {
            l() && (C = !0, e(m))
        });
    $(document.body).on("click", "span.ra-autosubmit-switch", function () {
        if (l()) return U = !U, e(m), !1
    });
    $(document.body).on("click", "#ra-autosubmit-sooner", function () {
        if (l()) return z = !z, p = void 0, e(m), $(this).text(z ? TXT_LATER : TXT_SOONER), !1
    });
    $(document.body).on("input", 'input[type="text"], textarea', function () {
        l() && (Z = Date.now(), X())
    });
    $(document.body).on("click", function (a) {
        if (l() && W) {
            var b;
            a: {
                for (b = a.target; b && b.parentNode;) {
                    if (0 == b.id.indexOf("ra-autosubmit")) {
                        b = !1;
                        break a
                    }
                    b =
                        b.parentNode
                }
                b = !0
            }
            if (b) {
                b = Date.now();
                var c = d();
                if (15E3 <= b - c) try {
                    u.postMessage({
                        type: "task-page-activity"
                    })
                } catch (h) {}
                a = a.target && a.target.id;
                "ewok-task-submit-button" == a || "ewok-task-submit-done-button" == a || "ewok-task-cancel-button" == a ? (K = !0, e(m)) : (a = !c, sessionStorage.setItem("ra-last-clicked", b || 0), sessionStorage.setItem("ra-last-url", document.URL), a && e(m));
                X()
            }
        }
    });
    var p = void 0;
    aa();
    $("#ewok-task-submit-done-button").off("click").on("click", function () {
        u.postMessage({
            type: "did-sasr",
            taskId: t
        })
    });
    window.onbeforeunload =
        function () {
            chrome.storage.local.remove("has-hub-task")
        };
    chrome.storage.local.set({
        "has-hub-task": !0
    });
    var L = !1,
        da = $('textarea[name="comment"], textarea[name="comments"], textarea[name="Comment"]'),
        ea = $('input[name="nomoredupes"], input[name="nomoreporn"], input[name="undefined"]'),
        fa = $('input[name="userTopicPreference"]'),
        ga = $('input[name="classification"]'),
        ca = $('input[name="score"]:visible, input[name="Overall"]:visible'),
        ba = $('input[name="list_useful"], input[name="platformImportant"], input[name="SpeechQuality"], input[name="task-confirm-check"]'),
        M = $("input.evl-slider2-value-field, div.ewokui-slider-horizontal input"),
        M = M.length ? M.filter(function (a, b) {
            var c = $(b).closest("div.ewok-buds-result-controls").find("div.ewok-buds-inline-contextual-heading:contains('No Rating Required')");
            if (c.length && c.is(":visible")) return !1;
            c = $(this).closest("div.evl-slider2-container");
            return c.length && !c.is(":visible") ? !1 : !0
        }) : $("div.ewokui-slider-horizontal").siblings("input");
    X()
}
(function (r) {
    function l(d) {
        var c = $fc.regions[d];
        return c ? c : /(\w+)-(\w+)/g.test(d) ? (d = d.replace(/(\w+)-(\w+)/g, "$1"), $fc.regions[d]) : null
    }
    $fc = function (d, c) {
        c = r.extend($fc.regions[""], c);
        0 < c.region.length && (c = r.extend(c, l(c.region)));
        var q = c,
            e;
        e = c;
        if ("" === e.symbol) e = new RegExp("[^\\d" + e.decimalSymbol + "-]", "g");
        else {
            var k = e.symbol.replace("$", "\\$").replace(".", "\\.");
            e = new RegExp(k + "|[^\\d" + e.decimalSymbol + "-]", "g")
        }
        q.regex = e;
        if ("" !== d && "-" !== d) {
            if (isNaN(d)) {
                d = d.replace(c.regex, "");
                if ("" === d || "-" ===
                    d) return;
                "." != c.decimalSymbol && (d = d.replace(c.decimalSymbol, "."));
                isNaN(d) && (d = "0")
            }
            k = String(d).split(".");
            q = d == Math.abs(d);
            e = 1 < k.length ? k[1].toString() : "0";
            d = Math.abs(k[0]);
            d = isNaN(d) ? 0 : d;
            0 <= c.roundToDecimalPlace && (e = parseFloat("1." + e), e = e.toFixed(c.roundToDecimalPlace), "2" == e.substring(0, 1) && (d = Number(d) + 1), e = e.substring(2));
            d = String(d);
            if (c.groupDigits)
                for (k = 0; k < Math.floor((d.length - (1 + k)) / 3); k++) d = d.substring(0, d.length - (4 * k + 3)) + c.digitGroupSymbol + d.substring(d.length - (4 * k + 3));
            0 < c.roundToDecimalPlace &&
                (d += c.decimalSymbol + e);
            q = (q ? c.positiveFormat : c.negativeFormat).replace(/%s/g, c.symbol);
            return q = q.replace(/%n/g, d)
        }
    };
    $fc.regions = [];
    $fc.regions[""] = {
        symbol: "$",
        positiveFormat: "%s%n",
        negativeFormat: "%s%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0,
        roundToDecimalPlace: 2
    };
    $fc.regions["ar-EG"] = {
        symbol: "\u062c.\u0645.\u200f",
        positiveFormat: "%s %n",
        negativeFormat: "%s%n-",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions.de = {
        symbol: "\u20ac",
        positiveFormat: "%n %s",
        negativeFormat: "-%n %s",
        decimalSymbol: ",",
        digitGroupSymbol: ".",
        groupDigits: !0
    };
    $fc.regions["en-CA"] = {
        symbol: "$",
        positiveFormat: "%s%n",
        negativeFormat: "-%s%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions["en-GB"] = {
        symbol: "\u00a3",
        positiveFormat: "%s%n",
        negativeFormat: "-%s%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions["en-IN"] = {
        symbol: "Rs.",
        positiveFormat: "%s%n",
        negativeFormat: "%s-%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions["en-US"] = {
        symbol: "$",
        positiveFormat: "%s%n",
        negativeFormat: "(%s%n)",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions.es = {
        symbol: "\u20ac",
        positiveFormat: "%n %s",
        negativeFormat: "-%n %s",
        decimalSymbol: ",",
        digitGroupSymbol: ".",
        groupDigits: !0
    };
    $fc.regions.fr = {
        symbol: "\u20ac",
        positiveFormat: "%n %s",
        negativeFormat: "-%n %s",
        decimalSymbol: ",",
        digitGroupSymbol: " ",
        groupDigits: !0
    };
    $fc.regions["id-ID"] = {
        symbol: "Rp",
        positiveFormat: "%s%n",
        negativeFormat: "(%s%n)",
        decimalSymbol: ",",
        digitGroupSymbol: ".",
        groupDigits: !0,
        roundToDecimalPlace: 2
    };
    $fc.regions.it = {
        symbol: "\u20ac",
        positiveFormat: "%s %n",
        negativeFormat: "-%s %n",
        decimalSymbol: ",",
        digitGroupSymbol: ".",
        groupDigits: !0
    };
    $fc.regions.ja = {
        symbol: "\u00a5",
        positiveFormat: "%s%n",
        negativeFormat: "-%s%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions["pt-BR"] = {
        symbol: "R$",
        positiveFormat: "%s %n",
        negativeFormat: "-%s %n",
        decimalSymbol: ",",
        digitGroupSymbol: ".",
        groupDigits: !0
    };
    $fc.regions["ru-RU"] = {
        symbol: "\u0440.",
        positiveFormat: "%n%s",
        negativeFormat: "-%n%s",
        decimalSymbol: ",",
        digitGroupSymbol: "\u00a0",
        groupDigits: !0
    };
    $fc.regions["zh-HK"] = {
        symbol: "HK$",
        positiveFormat: "%s%n",
        negativeFormat: "(%s%n)",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    $fc.regions["zh-TW"] = {
        symbol: "NT$",
        positiveFormat: "%s%n",
        negativeFormat: "-%s%n",
        decimalSymbol: ".",
        digitGroupSymbol: ",",
        groupDigits: !0
    };
    start()
})(jQuery);