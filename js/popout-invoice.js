function log(msg) { chrome.runtime.sendMessage({method:'log',message:msg}); }

var PACIFIC_TIMEZONE = 'America/Los_Angeles';
var PROJECT_NAMES = {
	'0': 'Yukon',
	'2': 'Nile',
	'3': 'Blue Nile',
	'4': 'Sonora',
	'5': 'White Nile',
	'6': 'Caribou',
	'7': 'Kwango',
	'8': 'Platte',
	'9': 'Thames',
	'10': 'Danube',
	'11': 'Shasta',
	'12': 'Tahoe',
	'13': 'Kern',
	'14': 'Hudson',
	'15': 'Truckee'
};

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
	},
	monitor:function(key,listener) { this.monitors[key] = listener; },
	monitors:{},
	data:{}
};

var $billingModePicker = $('#billing-picker');
var $devicePicker = $('#device-picker');
var $header = $('#header-table');
var $invoiceNotesCheckbox = $('#invoice-notes-checkbox');
var $projectPicker = $('#project-picker');
var $table = $('#invoice-table');
var $templateRow = $('#entry-template');
var $totalCell = $('td.total');

function createRow() {
	return $templateRow.clone().removeAttr('id').show();
}

function update(preserve_selection) {
	var mstr = window.location.hash.replace('#','');
	chrome.runtime.sendMessage({method:'fetch',period:mstr},function(r) {
		var date_pid_info = {};
		var device_ids = {'-1':1};
		var project_ids = {'-1':1};

		// Include active session if it lies in the current month
		var active = r.active;
		var range = dateRangeForMonth(r.mstr);
		if (active && active.start >= range[0].valueOf() && active.start < range[1].valueOf()) {
			r.sessions[active.sid] = active;
		}

		$.each(r.sessions,function(sid,session) {
			if (session.duration > 0) {
				var mom = moment(session.start).tz(PACIFIC_TIMEZONE);
				var dstr = mom.format('M/D/YY');
				var pid = session.pid || 0;
				var deviceId = deviceIdForSession(session);

				// Collect device and project IDs
				device_ids[deviceId] = 1;
				project_ids[pid] = 1;

				// Bail if device or project is not selected
				if (-1 != $devicePicker.val() && deviceId != $devicePicker.val()) return;
				if (-1 != $projectPicker.val() && pid != $projectPicker.val()) return;

				if (!date_pid_info[dstr]) date_pid_info[dstr] = {};
				if (!date_pid_info[dstr][pid]) date_pid_info[dstr][pid] = {
					duration:0,
					smap:{}
				};
				var obj = date_pid_info[dstr][pid];
				obj.smap[sid] = session;

				var billing_mode = parseInt($billingModePicker.val(),10);
				var is_active = active && active.sid == session.sid;
				obj.duration += timeForSession(session,billing_mode,is_active);
			}
		});

		var ordered_dates = Object.keys(date_pid_info);
		ordered_dates.sort(function(a,b) {
			a = parseInt(a.replace(/\//g,''),10);
			b = parseInt(b.replace(/\//g,''),10);
			return a < b ? -1 : 1;
		});

		var $tbody = $table.find('tbody');
		var $rows = $tbody.children();

		var selected_indexes = [];
		if (preserve_selection) {
			$rows.each(function() {
				if ($(this).is('.selected')) selected_indexes.push($(this).index());
			});
		}

		$rows.remove();

		var last_class = '';
		$.each(ordered_dates,function(idx,date) {
			var pid_info = date_pid_info[date];
			var $newRow = null;
			$.each(pid_info,function(pid,info) {
				$newRow = createRow();
				$tbody.append($newRow);
				var $cells = $newRow.find('td');
				// Date
				$cells.eq(0).text(date);
				// Project name
				var $spans = $cells.find('span');
				$spans.eq(0).text(PROJECT_NAMES[pid]);
				// Mobile device notes
				if ($invoiceNotesCheckbox.prop('checked')) {
					$spans.eq(1).text(noteForDay(info.smap,pid) || '');
				} else $spans.eq(1).text('');
				// Time spent
				var duration = moment.duration(roundedDuration(info.duration));
				var hours = Math.floor(duration.asHours());
				var minutes = duration.minutes();
				$cells.eq(2).text(hours + 'h ' + minutes + 'm');
				$newRow.addClass(last_class).removeClass('disabled');
			});
			if ($newRow) last_class = last_class ? '' : 'shaded';
		});

		if (selected_indexes.length) {
			$rows = $tbody.children();
			$.each(selected_indexes,function(idx,val) {
				$rows.eq(val).addClass('selected');
			});
		}

		// Add dummy rows if fewer than four (4) entries
		for (var i=0; i < (4 - ordered_dates.length); i++) {
			var showEmpty = 0 == i && 0 == ordered_dates.length;
			var $newRow = createRow();
			$tbody.append($newRow);
			var $cells = $newRow.find('td');
			$cells.eq(0).html('&nbsp;');
			var $spans = $cells.find('span');
			$spans.eq(0).text(showEmpty ? 'No entries' : '');
			$spans.eq(1).text('');
			$cells.eq(2).text('');
			$newRow.addClass('disabled');
		}

		// Disable unused project picker options
		$projectPicker.find('option').each(function() {
			$(this).attr('hidden','undefined' === typeof project_ids[$(this).val()]);
		});

		// Disable unused device picker options
		$devicePicker.find('option').each(function() {
			$(this).attr('hidden','undefined' === typeof device_ids[$(this).val()]);
		});
		
		updateTotalCell();

		chrome.runtime.sendMessage({
			type:'invoice-did-load',
			height:$table.height(),
			mstr:r.mstr
		});
	});
}

function updateTotalCell() {
	var selected_minutes = 0;
	var total_minutes = 0;
	$('tbody tr td:last-child').each(function() {
		var comps = $(this).text().split(' ');
		if (2 == comps.length) {
			var minutes = (60 * parseInt(comps[0],10)) + parseInt(comps[1],10);
			if (!isNaN(minutes)) {
				if ($(this).parent().is('.selected')) selected_minutes += minutes;
				total_minutes += minutes;
			}
		}
	});
	var mom = moment.duration(60000 * (selected_minutes > 0 ? selected_minutes : total_minutes));
	$totalCell.text(Math.floor(mom.asHours()) + 'h ' + mom.minutes() + 'm');
	$totalCell.toggleClass('selected',selected_minutes > 0);	
}

var $clicked_row = null;
var is_selecting = true;

$billingModePicker.on('change',function() {
	Prefs.set('invoice-billing-mode',parseInt($(this).val(),10));
	update(true);
});

$devicePicker.on('change',function() {
	update(false);
});

$invoiceNotesCheckbox.on('change',function() {
	Prefs.set('annotate-invoice',$(this).prop('checked'));
	update(true);
});

$projectPicker.on('change',function() {
	update(false);
});

$table.on('mousedown','tr:not(.disabled)',function() {
	$clicked_row = $(this);
	is_selecting = !$clicked_row.hasClass('selected');
	$clicked_row.toggleClass('selected',is_selecting);
	updateTotalCell();
});

$table.on('mouseenter','tr:not(.disabled)',function() {
	if ($clicked_row) {
		if ($clicked_row.index() < $(this).index()) {
			$clicked_row.nextUntil($(this)).each(function() {
				$(this).toggleClass('selected',is_selecting);
			});
		} else if ($(this).index() < $clicked_row.index()) {
			$(this).nextUntil($clicked_row).each(function() {
				$(this).toggleClass('selected',is_selecting);
			});
		}
		$(this).toggleClass('selected',is_selecting);
		updateTotalCell();
	}
});

$table.on('mouseup','tr',function() { $clicked_row = null; });

$table.on('mouseleave',function() { $clicked_row = null; });

$('#header-table, #footer-table td.total').on('click',function() {
	$('#invoice-table tr').removeClass('selected');
	updateTotalCell();
});

$header.on('click','.step.back',function() {
	var mstr = window.location.hash.replace('#','');
	var m = parseInt(mstr.split('-')[1],10);
	var y = parseInt(mstr.split('-')[0],10);
	if (m <= 1) {
		y = y - 1;
		m = 12;
	} else m = m - 1;
	window.location.hash = '#' + (y + '-' + m);
	update(false);
});

$header.on('click','.step.next',function() {
	var mstr = window.location.hash.replace('#','');
	var m = parseInt(mstr.split('-')[1],10);
	var y = parseInt(mstr.split('-')[0],10);
	if (m >= 12) {
		y = y + 1;
		m = 1;
	} else m = m + 1;
	window.location.hash = '#' + (y + '-' + m);
	update(false);
});

$header.on('click','.step.reset',function() {
	window.location.hash = '#' + moment().format('YYYY-M');
	update(false);
});

chrome.runtime.onMessage.addListener(function(request,sender,response) {
	if ('refresh-timesheet' == request.type) update(true);
});

Prefs.initialize(function() {
	$invoiceNotesCheckbox.prop('checked',false !== Prefs.get('annotate-invoice'));
	$billingModePicker.val(Prefs.get('invoice-billing-mode') || 0);
	update(false);
});
