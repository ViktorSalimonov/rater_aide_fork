function log(msg) { chrome.runtime.sendMessage({method:'log',message:msg}); }
var _v_ = atob('c3Vic2NyaXB0aW9u');

function main() {
	var Alerts = {
		initialize:function() {
			$('#alerts-table input').click(function() {
				$(this).select();
			});
			$('#alerts-table input[type=text]').numeric({negative:true});
		}
	};

	// Menu item clicks
	var dash_mode_timer;
	var last_entered = 0;
	function setDashHoverMode(enabled) {
		$('#dash-mode-table td').off('mouseenter');
		$('#dash-mode-table td').off('mouseleave');
		if (enabled) {
			$('#dash-mode-table td').on('mouseenter',function() {
				var $self = $(this);
				clearTimeout(dash_mode_timer);
				dash_mode_timer = setTimeout(function() {
					$self.click();
				},200);
			});
			$('#dash-mode-table td').on('mouseleave',function() {
				if (dash_mode_timer) clearTimeout(dash_mode_timer);
				dash_mode_timer = 0;
			});
		}
	}
	setDashHoverMode(false);

	$('.menu-item').click(function() {
		var idx = $(this).index();
		setSelectedPane(idx);
		if (0 == idx || 3 == idx) updateVolumeSliders();
		Prefs.set('selected-popup-pane',idx);
	});

	function storeAlertRow(className,callback) {
		var $checkboxes = $('#alerts-table tr.' + className + ' input[type=checkbox].' + className);
		var $enabled = $checkboxes.eq(0);
		var $type_picker = $enabled.closest('tr').find('select.alert-type');
		var $push = $checkboxes.eq(1);
		var enabled = $enabled.prop('checked');
		var value = parseInt($('#alerts-table input[type=text].' + className).val(),10);
		var use_speed = 'speed' == $type_picker.val();
		if (isNaN(value)) { if (callback) callback(false); return; }
		var $picker = $('#alerts-table select.' + className).eq(0);
		function allSounds() {
			var vals = [];
			var type = $picker.val().split('/')[0];
			$picker.find('option').each(function() {
				var val = $(this).val();
				if (0 == val.indexOf(type))
					vals.push($(this).val());
			});
			return vals;
		}
		var random = -1 != $picker.val().indexOf('random');
		var sounds = random ? allSounds() : [$picker.val()];
		var alerts = Prefs.get('alerts') || {};
		var info = alerts[className] || {};
		info.name = className;
		info.enabled = enabled;
		info[(use_speed ? 'speed' : 'surplus')] = value;
		info.sounds = sounds;
		info.use_speed = use_speed;
		info.push = $push.prop('checked');
		alerts[className] = info;
		Prefs.set('alerts',alerts,function() { if (callback) callback(true); });
	}
	
	// When an alert type (surplus, speed) is changed
	$('.alert-type').change(function() {
		var newValue = undefined;
		var alerts = Prefs.get('alerts');
		var className = $(this).closest('tr').attr('class');
		var use_speed = 'speed' == $(this).find(':selected').val();
		var alert_data = alerts && alerts[className];
		if (alert_data) newValue = use_speed ? alert_data.speed : alert_data.surplus;
		if ('undefined' === typeof newValue) {
			var default_speeds = {alert1:95,alert2:105,alert3:115,alert4:125,alert5:150};
			var default_surpluses = {alert1:-5,alert2:5,alert3:10,alert4:30,alert5:60};
			newValue = use_speed ? default_speeds[className] : default_surpluses[className];
		}
		var $text_box = $('#alerts-table input[type=text].' + className).val(newValue);
		storeAlertRow(className,function() {
			chrome.runtime.sendMessage({type:'did-toggle-alert'});
		});
	});

	function updateAlertsUI() {
		var alerts = Prefs.get('alerts');
		for (var i in alerts) {
			var v = alerts[i];
			var $checkboxes = $('#alerts-table tr.' + i + ' input[type=checkbox]');
			var $enabled = $checkboxes.eq(0);
			var $type_picker = $enabled.closest('tr').find('select.alert-type');
			var $push = $checkboxes.eq(1);
			$enabled.prop('checked',!!v.enabled);
			var value = !!v.use_speed ? v.speed : v.surplus;
			if ('undefined' !== typeof value) $('#alerts-table input[type=text].' + i).val(value);
			$type_picker.val(v.use_speed ? 'speed' : 'surplus');
			$('#alerts-table select.' + i).val(v.sounds[0]);
			$push.prop('checked',!!v.push);
			// Enable/disable push row
			var isDisabled = !$enabled.prop('checked');
			$push.prop('disabled',isDisabled);
			$push.closest('table').toggleClass('disabled',isDisabled);
		}
	}
	
	var last_enabled_alert = null;

	// When an alert is checked or unchecked
	$('#alerts-table input[type=checkbox]').change(function() {
		var $this = $(this);
		var id = $this.attr('id');
		var val = $this.prop('checked');
		var name = $this.attr('class');
		if (!id) {
			last_enabled_alert = val ? name : null;
			storeAlertRow(name,function() {
				if (val) chrome.runtime.sendMessage({type:'did-toggle-alert',name:name});
				else chrome.runtime.sendMessage({type:'did-toggle-alert'});
			});
		} else {
			storeAlertRow(name,function() {
				chrome.runtime.sendMessage({type:'did-update-alert'});
			});
		}
	});

	// When an alert textbox changes
	$('#alerts-table input[type=text]').bind('keyup',function(e) {
		// Fix weird bug where minus key doesn't work on fields that are already negative
		if (0 == $(this).val().indexOf('-') && 189 == e.keyCode) {
			$(this).val('-');
		} else {
			storeAlertRow($(this).attr('class'),function() {
				chrome.runtime.sendMessage({type:'did-edit-alert-speed',name:name});
			});
		}
	});
	
	$('#alerts-table .aet-field').keydown(function(e) {
		if (13 == e.which) $(this).find('input').select();
	});
	
	// When an alert sound is selected
	$('#alerts-table select:not(.alert-type)').change(function() {
		var name = $(this).attr('class');
		storeAlertRow(name,function() {
			chrome.runtime.sendMessage({type:'did-select-sound',name:name});
		});
	});

	$('#volume-cell').click(function() {
		var do_mute = !Prefs.get('alerts-muted');
		Prefs.set('alerts-muted',do_mute);
		if (!do_mute) chrome.runtime.sendMessage({type:'volume-did-change',lastEnabledAlert:last_enabled_alert});
		updateVolumeSliders();
	});

	$('#reload-volume-cell').click(function() {
		var do_mute = !Prefs.get('reload-sound-muted');
		Prefs.set('reload-sound-muted',do_mute);
		chrome.runtime.sendMessage({type:'reload-volume-did-change'});
		updateVolumeSliders();
	});

	$('#volume-slider').bind('slider:changed',function(event,data) {
		var vol = data.value < 0.05 ? 0 : data.value.toFixed(2);
		$('#speaker-image').attr('src','img/speaker-' + (!vol ? 'off' : 'on') + '.png');
		if ('true' == $('#volume-slider').attr('data-busy')) return;
		chrome.storage.local.set({'alerts-volume':vol,'alerts-muted':false});
	});

	$('#reload-volume-slider').bind('slider:changed',function(event,data) {
		var vol = data.value < 0.05 ? 0 : data.value.toFixed(2);
		$('#reload-speaker-image').attr('src','img/speaker-' + (!vol ? 'off' : 'on') + '.png');
		if ('true' == $('#reload-volume-slider').attr('data-busy')) return;
		chrome.storage.local.set({'reload-sound-volume':vol,'reload-sound-muted':false});
	});

	$('#volume-slider').bind('slider:didchange',function(event,data) {
		chrome.runtime.sendMessage({type:'volume-did-change',lastEnabledAlert:last_enabled_alert});
	});

	$('#reload-volume-slider').bind('slider:didchange',function(event,data) {
		chrome.runtime.sendMessage({type:'reload-volume-did-change'});
	});

	function updateVolumeSliders() {
		var v = Prefs.get('alerts-volume');
		v = 'undefined' !== typeof v ? v : 1;
		if (Prefs.get('alerts-muted')) v = 0;
		$('#volume-slider').attr('data-busy','true');
		$('#volume-slider').simpleSlider('setValue',v);
		$('#volume-slider').attr('data-busy','false');
		// Reloader volume
		var v = Prefs.get('reload-sound-volume');
		v = 'undefined' !== typeof v ? v : 1;
		if (Prefs.get('reload-sound-muted')) v = 0;
		$('#reload-volume-slider').attr('data-busy','true');
		$('#reload-volume-slider').simpleSlider('setValue',v);
		$('#reload-volume-slider').attr('data-busy','false');
	}

//****************************************************************************************
// #mark   Input Handling
//****************************************************************************************

	$('input, label').parent('td').click(function(e) {
		if ('TD' == $(e.target).prop('tagName')) {
			$(this).find('input, label').eq(0).click();
			return false;
		}
	});

//****************************************************************************************
// #mark   Start/Stop Buttons
//****************************************************************************************

	Prefs.monitor('is-active',function() {
		updateLoginButtons();
		updateDashOptions();
	});

	Prefs.monitor('resumable',function() {
		updateLoginButtons();
		updateDashOptions();
	});

	function updateLoginButtons() {
		var isLoggedIn = Prefs.get('is-active');
		var isResumable = Prefs.get('resumable');
		if (!isLoggedIn && isResumable) {
			$('#three-buttons').show(); $('#two-buttons').hide();
		} else {
			$('#three-buttons').hide(); $('#two-buttons').show();
			$('#toggle-session').text(isLoggedIn ? 'Stop' : 'Start');
		}
	}
	
	$('#new-session').click(function() {
		chrome.runtime.sendMessage({type:'clicked-new-session'});
	});
	
	$('#resume-session, #toggle-session').click(function() {
		chrome.runtime.sendMessage({type:'clicked-toggle-session'});	
	});

	$('.show-sessions').click(function() {
		setTimeout(function() { chrome.runtime.sendMessage({type:'clicked-show-sessions'}); },10);
	});
	
	$(document.body).bind('keydown',function(e) {
		if ($(e.target).is('input') && 'text' == $(e.target).attr('type')) return;
		switch (e.which) {
			case 32: case 13: $('#toggle-session').click(); return false;
		}
	});
	
	updateLoginButtons();

	updateAlertsUI();
	Prefs.monitor('alerts',updateAlertsUI);

	updateTabCountdowns();
	Prefs.monitor('tab-countdowns',updateTabCountdowns);

	updateAutosubmit();
	Prefs.monitor('autosubmit-info',updateAutosubmit);
	
	Alerts.initialize();

//****************************************************************************************
// #mark   Tab Countdowns
//****************************************************************************************

	$('#tabs-table input, select').change(storeTabCountdowns);
	
	function storeTabCountdowns() {
		var modes = [];
		$('.tab-countdown-row').each(function(i) {
			var $this = $(this);
			modes.push({
				enabled:$this.find('input').eq(0).prop('checked'),
				value:$this.find('select').eq(0).val(),
				period:$this.find('select').eq(1).val()
			});
		});
		Prefs.set('tab-countdowns',modes);
		updateTabCountdowns();
	}

	function updateTabCountdowns() {
		var needsStore = false;
		var modes = Prefs.get('tab-countdowns') || [];
		$('.tab-countdown-row').each(function(i) {
			if (i < modes.length) {
				var $this = $(this);
				var $period = $this.find('select').eq(1);
				var mode = modes[i];
				$this.find('input').eq(0).prop('checked',mode.enabled);
				$this.find('select').eq(0).val(mode.value);
				$period.val(mode.period);
				if ('earnings' == mode.value) {
					$period.find('option[value="task"]').prop('hidden',true);
					if ('task' == $period.val()) { $period.val('session'); needsStore = true; }
				} else $period.find('option[value="task"]').prop('hidden',false);
			}
		});
		if (needsStore) storeTabCountdowns();
	}

//****************************************************************************************
// #mark   Dash Options
//****************************************************************************************
	
	var port = chrome.runtime.connect({name:'action-panel'});
	
	chrome.runtime.onMessage.addListener(function(msg) {
		if ('post-user-totals' == msg.type) {
			updateDashOptions(msg.totals);
		}
	});
	
	chrome.runtime.sendMessage({type:'get-user-totals'});

	// Main Menu hover
	var menu_timer;
	var menu_last_entered = 0;
	function setMainMenuHoverMode(enabled) {
		$('.menu-item').off('mouseenter');
		$('.menu-item').off('mouseleave');
		if (enabled) {
			$('.menu-item').on('mouseenter',function() {
				var $self = $(this);
				clearTimeout(menu_timer);
				menu_timer = setTimeout(function() {
					$self.click();
				},200);
			});
			$('.menu-item').on('mouseleave',function() {
				if (menu_timer) clearTimeout(menu_timer);
				dash_mode_timer = 0;
			});
		}
	}
	setMainMenuHoverMode(false);

	$('#dash-mode-table td').click(function(e) {
		var idx = $(this).index();
		var isLoggedIn = !!Prefs.get('is-active');
		var isResumable = !!Prefs.get('resumable');
		var showsSession = isLoggedIn || isResumable;
		if (showsSession) {
			if (0 == idx) {
				Prefs.set('selected-dash-mode-shows-session',true);
			} else {
				Prefs.set('selected-dash-mode-shows-session',false);
				Prefs.set('selected-dash-mode',idx - 1);
			}
		} else Prefs.set('selected-dash-mode',idx - 1);
		updateDashOptions();
	});

	$('#open-popout-timer').click(function() {
		port.postMessage({method:'open-popout-timer'});
	});
	
	$('#surplus-total').closest('td').click(function() {
		var mode = Prefs.get('dash-productivity-mode');
		Prefs.set('dash-productivity-mode','speed' == mode ? 'surplus' : 'speed');
	});

	$('#tabs-table').click(function(e) {
		if ('TD' != $(e.target).prop('tagName')) return;
		$(e.target).find('input').eq(0).click();
		return false;
	});
	
	var last_user_totals;

	function roundedDuration(ms) {	
		var rem = Math.floor(ms || 0) % 60000;
		rem < 30000 ? (ms -= rem) : (ms += (60000 - rem));
		return ms;
	}

	function updateDashOptions(totals) {
		var mode = Prefs.get('selected-dash-mode') || 0;

		if (!totals) totals = last_user_totals;
		else last_user_totals = totals;

		// Select the Session mode if necessary
		var isLoggedIn = !!Prefs.get('is-active');
		var isResumable = !!Prefs.get('resumable');
		var showsSession = isLoggedIn || isResumable;
		if (showsSession && false !== Prefs.get('selected-dash-mode-shows-session')) {
			mode = 0;
		} else {
			mode = Math.min(1 + mode,3); // Legacy users may have had the old setting maxed out
		}
		
		// Set button colors
		$('#dash-mode-table td').removeClass('selected');
		$('#dash-mode-table td').eq(mode).addClass('selected');

		var vars = ['session','day','week','month'];
		var duration = 0;
		var surplus = 0;
		var speed = 0;
		var allotted = 0;
		for (var i=0; i < vars.length; i++) {
			if (i != mode) continue;
			if (totals && totals.duration && 'undefined' !== typeof totals.duration[vars[i]])
				duration = totals.duration[vars[i]];
			if (totals && totals.surplus && 'undefined' !== typeof totals.surplus[vars[i]])
				surplus = totals.surplus[vars[i]];
			if (totals && totals.speed && 'undefined' !== typeof totals.speed[vars[i]])
				speed = totals.speed[vars[i]];
			if (totals && totals.allotted && 'undefined' !== typeof totals.allotted[vars[i]])
				allotted = totals.allotted[vars[i]];
		}
		if (!mode && !isLoggedIn && isResumable && totals && totals.duration.resumable)
			duration = totals.duration.resumable;
		if (!mode && !isLoggedIn && isResumable && totals && totals.surplus.resumable)
			surplus = totals.surplus.resumable;
		if (!mode && !isLoggedIn && isResumable && totals && totals.speed.resumable)
			speed = totals.speed.resumable;
		if (!mode && !isLoggedIn && isResumable && totals && totals.allotted.resumable)
			allotted = totals.allotted.resumable;
		
		if (0 != mode) { duration = roundedDuration(duration); }
			
		$('#duration-total').text(formattedHMS(duration));
		if ('speed' == Prefs.get('dash-productivity-mode')) {
			var rate = Math.min(Math.max(speed,0),0 != allotted ? 9.999 : 1.0);
			if (rate >= 9.99) {
				var pct = '+999.9';
			} else var pct = (Math.floor(rate * 1000) / 10).toFixed(1);
			$('#surplus-total').text(pct + '%');
		} else $('#surplus-total').text(formattedTime(surplus));
		$('#dash-mode-table td').eq(0).toggle(showsSession);
	}

	updateDashOptions();
	Prefs.monitor('selected-dash-mode',function() { updateDashOptions(); });
	Prefs.monitor('dash-productivity-mode',function() { updateDashOptions(); });

//****************************************************************************************
// #mark   Reload options
//****************************************************************************************

	$('.reload-schedule-options').click(function() {
		chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'schedule'});
	});

	$('.reload-types-options').click(function() {
		chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'types'});
	});
	
	$('#reload-push-enabled').change(function() {
		Prefs.set('reload-push-enabled',$(this).prop('checked'));
	});
	
	$('#reload-configure').click(function() {
		chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'push'});
	});

//****************************************************************************************
// #mark   Email
//****************************************************************************************

	function updateEmailUI() {
		var addr = Prefs.get('reload-email-address');
		var addr_list = Prefs.get('reload-email-list') || [];
		var $picker = $('#reload-email-picker').empty();
		var html = '';
		for (var i=0; i < addr_list.length; i++) {
			var val = addr_list[i];
			html += '<option value="' + val + '"' + '>' + val + '</option>';
		}
		if (addr_list.length) html += '<option disabled>----------------</option>';
		html += '<option value="configure">' + (addr_list.length ? 'Configure' : 'Add email address') + '...</option>';
		$picker.append(html);
		if (addr) $picker.val(addr);
	}

	$('#reload-email-enabled').change(function() {
		if (1 == $('#reload-email-picker option').length) {
			$(this).prop('checked',false);
			$('#reload-email-picker').mousedown();
		} else Prefs.set('reload-email-enabled',$(this).prop('checked'));
	});

	$('#reload-email-picker').mousedown(function() {
		if (1 == $(this).children().length) {
			chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'email'});
			return false;
		}
	});

	$('#reload-email-picker').change(function() {
		if ('configure' == $(this).val()) {
			chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'email'});
			return false;
		} else Prefs.set('reload-email-address',$('option:selected',this).val());
	});

//****************************************************************************************
// #mark   SMS
//****************************************************************************************

	function updateSMSUI() {
		var addr = Prefs.get('reload-sms2-address');
		var addr_list = Prefs.get('reload-sms2-list') || [];
		var $picker = $('#reload-sms-picker').empty();
		var html = '';
		for (var i=0; i < addr_list.length; i++) {
			var val = addr_list[i];
			html += '<option value="' + val + '"' + '>' + val + '</option>';
		}
		if (addr_list.length) html += '<option disabled>----------------</option>';
		html += '<option value="configure">' + (addr_list.length ? 'Configure' : 'Add phone number') + '...</option>';
		$picker.append(html);
		if (addr) $picker.val(addr);
	}

	$('#reload-sms-enabled').change(function() {
		if (1 == $('#reload-sms-picker option').length) {
			$(this).prop('checked',false);
			$('#reload-sms-picker').mousedown();
		} else Prefs.set('reload-sms2-enabled',$(this).prop('checked'));
	});

	$('#reload-sms-picker').mousedown(function() {
		if (1 == $(this).children().length) {
			chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'sms'});
			return false;
		}
	});

	$('#reload-sms-picker').change(function() {
		if ('configure' == $(this).val()) {
			chrome.runtime.sendMessage({method:'show-options-page',pane:'reload',section:'sms'});
			return false;
		} else Prefs.set('reload-sms2-address',$('option:selected',this).val());
	});

//****************************************************************************************
// #mark   Other
//****************************************************************************************
	
	Options.initialize();

	$('td.checkbox-label-cell').click(function() {
		$(this).prev().find('input').click();
		return false;
	});

	updateEmailUI();
	updateSMSUI();

	if (!Prefs.get(_v_) && $('#reload-enabled').prop('checked')) $('#reload-enabled').prop('checked',false);

	var pane_idx = Prefs.get('selected-popup-pane');
	if ('undefined' === typeof pane_idx || null === pane_idx) pane_idx = 1;
	setSelectedPane(pane_idx);

//****************************************************************************************
// #mark   Auto-submit
//****************************************************************************************

	$('#autosubmit-table td').each(function(i) {
		var $this = $(this);
		if (0 == i % 2) {
			$this.click(function() { $this.prev().find('input').click(); });
		} else {
			$this.click(function(e) { if ('TD' == $(e.target).prop('tagName')) { $this.find('input').click(); } });
		}
	});
	
	$('#autosubmit-table input').click(function() {
		var $this = $(this);
		$this.closest('table').find('input').each(function() {
			if ($(this).parent().index() != $this.parent().index())
				$(this).prop('checked',false);
		});
		if ($this.prop('checked')) {
			var info = Prefs.get('autosubmit-info') || {};
			info.enabled = true;
			info.mode = $this.attr('name');
			delete info.sid;
			delete info.ttype;
			Prefs.set('autosubmit-info',info);
		} else {
			var info = Prefs.get('autosubmit-info');
			if (info) {
				info.enabled = false;
				Prefs.set('autosubmit-info',info);
			}
		}
	});
	
	function updateAutosubmit() {
		var info = Prefs.get('autosubmit-info');
		var mode = info && info.enabled ? info.mode : -1;
		$('#autosubmit-table input').each(function() {
			$(this).prop('checked',mode === $(this).attr('name'));
		});
	}
	
	// Sliders have to be updated at the bottom for some reason
	updateVolumeSliders();
	Prefs.monitor('alerts-volume',updateVolumeSliders);
	Prefs.monitor('alerts-muted',updateVolumeSliders);
	Prefs.monitor('reload-sound-volume',updateVolumeSliders);
	Prefs.monitor('reload-sound-muted',updateVolumeSliders);
}

//****************************************************************************************
// #mark   Other
//****************************************************************************************

function define(callback) {
	chrome.storage.local.get(_v_,function(r) { callback(!!r[_v_]); });
}

function setSelectedPane(idx) {
	$('#alerts-row').css('display',0 == idx ? '' : 'none');
	$('#dash-row').css('display',1 == idx ? '' : 'none');
	$('#timer-row').css('display',2 == idx ? '' : 'none');
	$('#reloader-row').css('display',3 == idx ? '' : 'none');
	updateMenuLinks();
}

function showSubscription() {
	chrome.storage.local.set({'show-pro-account':Math.floor(Math.random() * 65535),'reload-enabled':false});
}

function updateMenuLinks() {
	var $items = $('.menu-item');
	$items.removeClass('selected');
	$items.eq(0).toggleClass('selected',$('#alerts-row').is(':visible'));
	$items.eq(1).toggleClass('selected',$('#dash-row').is(':visible'));
	$items.eq(2).toggleClass('selected',$('#timer-row').is(':visible'));
	$items.eq(3).toggleClass('selected',$('#reloader-row').is(':visible'));
}

var Options = {
	initialize:function() {
		$('#reload-enabled').click(function() {
			var $this = $(this);
			define(function(s) {
				var val = $this.prop('checked');
				if (!val || s) {
					Prefs.set('reload-enabled',val);
				} else { $this.prop('checked',false); showSubscription(); }
			});
		});
		$('#reload-acquire-enabled').click(function() {
			Prefs.set('reload-acquire-enabled',$(this).prop('checked'));
		});
		$('#reload-acquire-mode').change(function() {
			Prefs.set('reload-acquire-mode',parseInt($(this).val(),10));
		});
		$('#reload-sound-enabled').click(function() {
			var key = 'reload-sound-enabled';
			Prefs.set(key,$(this).prop('checked'));
			Options.updateReloaderUI();
		});
		$('#reload-interval-minutes, #reload-interval-seconds').change(function() {
			var interval = 60000 * $('#reload-interval-minutes').val();
			interval += 1000 * $('#reload-interval-seconds').val()
			if ('reload-interval-minutes' == $(this).attr('id')) {
				interval = interval - (interval % 60000);
				if (0 == $(this).val()) interval += 30000;
			}
			interval = Math.max(interval,2000);
			Prefs.set('reload-interval',interval);
			Options.updateReloaderUI();
		});
		$('#reload-sound-name').change(function() {
			Prefs.set('reload-sound-name',$(this).val());
		});
		$('#reload-sound-repeat').click(function() {
			Prefs.set('reload-sound-repeat',$(this).prop('checked'));
		});
		// Store list of all sound names (for random play)
		var snames = [];
		$('#reload-sound-name option').each(function() { snames.push( $(this).val() ); });
		Prefs.set('reload-all-sound-names',snames);

		this.updateReloaderUI();
		
		Prefs.monitor('reload-enabled',this.updateReloaderUI);
	},
	updateReloaderUI:function() {
		$('#reload-enabled').prop('checked',!!Prefs.get('reload-enabled'));
		$('#reload-acquire-enabled').prop('checked',!!Prefs.get('reload-acquire-enabled'));
		$('#reload-acquire-mode').val(Prefs.get('reload-acquire-mode') ? '1' : '0');
		$('#reload-email-enabled').prop('checked',!!Prefs.get('reload-email-enabled'));
		$('#reload-sms-enabled').prop('checked',!!Prefs.get('reload-sms2-enabled'));
		$('#reload-push-enabled').prop('checked',!!Prefs.get('reload-push-enabled'));

		var sound_enabled = false !== (Prefs.get('reload-sound-enabled'));
		$('#reload-sound-enabled').prop('checked',sound_enabled);
		$('#reload-sound-name').val(Prefs.get('reload-sound-name') || 'default');
		if (!sound_enabled) {
			$('#reload-sound-repeat').prop('checked',false);
			$('#repeat-table input').prop('disabled',true);
			$('#repeat-table td').toggleClass('disabled',true);
		} else {
			$('#reload-sound-repeat').prop('checked',!!Prefs.get('reload-sound-repeat'));
			$('#repeat-table input').prop('disabled',false);
			$('#repeat-table td').toggleClass('disabled',false);
		}

		var interval = Prefs.get('reload-interval');
		if ('undefined' == typeof interval) interval = 60000;
		interval = Math.max(interval,2000);
		var interval_min = Math.floor(interval / 60000);
		var interval_sec = Math.floor(interval % 60000 / 1000);
		$('#reload-interval-minutes').val(interval_min);
		$('#reload-interval-seconds').val(interval_sec);
	}
};

function formattedHMS(ms) {
	ms = Math.abs(ms);
	var mom = moment.duration(ms);
	var h = Math.floor(mom.asHours());
	var m = mom.minutes();
	var s = mom.seconds();
	return (h > 0 ? (h + 'h ') : '') + (m + 'm ') + ((0 == h && s > 0) ? (s + 's') : '');
}

function formattedTime(ms,pad) {
	var n = ms < 0;
	if (n) ms = Math.abs(ms);
	var mom = moment.duration(ms);
	var s = mom.seconds();
	var m = mom.minutes();
	var h = Math.floor(mom.asHours());
	return (n ? '-' : '') + ( (h > 0 || pad) ? (h + ':') : '') +
		((pad || h > 0) && m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;			
}

var Prefs = {
	initialize:function(callback) {
		chrome.storage.onChanged.addListener(function(changes,area) {
			if ('local' != area) return;
			for (var i in changes) Prefs._prefs[i] = changes[i].newValue;
			for (var i in changes) if (Prefs._monitors[i]) Prefs._monitors[i](Prefs._prefs[i]);
		});
		chrome.storage.local.get(null,function(r) { Prefs._prefs = r; if (callback) callback(); });
	},
	get:function(key) { return Prefs._prefs[key]; },
	set:function(key,value,callback) {
		if (null === key || 'undefined' === typeof key) return;
		if (null !== value && 'undefined' !== typeof value) {
			var info = {};
			info[key] = value;
			chrome.storage.local.set(info,callback);
			this._prefs[key] = value;
		} else {
			chrome.storage.local.remove(key,callback);
			delete this._prefs[key];
		}
	},
	monitor:function(key,listener) { this._monitors[key] = listener; },
	_prefs:{},
	_monitors:{}
};

// Disable some Reloader rows if user is viewing the LF Projects page
// chrome.runtime.sendMessage({type:'get-active-tab'},function(tab) {
// 	var is_showing_projects = 0 == tab.url.indexOf('https://www.leapforceathome.com/qrp/core/vendors/projects');
// 	function toggleRow($tr) {
// 		$tr.toggleClass('disabled',is_showing_projects);
// 		$tr.find('input, select').prop('disabled',is_showing_projects);
// 	}
// 	toggleRow($('#reload-enabled').closest('tr'));
// 	toggleRow($('#reload-acquire-enabled').closest('tr'));
// 	Options.updateReloaderUI();
// });

Prefs.initialize(function() {
	$(document.body).css('visibility','visible');
	main();
});
