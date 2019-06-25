var PACIFIC_TIMEZONE = 'America/Los_Angeles';
var date_offset = 0;
var is_popout = window == window.top;
var week_offset = 0;

var Timesheet = {
	initialize:function() {
		var timesheet_in_hours = false;
		var timesheet_limiting_mode = 0;
		var timesheet_rounding = false;
		var timesheet_rounding_mode = 0;

//****************************************************************************************
// #mark   Utilities
//****************************************************************************************

		var weekOffset = 0;
		
		chrome.storage.local.get("week-offset", function(r) {
			weekOffset = r["week-offset"] || 0;
		});

		function getStartOfWeekForDate(date) {
			var mom = moment(date.getTime());
			mom.startOf('week').add(weekOffset, "d");
			if (mom.isAfter(moment())) mom.subtract(7,'d');
			return new Date(mom.valueOf());
		}

		function localizedMoment(ms) {
			var mom = moment(ms || undefined);
			if (!date_offset) mom.tz(PACIFIC_TIMEZONE);
			return mom;
		}

//****************************************************************************************
// #mark   Fetching
//****************************************************************************************

		function processFetchResult(r) {
			if (r.active) r.sessions[r.active.sid] = r.active;
			var map = {};
			for (var sid in r.sessions) {
				var session = r.sessions[sid];
				var start = new Date(session.start);
				var year = start.getFullYear()
				var month = start.getMonth();
				var date = start.getDate();
				if (!map[year]) map[year] = {};
				if (!map[year][month]) map[year][month] = {};
				if (!map[year][month][date]) map[year][month][date] = {
					exp:{count:0,duration:0,allotted:0},
					sxs:{count:0,duration:0,allotted:0},
					rr:{count:0,duration:0,allotted:0},
					irr:{count:0,duration:0,allotted:0}
				};
				var obj = map[year][month][date];
				for (var t in session.types) {
					var count = session.types[t][0];
					var allotted = session.types[t][1];
					var duration = session.types[t][2];
					t = t.toLowerCase();
					if (0 == t.indexOf('sxs')) {
						obj.sxs.duration += duration;
						obj.sxs.allotted += allotted;
						obj.sxs.count += count;
					} else if (0 == t.indexOf('rr')) {
						obj.rr.duration += duration;
						obj.rr.allotted += allotted;
						obj.rr.count += count;
					} else if (0 == t.indexOf('irr')) {
						obj.irr.duration += duration;
						obj.irr.allotted += allotted;
						obj.irr.count += count;
					} else {
						obj.exp.duration += duration;
						obj.exp.allotted += allotted;
						obj.exp.count += count;
					}
				}
			}
			return map;
		}

//****************************************************************************************
// #mark   Display
//****************************************************************************************
	
		function renderWeek(map) {
			var mom = moment(Timesheet.current_date.getTime());
			var week_totals = {time:{},count:{}};
			var displayed_month = mom.month();
			var displayed_year = mom.year();
			
			var decimal_places = 2;
			if (timesheet_rounding) {
				decimal_places = 0;
			}

			var now = moment();
			var day_times = [0,0,0,0,0,0,0];
			var day_counts = [0,0,0,0,0,0,0];
			$('#timesheet-table .date-cell').each(function(idx) {
				$(this).text(mom.format('ddd M/DD'));
				$(this).data('month',mom.month());
				$(this).data('year',mom.year());
				
				var is_today = $(this).text() == now.format('ddd M/DD');
				$(this).toggleClass('active',is_today);
				
				// Keep track of which months covers a majority of this week (for the monthly totals)
				// Unless we have an original_date that was passed in
				if (mom.month() != displayed_month && idx <= 3) {
					displayed_month = mom.month();
					displayed_year = mom.year();
				}
				var daily_time = 0;
				var daily_count = 0;
				$('#timesheet-table .task-row').each(function() {
					var $time = $(this).find('td').eq((2 * idx) + 1);
					var $count = $(this).find('td').eq((2 * idx) + 2);
					var obj = map[mom.year()];
					if (obj) obj = obj[mom.month()];
					if (obj) obj = obj[mom.date()];
					var type = $(this).attr('name');
					var totals = obj && obj[type];

					// Fill out task times
					var minutes = 0;
					if (totals) {
						var rounding_mode = timesheet_rounding ? timesheet_rounding_mode : null;
						minutes = minutesForTotals(totals,rounding_mode,timesheet_limiting_mode);
					}

					if (timesheet_in_hours) minutes /= 60;
					var timeStr = minutes ? minutes.toFixed(decimal_places) : '0';
					var did_change = $time.text() !== timeStr;
					$time.text(timeStr).toggleClass('disabled',!minutes);
					
					// Set task time tooltips
					if (minutes) {
						var allotted = moment.duration((totals && totals.allotted) || 0);
						var duration = moment.duration((totals && totals.duration) || 0);
						var m = Math.round(duration.asMinutes() * 100) / 100;
						var str = m.toFixed(1) + ' minute' + (1 != m ? 's' : '') + ' spent, total AET = ';
						var m = Math.round(allotted.asMinutes() * 100) / 100;
						str += m.toFixed(1) + ' minute' + (1 != m ? 's' : '');
						$time.attr('title',str);
					} else $time.removeAttr('title');

					// Fill out task counts
					var count = (totals && totals.count) || 0;
					var did_change = $count.text() !== count.toString();
					$count.text(count).toggleClass('disabled',!count);

					// Set task count tooltips
					if (count) {
						var nice_type = type.toUpperCase().replace('SXS','SxS');
						$count.attr('title',count + ' ' + nice_type + ' task' + (1 != count ? 's' : ''));
					} else $count.removeAttr('title');

					if (!week_totals.time[type]) week_totals.time[type] = 0;
					week_totals.time[type] += minutes || 0;
					if (!week_totals.count[type]) week_totals.count[type] = 0;
					week_totals.count[type] += count || 0;
					daily_time += minutes || 0;
					daily_count += count;
					
					day_times[idx] += minutes || 0;
					day_counts[idx] += count;
				});
				mom.add(1,'d');
			});

			var $dayTotals = $('.totals-row td.totals');
			for (var i=0; i < 14; i++) {
				var $cell = $dayTotals.eq(i);
				var idx = Math.floor(i / 2)
				if (0 == i % 2) {
					var mins = day_times[idx];
					$cell.text(0 == mins ? '0' : mins.toFixed(decimal_places));
				} else $cell.text(day_counts[idx]);
				$cell.toggleClass('disabled','0' === $cell.text());
			}
			
			// Gray out empty task rows
			$('#timesheet-table .task-row').each(function() {
				var nonEmpty = false;
				$(this).find('td').each(function(i) {
					if (i >= 1 && i <= 14) {
						var txt = $(this).text();
						if (txt && 0 != parseFloat(txt)) {
							nonEmpty = true;
							return false;
						}
					}
				});
				$(this).find('td:first-child').toggleClass('disabled',!nonEmpty);
			});
			
			// Gray out days that lie outside the displayed month
			if (0 != Timesheet.step_direction) {
				var first_or_last = $('#timesheet-table .date-cell').eq(Timesheet.step_direction < 0 ? 6 : 0);
				displayed_month = first_or_last.data('month');
				displayed_year = first_or_last.data('year');
			}
			$('#timesheet-table .date-cell').each(function(idx) {
				var month = $(this).data('month');
				var inbounds = displayed_month == month;
				$('#timesheet-table .task-row').each(function() {
					var $time = $(this).find('td').eq((2 * idx) + 1);
					var $count = $(this).find('td').eq((2 * idx) + 2);
					$time.toggleClass('grayed',!inbounds);
					$count.toggleClass('grayed',!inbounds);
				});
			});

			// Render weekly totals
			function renderWeeklyTotals(totals) {
				var weekly_time = 0;
				var weekly_count = 0;
				$('#timesheet-table .weekly-time').each(function() {
					var type = $(this).closest('.task-row').attr('name');
					var time = totals.time[type] || 0;
					$(this).text(time ? time.toFixed(decimal_places) : '0');
					$(this).toggleClass('disabled',!time);
					weekly_time += time;
				});
				$('#timesheet-table .weekly-count').each(function() {
					var type = $(this).closest('.task-row').attr('name');
					var count = totals.count[type] || 0;
					$(this).text(count);
					$(this).toggleClass('disabled',!count);
					weekly_count += count;
				});
				// Render totals in bottom row
				$('#timesheet-table .weekly-total-time').text(weekly_time ?
					weekly_time.toFixed(decimal_places) : '0')
					.toggleClass('disabled',!weekly_time);
				$('#timesheet-table .weekly-total-count')
					.toggleClass('disabled',!weekly_count)
					.text(weekly_count);
			}
			
			renderWeeklyTotals(week_totals);

			function calculateMonthlyTotals() {
				var result = {time:{},count:{}};
				var month_obj = map[displayed_year];
				if (month_obj) month_obj = month_obj[displayed_month];
				if (month_obj) $.each(month_obj,function(day,type_totals) {
					var rounding_mode = timesheet_rounding ? timesheet_rounding_mode : null;
					for (var type in type_totals) {
						if (!result.count[type]) result.count[type] = 0;
						result.count[type] += type_totals[type].count;
						if (!result.time[type]) result.time[type] = 0;
						var minutes = minutesForTotals(type_totals[type],rounding_mode,timesheet_limiting_mode);
						if (timesheet_in_hours) minutes /= 60;
						result.time[type] += minutes;
					}
				});
				return result;
			}

			function renderMonthlyTotals(totals) {
				var monthly_time = 0;
				var monthly_count = 0;
				$('#timesheet-table .monthly-time').each(function() {
					var type = $(this).closest('.task-row').attr('name');
					var time = totals.time[type] || 0;
					$(this).text(time ? time.toFixed(decimal_places) : '0');
					$(this).toggleClass('disabled',!time);
					monthly_time += time;
				});
				$('#timesheet-table .monthly-count').each(function() {
					var type = $(this).closest('.task-row').attr('name');
					var count = totals.count[type] || 0;
					$(this).text(count);
					$(this).toggleClass('disabled',!count);
					monthly_count += count;
				});
				// Render totals in bottom row
				$('#timesheet-table .monthly-total-time').text(monthly_time ?
					monthly_time.toFixed(decimal_places) : '0')
					.toggleClass('disabled',!monthly_time);
				$('#timesheet-table .monthly-total-count')
					.toggleClass('disabled',!monthly_count)
					.text(monthly_count);
				// Set month title in top right cell
				var mom = moment({y:displayed_year,M:displayed_month});
				$('#timesheet-table #monthly-total-cell').text(mom.format('MMM YYYY') + ' Totals')
			}
		
			renderMonthlyTotals(calculateMonthlyTotals());
			
			var startmom = moment(Timesheet.current_date.getTime());
			var endmom = startmom.clone().add(6,'d');
			var title = startmom.format('MMMM D') + ' - ' + endmom.format('MMMM D, YYYY');
			if (is_popout) {
				document.title = title;
			} else {
				chrome.runtime.sendMessage({type:'set-timesheet-title',title:title});
			}
		}

//****************************************************************************************
// #mark   Events
//****************************************************************************************
	
		if (!Timesheet.has_initialized) {
			Timesheet.has_initialized = true;

			// Allow clicking outside the checkbox
			$('#timesheet-in-hours, #timesheet-limiting-mode, #timesheet-rounding').parent().click(function(e) {
				if ('TD' == $(e.target).prop('tagName')) {
					$(e.target).find('input').eq(0).click();
					return false;
				}
			});
			
			$('#timesheet-limiting-mode').change(function() {
				timesheet_limiting_mode = $(this).prop('checked') ? 1 : 0;
				if (!is_popout) chrome.storage.local.set({'timesheet-limiting-mode':timesheet_limiting_mode},update);
				else update();
			});
			
			$('#timesheet-rounding').change(function() {
				timesheet_rounding = !!$(this).prop('checked');
				if (!is_popout) chrome.storage.local.set({'timesheet-rounding':timesheet_rounding},update);
				else update();
			});
			
			$('#timesheet-in-hours').change(function() {
				timesheet_in_hours = !!$(this).prop('checked');
				if (!is_popout) chrome.storage.local.set({'timesheet-in-hours':timesheet_in_hours},update);
				else update();
			});

			$('#timesheet-rounding-mode').change(function() {
				timesheet_rounding_mode = parseInt($('option:selected',this).val(),10);
				if (!is_popout) chrome.storage.local.set({'timesheet-rounding-mode':timesheet_rounding_mode},update);
				else update();
			});
			
			$('#timesheet-in-hours-cell').click(function(e) {
				var tag = e.target.tagName;
				if ('INPUT' !== tag && 'LABEL' !== tag)
					$('#timesheet-in-hours').click();
			});

			$('#timesheet-table .stepper').click(function() {
				$('#timesheet-table td').removeClass('selected');
				if (1 == $(this).index()) {
					Timesheet.current_date = getStartOfWeekForDate(new Date());
					update();
				} else {
					var new_date = Timesheet.current_date.getDate() + ($(this).index() ? 7 : -7);
					Timesheet.current_date.setDate(new_date);
					Timesheet.step_direction = 0 == $(this).index() ? -1 : 1;
					update();
				}
			});

			var highlight_mode = 0;
			var is_mouse_down = false;

			// Handle mousedown in task cells
			$('#timesheet-table .task-row td:not(:first-child)').mousedown(function() {
				if ($(this).hasClass('selected')) {
					$(this).removeClass('selected');
					highlight_mode = 0;
				} else {
					$(this).addClass('selected');
					highlight_mode = 1;
				}
				is_mouse_down = true;
			});
			
			// Handle drag in task cells
			$('#timesheet-table .task-row td:not(:first-child)').mouseover(function() {
				if (is_mouse_down) $(this).toggleClass('selected',!!highlight_mode);
			});
			
			// Handle mouseup for task cells
			$('#timesheet-table').bind('mouseup mouseleave',function() {
				is_mouse_down = false;
			});

			// Handle mousedown in left cells
			$('#timesheet-table .task-row td:first-child').mousedown(function() {
				var unselected_ct = $(this).parent().find('td:not(:first-child):not(.totals):not(.selected)').length;
				$(this).parent().find('td:not(:first-child)').toggleClass('selected',!!unselected_ct);	
			});

			// Handle mousedown in top cells
			$('#timesheet-table .date-cell').mousedown(function() {
				var cells = [];
				var has_unselected = false;
				var idx = $(this).index() - 2;
				$('#timesheet-table .task-row').each(function() {
					var $time = $(this).find('td').eq((2 * idx) + 1);
					if (!$time.hasClass('selected')) {
						has_unselected = true;
					}
					var $count = $(this).find('td').eq((2 * idx) + 2);
					if (!$count.hasClass('selected')) {
						has_unselected = true;
					}
					cells.push($time);
					cells.push($count);
				});
				$.each(cells,function(idx,val) {
					val.toggleClass('selected',has_unselected);
				});
			});

			// TODO: This stops working after clicking in the table
			$('#timesheet-table').bind('keydown',function(e) {
				switch (e.which) {
					case 37: $('#timesheet-table .stepper').eq(0).click(); break;
					case 39: $('#timesheet-table .stepper').eq(1).click(); break;
				}
			});
		}
	
//****************************************************************************************
// #mark   Main
//****************************************************************************************

		function dateForMstr(mstr) {
			var c = mstr.split('-');
			var date = new Date(parseInt(c[0],10),parseInt(c[1],10) - 1);
			return date;
		}

		function mstrForDate(ms) {
			var mom = moment(ms);
			return mom.year() + '-' + (mom.month() + 1);
		}

		function update(mstr) {
			var date = mstr ? dateForMstr(mstr) : Timesheet.current_date;

			// If we're focusing on a specific (past) month, make sure correct week step direction is used
			if (mstr) {
				if (Timesheet.current_date.getMonth() < date.getMonth() || Timesheet.current_date.getFullYear() < date.getFullYear()) {
					Timesheet.step_direction = -1;
				} else if (Timesheet.current_date.getMonth() >= date.getMonth() || Timesheet.current_date.getFullYear() >= date.getFullYear()) {
					Timesheet.step_direction = 1;
				}
			}

			var mstr = mstrForDate(Timesheet.current_date);
			var request = {method:'fetch-greater-month',mstr:mstr};
			chrome.runtime.sendMessage(request,function(r) {
				renderWeek(processFetchResult(r));
			});
		}

		chrome.storage.onChanged.addListener(function(info,area) {
			if (info['date-offset']) {
				date_offset = info['date-offset'].newValue || 0;
				Timesheet.current_date = getStartOfWeekForDate(Timesheet.current_date);
				update();
			}
			if (info['week-offset']) {
				week_offset = info['week-offset'].newValue || 0;
				Timesheet.current_date = getStartOfWeekForDate(Timesheet.current_date);
				update();
			}
		});

		var keys = ['timesheet-in-hours','timesheet-limiting-mode','timesheet-rounding','timesheet-rounding-mode','date-offset','week-offset'];
		chrome.storage.local.get(keys,function(r) {
			date_offset = r['date-offset'] || 0;
			week_offset = r['week-offset'] || 0;

			timesheet_in_hours = !!r['timesheet-in-hours'];
			timesheet_limiting_mode = r['timesheet-limiting-mode'] || 0;
			timesheet_rounding = !!r['timesheet-rounding'];
			timesheet_rounding_mode = r['timesheet-rounding-mode'] || 0;

			$('#timesheet-in-hours').prop('checked',timesheet_in_hours);
			$('#timesheet-limiting-mode').prop('checked',timesheet_limiting_mode);
			$('#timesheet-rounding').prop('checked',timesheet_rounding);
			$('#timesheet-rounding-mode').val(timesheet_rounding_mode);
			
			$('#options-table').show();
		});

		chrome.runtime.onMessage.addListener(function(request,sender,response) {
			if ('refresh-timesheet' == request.type) if ($('#timesheet-table').is(':visible')) update();
		});

		$('#timesheet-table').show();
		if (window == window.top) $(document.body).css('padding','8px');

		var comps = window.location.hash.replace('#','').split(',');
		if (comps.length >= 2) {
			Timesheet.current_date = new Date(parseInt(comps[0],10));
			Timesheet.current_date = getStartOfWeekForDate(Timesheet.current_date);
			update(comps[1]);
		} else {
			Timesheet.current_date = getStartOfWeekForDate(new Date());
			update();
		}
	},
	current_date:0,
	step_direction:0
};

Timesheet.initialize()
