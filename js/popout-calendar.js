var add_mobile_notes = false;
var billing_mode = 0;
var is_extension = 0 == document.URL.indexOf('chrome-extension');
var is_popout = window == window.top;
var start_of_week = 0;
var use_pacific_timezone = true;
var user_vendor = 'leapforce';

var PACIFIC_TIMEZONE = 'America/Los_Angeles';

function current_mstr() {
	return window.location.hash.replace('#','');
}

var Calendar = {
	initialize:function() {

//****************************************************************************************
// #mark   Utilities
//****************************************************************************************

		function deviceIdForSession(session) {
			var result = 0;
			$.each(session.types,function(typeStr,info) {
				var task_device_id = deviceIdForTypeStr(typeStr);
				if (0 != task_device_id) { result = task_device_id; return false; }
			});
			return result;
		}

		function deviceIdForTypeStr(typeStr) {
			var c = typeStr.split(',');
			return c.length > 2 ? parseInt(c[2],10) : 0;
		}

		function formattedDuration(ms) {
			var mom = moment.duration(ms);
			var h = Math.floor(mom.asHours());
			var m = mom.minutes();
			var s = mom.seconds();
			return (h ? (h + ':') : '') + (h && m < 10 ? ('0' + m) : m) + ':' + (s < 10 ? ('0' + s) : s);
		}

		function formattedHMS(ms) {
			var n = ms < 0;
			var ms = Math.abs(ms);
			var mom = moment.duration(ms);
			var h = Math.floor(mom.asHours());
			var m = mom.minutes();
			if (mom.seconds() >= 30) {
				if (m < 59) {
					m += 1;
				} else {
					m = 0;
					h += 1;
				}
			}
			return (n ? '-' : '') + (h > 0 ? (h + 'h ') : '') + m + 'm';
		}

		function minutesBetweenDates(date1,date2) {
			var sec1 = (date1 - (date1 % 60000));
			var sec2 = (date2 - (date2 % 60000));
			return Math.round((sec2 - sec1) / 60000);
		}
		
		function roundedDuration(duration) {
			var rem = duration % 60000;
			rem < 30000 ? (duration -= rem) : (duration += (60000 - rem));
			return duration;
		}

//****************************************************************************************
// #mark   Fetching
//****************************************************************************************

		function processFetchResult(r) {
			if (r.active) r.sessions[r.active.sid] = r.active;
			console.log('Fetched ' + Object.keys(r.sessions).length + ' session(s)');
			var map = {};
			var selected_device_id = $('#device-picker').find(':selected').val();
			var selected_project_id = $('#project-picker').val();
			$.each(r.sessions,function(sid,s) {
				// Figure out if session matches selected device
				var session_device_id = deviceIdForSession(s);
				var is_device_included = -1 == selected_device_id || selected_device_id == session_device_id;
				// See if project matches selected project
				var pid = s.pid || 0;
				var is_project_included = -1 == selected_project_id || selected_project_id == pid;
				// Convert session times to Pacific
				var start = moment(s.start);
				var stop = moment(s.stop);
				if (use_pacific_timezone) {
					start.tz(PACIFIC_TIMEZONE);
					stop.tz(PACIFIC_TIMEZONE);
				}
				var date_str = start.month() + '/' + start.date();
				if (!map[date_str]) map[date_str] = {
					task_count:0,
					session_count:0,
					total_allotted:0,
					total_session_duration:0,
					total_task_duration:0,
					device_ids:{},
					project_ids:{}
				};
				var obj = map[date_str];
				if (is_device_included && is_project_included) {
					obj.session_count += 1;
					obj.total_allotted += s.allotted;
					obj.total_session_duration += s.duration;
				}
				$.each(s.types,function(typeStr,info) {
					var deviceId = deviceIdForTypeStr(typeStr);
					obj.device_ids[deviceId] = 1;
					if (is_device_included && is_project_included) {
						obj.task_count += info[0];
						obj.total_task_duration += info[2];
					}
				});
				obj.project_ids[s.pid || 0] = 1;
			});
			return map;
		}

//****************************************************************************************
// #mark   Display
//****************************************************************************************

	function fillCell($td, duration, task_count, no_attr) {
		$td.find(':not(div)').remove();
		$td.append('<span>' + formattedHMS(duration) + '</span>');
		if (null !== task_count) {
			$td.append('<br>');
			var ct_str = task_count + ' task' + (1 != task_count ? 's' : '');
			$td.append('<span>' + ct_str + '</span>');
		} else {
			$td.append('<br>');
			$td.append('<span style="display:none"></span>');
		}
		if (!no_attr) {
			$td.attr('data-duration',duration);
			$td.attr('data-taskcount',task_count);
		}
	}
	
	function renderDayNames() {
		var names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
		$('.date-cell').each(function(i) {
			$(this).text(names[(start_of_week + i) % names.length]);
		});
	}

	function renderMonth(map) {
		var now = moment();
		if (use_pacific_timezone) now.tz(PACIFIC_TIMEZONE);
		var mom = moment(current_mstr(),'YYYY-M');
		var displayed_month = mom.month();
		var cursor = moment(current_mstr(),'YYYY-M').startOf('week');
		cursor.add(start_of_week % 7,'d');
		if (mom.isBefore(cursor)) cursor.subtract(7,'d')
		var month_totals = {
			total_duration:0,
			device_ids:{},
			project_ids:{},
			task_count:0
		};

		// Figure out which devices the user used in this month
		var device_cursor = cursor.clone();
		$('.week-row').each(function(w_idx) {
			for (var i=1; i < 8; i++) {
				var is_within_month = displayed_month == device_cursor.month();
				if (!map) continue;
				var obj = map[device_cursor.month() + '/' + device_cursor.date()] || {};
				if (is_within_month) {
					$.extend(month_totals.device_ids,obj.device_ids);
					$.extend(month_totals.project_ids,obj.project_ids);
				}
				device_cursor.add(1,'d');
			}
		});

		// Populate the device picker
		var $device_picker = $('#device-picker');
		var selected_device_id = $device_picker.find(':selected').val();
		$device_picker.empty();
		$device_picker.append('<option value="-1" selected>All</option>');
		if (Object.keys(month_totals.device_ids).length > 1) {
			for (var did in month_totals.device_ids) {
				switch(parseInt(did,10)) {
					case 0: $device_picker.append('<option value="0">Desktop</option>'); break;
					case 1: $device_picker.append('<option value="1">Android Phone</option>'); break;
					case 2: $device_picker.append('<option value="2">Android Tablet</option>'); break;
					case 8: $device_picker.append('<option value="8">iPhone</option>'); break;
					case 9: $device_picker.append('<option value="9">iPad</option>'); break;
				}
			}
		}
		$device_picker.prop('disabled',Object.keys(month_totals.device_ids).length <= 1);
		if ($device_picker.find('option[value="' + selected_device_id + '"]').length)
			$device_picker.val(selected_device_id);

		// Populate the project picker
		var $project_picker = $('#project-picker');
		var selected_project_id = $project_picker.val();
		$project_picker.find('option').each(function() {
			var project_id = parseInt($(this).val(),10);
			if (-1 != project_id) {
				var show_project = !!month_totals.project_ids[project_id] || selected_project_id == project_id;
				$(this).toggle(show_project);
			}
		});

		// Fill out the date cells
		$('.week-row').each(function(w_idx) {
			var week_totals = { task_count:0, total_duration:0 };
			var week_in_month_totals = { task_count:0, total_duration:0 };
			// Fill out day cells
			for (var i=1; i < 8; i++) {
				var is_within_month = displayed_month == cursor.month();
				// Hide bottom week row if this month doesn't need it
				if ((4 == w_idx || 5 == w_idx) && 1 == i) $(this).toggle(is_within_month);
				if (!map) continue;
				var obj = map[cursor.month() + '/' + cursor.date()] || {};
				// Use our user-selected billing mode
				var working_duration = 0;
				var mode = billing_mode;
				switch(mode) {
					case 1: working_duration = obj.total_task_duration || 0; break;
					case 2: working_duration = obj.total_allotted || 0; break;
					default: working_duration = obj.total_session_duration || 0; break;
				}
				// Fill out duration and task count if necessary
				var working_task_count = obj.task_count > 0 ? obj.task_count : null;
				fillCell($(this).find('td').eq(i), working_duration, working_task_count);
				// Increment weekly totals
				if (is_within_month) {
					week_in_month_totals.total_duration += working_duration;
					month_totals.total_duration += working_duration;
					week_in_month_totals.task_count += working_task_count || 0;
					month_totals.task_count += working_task_count || 0;
				}
				week_totals.total_duration += working_duration;
				week_totals.task_count += obj.task_count || 0;
				// Gray out cells that lie outside the displayed month
				var $td = $(this).find('td').eq(i);
				$td.toggleClass('grayed',!is_within_month);
				// Fill out floating days in top left
				if (!$td.find('.floating-day').length) $td.prepend('<div class="floating-day" style="position:absolute; top:1px; left:3px; color:#bbb"></div>');
				$td.find('.floating-day').first().text(cursor.date());
				$td.toggleClass('active',(now.year() == mom.year() && now.month() == cursor.month() && now.date() == cursor.date()));
				$td.toggleClass('empty',0 === working_duration);
				cursor.add(1,'d');
			}
			// Fill out weekly totals
			var $week_cell = $(this).find('td').eq(0);
			var dur = week_totals.total_duration;
			var working_task_count = week_totals.task_count > 0 ? week_totals.task_count : null;
			fillCell($week_cell, dur, working_task_count);
			$week_cell.toggleClass('empty',0 === dur);
			//$week_cell.append('<div class="floating-week" style="position:absolute; top:1px; left:0; right:0; margin-left:auto; margin-right:auto; color:#888; font-weight:inherit"></div>');
			var ords = ['st','nd','rd','th','th','th'];
			$week_cell.find('.floating-week').text((1 + w_idx) + ords[w_idx] + ' Week');
			$(this).find('td.monthly-total').toggleClass('empty',0 === dur);
			// Fill out monthly total at the bottom right
			var dur = roundedDuration(week_in_month_totals.total_duration);
			var working_task_count = week_in_month_totals.task_count > 0 ? week_in_month_totals.task_count : null;
			fillCell($(this).find('td.monthly-total'), dur, working_task_count);
			$(this).find('td.monthly-total').toggleClass('empty',0 === dur);
		});
		var dur = month_totals.total_duration;
		var working_task_count = month_totals.task_count > 0 ? month_totals.task_count : null;
		fillCell($('.month-total'), dur, working_task_count);
		$('.month-total').toggleClass('empty',0 === dur);
		$('#monthly-total-cell').text(mom.format('MMM YYYY'));
		var title = mom.format('MMMM YYYY');
		if (is_popout) {
			document.title = title;
		} else {
			chrome.runtime.sendMessage({type:'set-calendar-title',title:title});
		}
		
		updateSelection();
	}
	
	function updateSelection() {
		var totalCount = 0;
		var totalDuration = 0;
		var totalTaskCount = 0;

		$('tr.week-row').each(function() {
			var selectedCount = 0;
			var selectedDuration = 0;
			var selectedTaskCount = 0;

			$(this).find('td:not(.totals).selected').each(function() {
				selectedCount += 1;
				selectedDuration += parseInt($(this).attr('data-duration') || 0,10);
				selectedTaskCount += parseInt($(this).attr('data-taskcount') || 0,10);
			});

			var $totalsCell = $(this).find('td.monthly-total').first();
			if (selectedCount > 0) {
				fillCell($totalsCell,selectedDuration,selectedTaskCount,true);
				$totalsCell.addClass('selected');
				totalCount += selectedCount;
				totalDuration += selectedDuration;
				totalTaskCount += selectedTaskCount;
			} else {
				var duration = parseInt($totalsCell.attr('data-duration') || 0,10);
				var taskCount = parseInt($totalsCell.attr('data-taskcount') || 0,10);
				fillCell($totalsCell,duration,taskCount,true);
				$totalsCell.removeClass('selected');
			}	
		});

		var $monthTotalsCell = $('tr.totals-row td.month-total');
		if (totalCount > 0) {
			fillCell($monthTotalsCell,totalDuration,totalTaskCount,true);
			$monthTotalsCell.addClass('selected');
		} else {
			var duration = parseInt($monthTotalsCell.attr('data-duration') || 0,10);
			var taskCount = parseInt($monthTotalsCell.attr('data-taskcount') || 0,10);
			fillCell($monthTotalsCell,duration,taskCount,true);
			$monthTotalsCell.removeClass('selected');
		}
	}

//****************************************************************************************
// #mark   Events
//****************************************************************************************

	var $billing_picker = $('#billing-picker');
	var $device_picker = $('#device-picker');
	var $project_picker = $('#project-picker');

	if (!Calendar.has_initialized) {
		Calendar.has_initialized = true;
		
		$('#bill-for-label').click(function() {
			var newIndex =  (1 + $billing_picker.get(0).selectedIndex) % $billing_picker.children().length;
			$billing_picker.get(0).selectedIndex = newIndex;
			$billing_picker.trigger('change');
		});

		$billing_picker.change(function() {
			billing_mode = parseInt($(this).val(),10);
			chrome.storage.local.set({'invoice-billing-mode':billing_mode});
		});

		$('#device-label').click(function() {
			var newIndex =  (1 + $device_picker.get(0).selectedIndex) % $device_picker.children().length;
			$device_picker.get(0).selectedIndex = newIndex;
			$device_picker.trigger('change');
		});

		$device_picker.change(function() { update(); });

		$('#project-label').click(function() {
			var newIndex =  (1 + $project_picker.get(0).selectedIndex) % $project_picker.children().length;
			$project_picker.get(0).selectedIndex = newIndex;
			$project_picker.trigger('change');
		});

		$project_picker.change(function() { update(); });

		$('#invoice-notes-checkbox').click(function() {
			add_mobile_notes = $(this).prop('checked');
			chrome.storage.local.set({'annotate-invoice':add_mobile_notes});
		});

		$('#calendar-table .stepper').click(function() {
			if (1 == $(this).index()) {
				var mom = moment();
			} else {
				var mom = moment(current_mstr(),'YYYY-M');
				$(this).index() ? mom.add(1,'month') : mom.subtract(1,'month');
			}
			window.location.hash = '#' + mom.format('YYYY-M');
			$('#calendar-table td').removeClass('selected');
			update();
		});

		var highlight_mode = 0;
		var is_mouse_down = false;

		// Handle mousedown in week cells
		$('#calendar-table .week-row td:not(:first-child):not(:last-child)').mousedown(function() {
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				highlight_mode = 0;
			} else {
				$(this).addClass('selected');
				highlight_mode = 1;
			}
			is_mouse_down = true;
			updateSelection();
		});
		
		// Handle drag in task cells
		$('#calendar-table .week-row td:not(:first-child)').mouseover(function() {
			if (is_mouse_down) {
				$(this).toggleClass('selected',!!highlight_mode);
				updateSelection();
			}
		});
		
		// Handle mouseup for task cells
		$('#calendar-table').bind('mouseup mouseleave',function() {
			is_mouse_down = false;
		});

		// Handle mousedown in totals cells
		$('#calendar-table .week-row td.totals').mousedown(function() {
			var unselected_ct = $(this).parent().find('td:not(:first-child):not(.totals):not(.selected)').length;
			$(this).parent().find('td:not(:first-child)').toggleClass('selected',!!unselected_ct);
			updateSelection();
		});

		// Handle mousedown in top cells
// 		$('#calendar-table .date-cell').mousedown(function() {
// 			var cells = [];
// 			var has_unselected = false;
// 			var idx = $(this).index() - 2;
// 			$('#calendar-table .week-row').each(function() {
// 				var $td = $(this).find('td').eq(idx + 1);
// 				if (!$td.hasClass('selected')) has_unselected = true;
// 				cells.push($td);
// 			});
// 			$.each(cells,function(idx,val) {
// 				val.toggleClass('selected',has_unselected);
// 			});
// 		});

		$('#calendar-table td.notes-cell').click(function(e) {
			if ('INPUT' !== e.target.tagName) $('#invoice-notes-checkbox').click();
		});

		// TODO: This stops working after clicking in the table
		$('#calendar-table').bind('keydown',function(e) {
			switch (e.which) {
				case 37: $('#calendar-table .stepper').eq(0).click(); break;
				case 39: $('#calendar-table .stepper').eq(1).click(); break;
			}
		});

		// Steppers look weird with bolded Helvetica
		if (navigator.userAgent.indexOf('Mac OS X') != -1)
			$('#calendar-table .stepper').css('font-weight','normal');
	}

//****************************************************************************************
// #mark   Main
//****************************************************************************************

		function update() {
			var mstr = current_mstr();
			chrome.runtime.sendMessage({method:'fetch-greater-month',mstr:mstr},function(result) {
				var map = processFetchResult(result);
				renderMonth(map);
			});
			$('#options-table').toggle('leapforce' == user_vendor);
		}

		chrome.storage.onChanged.addListener(function(info,area) {
			if (info['annotate-invoice']) {
				add_mobile_notes = false !== info['annotate-invoice'].newValue;
				$('#invoice-notes-checkbox').prop('checked',add_mobile_notes);
			}
			if (info['date-offset']) {
				use_pacific_timezone = !info['date-offset'].newValue;
				update();
			}
			if (info['invoice-billing-mode']) {
				billing_mode = info['invoice-billing-mode'].newValue || 0;
				$('#billing-picker').val(billing_mode);
				update();
			}
			if (info['week-offset']) {
				start_of_week = info['week-offset'].newValue || 0;
				renderDayNames();
				update();
			}
			if (info['user-vendor']) {
				user_vendor = info['user-vendor'].newValue || 'leapforce';
				update();
			}
		});

		chrome.storage.local.get(['annotate-invoice','date-offset','invoice-billing-mode','user-vendor','week-offset'],function(r) {
			add_mobile_notes = false !== r['annotate-invoice'];
			billing_mode = r['invoice-billing-mode'] || 0;
			start_of_week = r['week-offset'] || 0;
			use_pacific_timezone = !r['date-offset'];
			user_vendor = r['user-vendor'] || 'leapforce';
			$('#billing-picker').val(billing_mode);
			$('#invoice-notes-checkbox').prop('checked',add_mobile_notes);
			$('#calendar-table').css('visibility','visible');
			$('#options-table').toggle('leapforce' == user_vendor);
			renderDayNames();
			update();
		});

		chrome.runtime.onMessage.addListener(function(request,sender,response) {
			if ('refresh-timesheet' == request.type) if ($('#calendar-table').is(':visible')) update(true);
		});

		$('#calendar-table').show();
		if (is_popout) $(document.body).css('padding','8px');
	}
};

Calendar.initialize();
