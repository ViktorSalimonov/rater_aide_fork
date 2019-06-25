(function() {
	var DATE_FORMAT = "M/D/YY";
	var PACIFIC_TIMEZONE = "America/Los_Angeles";

	var Prefs = {
		initialize:function(callback) {
			chrome.storage.onChanged.addListener(function(changes,area) {
				if ('local' == area) {
					for (var i in changes) Prefs.data[i] = changes[i].newValue;
					for (var i in changes) if (Prefs.monitors[i]) Prefs.monitors[i](Prefs.data[i]);
				}
			});
			chrome.storage.local.get(null,function(r) { Prefs.data = r; callback(); });
		},
		get:function(key) { return this.data[key]; },
		set:function(key,value,callback) {
			if (null === key || 'undefined' === typeof key) return;
			if (null !== value && 'undefined' !== typeof value) {
				var info = {};
				info[key] = value;
				chrome.storage.local.set(info,callback);
				this.data[key] = value;
			} else {
				chrome.storage.local.remove(key,callback);
				delete this.data[key];
			}
		}
	};

	var _v_ = atob('c3Vic2NyaXB0aW9u');

// 	chrome.runtime.onMessage.addListener(function(request) {
// 		if ("save-timesheet" == request.type) {
// 			if ($('#btnSubmit').length) {
// 				$('#btnSubmit').mousedown();
// 				setTimeout(function() {
// 					$('#btnSubmit').click();
// 					$('#btnSubmit').mouseup();
// 				}, 10);
// 			}
// 		}
// 	});

	Prefs.initialize(function() {
		var addedRowCount = false;

		// TODO: Set vendor defaults in background.js
		if (-1 != document.URL.indexOf("ultipro.com/default.aspx")) {
			if (!Prefs.get("user-vendor")) {
				Prefs.set("user-vendor", "lionbridge");
			}
			Prefs.set("uses-ultipro", true);
		}

		(function addButton(retryCount) {
			if ($('tr#ACTIONLIST').length) {
				handleActionList($('tr#ACTIONLIST').first());
			} else if (retryCount++ < 10) {
				setTimeout(addButton, 500, retryCount);
			}
		})(0);

		function handleActionList($tr) {
			var $buttonRow = $tr.find("td#tdACTIONICON");
			if ($buttonRow.length) {	
				$buttonRow.prepend('<a id="ra-fill" class="timesheet button icon" href="#"><span class="ra-button">Fill Using RaterAide</span></a>');		
				$("#ra-fill").on("click", function() {
					chrome.storage.local.get(_v_, function(r) {
						if (r[_v_] && ("active" == r[_v_].status || "trialing" == r[_v_].status)) {
							fillTimesheet();
						} else {
							chrome.storage.local.set({
								"show-pro-account":
								Math.floor(Math.random() * 65535)
							});
						}
					});
				});
			}
		}
	
		function fillTimesheet(callback) {
			$("table.timesheetgrid").each(function(tableIdx) {
				var $timesheetTable = $(this);
				var period = [];
				if ($timesheetTable.find("tr").text()) {
					var text = $timesheetTable.find("tr").eq(0).text().trim().replace(/\s|\t/," ");
					var m = text.match(/^Week\d \[(\d?\d\/\d?\d\/\d?\d?\d\d)-(\d?\d\d\/\d?\d\/\d?\d?\d\d)/)
					if (m && 3 == m.length) {
						var head = moment(m[1]);
						var tail = moment(m[2]);
						if (head.isValid() && tail.isValid()) {
							if (!Prefs.get("date-offset")) {
								head.tz(PACIFIC_TIMEZONE);
								tail.tz(PACIFIC_TIMEZONE);
								// The trick is to determine the offset and manually subtract that from the date
								// To get a true Pacific timestamp to fetch the sessions we need
								var pacific = moment.tz.zone(PACIFIC_TIMEZONE);
								var local = moment.tz.zone(moment.tz.guess())
								var offsetMinutes = pacific.offset(head) - local.offset(head);
								head.add(offsetMinutes, "m");
								tail.add(offsetMinutes, "m");
								//console.log("using pacific time zone");
							} else {
								//console.log("local time");
							}
							tail.add(1, "d");
							period = [head.valueOf(), tail.valueOf()];
						}
					}
				}
				if (2 == period.length) {
					console.log("Fetch between " + moment(period[0]).format("LLL") + " and " + moment(period[1]).format("LLL"));

					chrome.runtime.sendMessage({
						method: "fetch-between",
						head: period[0],
						tail: period[1]
					}, function(result) {
						console.log("Fetched " + Object.keys(result.sessions).length + " session(s).");

						if (result.active && result.active.start >= period[0] && result.active.stop < period[1]) {
							result.sessions[result.active.sid] = result.active;
						}

						// Generate list of werk dates that include total session duration
						var workdates = [];
						$.each(result.sessions, function(sid, session) {
							var startDate = moment(session.start);
							if (!Prefs.get("date-offset")) {
								startDate.tz(PACIFIC_TIMEZONE);
							}
							var startDateStr = startDate.format(DATE_FORMAT);

							var foundExisting = false;
							$.each(workdates, function(idx, info) {
								if (info.dateStr == startDateStr) {
									foundExisting = true;
									info.duration += session.duration;
									info.sessions.push(session);
									return false;
								}
							});

							if (!foundExisting) {
								workdates.push({
									duration: session.duration,
									date: startDate,
									dateStr: startDateStr,
									sessions: [session]
								});
							}
						});

						var entries = [];
						var cursor = moment(period[0]);
						for (i = 0; i < 7; i++) {
							var dateStr = moment(cursor).format(DATE_FORMAT);
							var existing = null;
							$.each(workdates, function(idx, info) {
								if (info.dateStr == dateStr) {
									existing = info;
									return false;
								}
							});
							if (existing) {
								entries.push(existing);
							} else {
								entries.push({
									duration: 0
								});
							}
							cursor.add(1, "d");
						}

						var updateCount = 0;
						var usableRowCount = 0;

						$timesheetTable.find("tr:visible").each(function(idx) {
							var $tr = $(this);
							var $selects = $tr.find("select:visible");
							if (3 == $selects.length) {

								if ("TRN" == $selects.eq(1).val()) {
									console.log("Skipping training row at idx " + idx);
									return;
								}

								$selects.eq(0).val("10");
								$selects.eq(1).val("Z");
								$selects.eq(2).val("Z");

								var $inputs = $tr.find("input");
								if ($inputs.length >= 8) {
									$.each(entries, function(idx, info) {
										var duration = moment.duration(entries[idx].duration);
										var minutes = duration.minutes();
										minutes += 60 * Math.floor(duration.asHours());
										var decimalHours = Math.ceil(100 * (minutes / 60)) / 100;
										$inputs.eq(idx).val(decimalHours);
										// TODO: Validate updates
										updateCount++
									});
									usableRowCount++;
								}
							}
						});

						if (usableRowCount < 1 && addedRowCount < 3) {
							var $addButton = $("#ImageAddRow_" + (tableIdx - 1));
							if ($addButton.length) {
								addedRowCount++;
								$addButton.click();
								setTimeout(function() {
									fillTimesheet();
								}, 100);
							}
						} else {
							chrome.runtime.sendMessage({method: "did-fill-timesheet"});
						}
					});

				} else {
					// Skipping a couple summary tables at the top
					//console.log("Error: No valid date ranges found");
					if (callback) callback(null, "Pay period not found.");
				}
			});
		}
	});
})();
