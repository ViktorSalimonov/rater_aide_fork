var PACIFIC_TIMEZONE = 'America/Los_Angeles';

function dateRangeForMonth(mstr) {
	var mom_start = moment();
	mom_start.tz(PACIFIC_TIMEZONE);
	if (mstr) {
		var c = mstr.split('-');
		mom_start.year(c[0]);
		mom_start.month(c[1] - 1);
	}
	mom_start.startOf('month');
	var mom_end = mom_start.clone().add(1,'M');
	return [mom_start,mom_end];
}

function deviceCountsForSessions(smap) {
	var result = {android:[0,0], iphone:[0,0], ipad:[0,0], google_now:[0,0]};
	$.each(smap, function(sid, s) {
		if (Object.keys(s.types).length) {
			$.each(s.types, function(typeStr, info) {
				if (isGoogleNowTask(typeStr)) {
					result.google_now[0] += info[0];
					// Use a default time of 3m, since many users don't add the actual tasks
					result.google_now[1] += 180000 * info[0];
				} else {
					var device_id = deviceIdForTypeStr(typeStr);
					if (0 == device_id && 8 == deviceIdForSession(s)) device_id = 8;
					switch(device_id) {
						case 1: case 2:
							result.android[0] += info[0];
							result.android[1] += info[1];
						break;
						case 8:
							result.iphone[0] += info[0];
							result.iphone[1] += info[1];
						break;
						case 9:
							result.ipad[0] += info[0];
							result.ipad[1] += info[1];
						break;
					}
				}
			});
		}
	});
	return result;
}

function deviceIdForSession(session) {
	var result = 0;
	if ('iPhone' == session.note) {
		result = 8;
	} else {
		$.each(session.types,function(typeStr,info) {
			var task_device_id = deviceIdForTypeStr(typeStr);
			if (0 != task_device_id) { result = task_device_id; return false; }
		});
	}
	return result;
}

function deviceIdForTypeStr(typeStr) {
	var c = typeStr.split(',');
	return c.length > 2 ? parseInt(c[2],10) : 0;
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

function isGoogleNowTask(typeStr) {
	return !!(/ now|^now|now$/im.exec(typeStr)) && !!(/,180/.exec(typeStr));
}

function mergeNotes(source, insert) {
	if (source === insert) {
		return source;
	} else if (source.length) {
		var stripped = source;
		stripped = stripped.replace(/(, )?(. )?\d+ android mobile (\(\d+h\)?)? ?(\(?\d+m( AET)?\))?(, )?(. )?/im,'');
		stripped = stripped.replace(/(, )?(. )?\d+ iphone mobile (\(\d+h\)?)? ?(\(?\d+m( AET)?\))?(, )?(. )?/im,'');
		stripped = stripped.replace(/(, )?(. )?\d+ ipad mobile (\(\d+h\)?)? ?(\(?\d+m( AET)?\))?(, )?(. )?/im,'');
		stripped = stripped.replace(/(, )?(. )?\d+ google now (\(\d+h\)?)? ?(\(?\d+m( AET)?\))?(, )?(. )?/im,'');
		// Replace any trailing or ending punctuation
		stripped = stripped.replace(/^(, )?(. )?/im,'');
		stripped = stripped.replace(/(, )?(. )?$/im,'');
		return stripped.length ? (stripped + ', ') + insert : insert;
	} else return insert;
}

function noteForDay(smap,pid) {
	if (0 == pid) {
		var notes = [];
		var counts = deviceCountsForSessions(smap);
		if (counts.android[0]) notes.push(counts.android[0] + ' Android Mobile (' + formattedHMS(counts.android[1]) + ' AET)');
		if (counts.iphone[0]) notes.push(counts.iphone[0] + ' iPhone Mobile (' + formattedHMS(counts.iphone[1]) + ' AET)');
		if (counts.ipad[0]) notes.push(counts.ipad[0] + ' iPad Mobile (' + formattedHMS(counts.ipad[1]) + ' AET)');
		if (counts.google_now[0]) notes.push(counts.google_now[0] + ' Google Now (' + formattedHMS(counts.google_now[1]) + ' AET)');
		return notes.join(', ');
	} else {
		return null;
	}
}

function roundedDuration(duration) {
	var rem = duration % 60000;
	rem < 30000 ? (duration -= rem) : (duration += (60000 - rem));
	return duration;
}

function timeForSession(s,billing_mode,is_active) {
	return s.duration || 0;
/*
	var result = 0;
	switch(billing_mode) {
		case 1:
			$.each(s.types,function(typeStr,info) { result += info[2] || 0; });
		break;
		case 2:
			result += s.allotted || s.duration || 0;
			if (is_active && s.task) result -= s.task.allotted || 0;
		break;
		default:
			result += s.duration || 0;
		break;
	}
	return result;
*/
}
