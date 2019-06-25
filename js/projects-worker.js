/*jscrambler
{
    "ignore_transformations_@": {
        "no_xform": {
            "*": true
        }
    }
}
*/

(function() {
	var RELOADER_SOUNDBOARD = 'https://www.rateraide.com/audio/ogg/reloader/';
	var MANKEY = atob('M3RqQzB4TkF0TlhZTmdidW96V1BOUQ==');
	var current_ra = Date.now().toString();
	sessionStorage.setItem('current-ra',current_ra);
	function commas(s) { return s ? s.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',') : '0'; }
	function log(msg) { chrome.runtime.sendMessage({method:'log',message:msg}); }
	var Prefs = {
		initialize:function(callback) {
			chrome.storage.local.get(null,function(r) { Prefs._prefs = r; if (callback) callback(); });
			chrome.storage.onChanged.addListener(function(changes,area) {
				if ('local' == area) {
					for (var key in changes)
						Prefs._prefs[key] = changes[key].newValue;
					for (var key in changes)
						if (Prefs._monitors[key]) Prefs._monitors[key](Prefs._prefs[key]);
				}
			});
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
	Prefs.initialize(function() {
		var $project_list = $('#project-list');
		function parseProjectInfo() {
			var project_info = {date:Date.now(),counts:{}};
			$('.project-sub-title a').each(function() {
				var url = $(this).attr('href');
				if (url && 0 == url.indexOf('/qrp/core/vendors/task/view/')) {
					var project_name = $(this).closest('tr').find('.title-text a').eq(0).text().trim();
					var project_count = parseInt($(this).text().trim().replace(/,/g,''),10);
					if (project_name && !isNaN(project_count)) project_info.counts[project_name] = project_count;
				}
			});
			return Object.keys(project_info.counts).length ? project_info : null;
		}
		function playSound(sound_name) {
			if (!window.players) window.players = {};
			for (var i in window.players) window.players[i].pause();
			if ('random' == sound_name) {
				var all_sounds = Prefs.get('reload-all-sound-names');
				sound_name = all_sounds[Math.floor(Math.random() * (all_sounds.length - 1))];
			}
			if (sound_name) {
				var player = window.players[sound_name] || new Audio();
				var url = RELOADER_SOUNDBOARD + sound_name + '.ogg';
				if (player.src != url) player.src = url;
				if (player.currentTime) player.currentTime = 0;
				window.players[sound_name] = player;
				player.play();
			}
		}
		function renderDiv() {
			"jscrambler ignore_transformations_@ no_xform";
			if ($project_list.find('tr').length) {
				$('#ra-reloader').remove();
				var $tab = $('#project-list').after('<div id="ra-reloader" style="margin-left:2px; padding:10px 0 10px 0; -webkit-user-select:none; -moz-user-select:none; ms-user-select:none"><table style="border-collapse:collapse"><tr><td class="switch"></td><td class="switch" style="padding-left:8px"><input type="checkbox" style="outline:none"></td><td class="switch" style="cursor:default">Check for available tasks:</td><td style="padding:0 4px"><select style="outline:none"><option value="1">Every minute</option><option value="5">Every 5 minutes</option><option value="10">Every 10 minutes</option><option value="15">Every 15 minutes</option><option value="30">Every 30 minutes</option><option value="60">Every hour</option></select></td><td></td><td style="padding-left:4px; text-decoration:underline; cursor:pointer"><a>Configure alerts...</a></td></tr></table></div>');
				var $div = $('#ra-reloader');
				$div.find('td:first-child').append('<table cellpadding=0 cellspacing=0 height=19 width=19 style="font-size:0px;height:19;width:19"><tr><td><table cellpadding=0 cellspacing=0 height=19 width=19 style="font-size:0px;height:19px;width:19px"><tr height=0><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /><td width=1 /></tr><tr height=1><td colspan=6 bgcolor="#0099ff" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#0068ad" style=opacity:0.12;filter:alpha(opacity=12) /><td bgcolor="#0074c1" style=opacity:0.48;filter:alpha(opacity=48) /><td bgcolor="#007dd0" style=opacity:0.67;filter:alpha(opacity=67) /><td bgcolor="#0080d6" style=opacity:0.74;filter:alpha(opacity=73) /><td bgcolor="#007dd1" style=opacity:0.68;filter:alpha(opacity=67) /><td bgcolor="#0075c3" style=opacity:0.50;filter:alpha(opacity=49) /><td bgcolor="#0067ac" style=opacity:0.16;filter:alpha(opacity=15) /><td colspan=3 bgcolor="#0099ff" style="opacity:0;filter:alpha(opacity=0)" /><td colspan=3 rowspan=3 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td colspan=4 bgcolor="#0097fd" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#0062a5" style=opacity:0.08;filter:alpha(opacity=7) /><td bgcolor="#007bce" style=opacity:0.68;filter:alpha(opacity=67) /><td bgcolor="#0093f6" style=opacity:0.97;filter:alpha(opacity=96) /><td colspan=5 bgcolor="#0097fd" /><td bgcolor="#0094f8" style=opacity:0.98;filter:alpha(opacity=98) /><td bgcolor="#007dd1" style=opacity:0.71;filter:alpha(opacity=70) /><td bgcolor="#0066ac" style=opacity:0.12;filter:alpha(opacity=12) /><td bgcolor="#0097fd" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td colspan=3 bgcolor="#0096fc" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#006cb5" style=opacity:0.31;filter:alpha(opacity=30) /><td bgcolor="#0091f4" style=opacity:0.96;filter:alpha(opacity=96) /><td colspan=9 bgcolor="#0096fc" /><td bgcolor="#0093f7" style=opacity:0.98;filter:alpha(opacity=98) /><td bgcolor="#006eb9" style=opacity:0.38;filter:alpha(opacity=38) /></tr><tr height=1><td colspan=2 bgcolor="#0093f9" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#0069b2" style=opacity:0.27;filter:alpha(opacity=27) /><td colspan=4 bgcolor="#0093f9" /><td bgcolor="#71c3fc" /><td colspan=3 bgcolor="#9ed6fd" /><td bgcolor="#7cc8fc" /><td colspan=4 bgcolor="#0093f9" /><td bgcolor="#006bb6" style=opacity:0.36;filter:alpha(opacity=36) /><td colspan=2 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td bgcolor="#0091f7" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#005ea0" style=opacity:0.07;filter:alpha(opacity=6) /><td bgcolor="#008ff3" style=opacity:0.98;filter:alpha(opacity=98) /><td colspan=4 bgcolor="#0091f7" /><td bgcolor="#d8eefe" /><td colspan=3 rowspan=4 bgcolor="#ffffff" /><td bgcolor="#eff8fe" /><td colspan=5 bgcolor="#0091f7" /><td bgcolor="#0062a8" style=opacity:0.12;filter:alpha(opacity=12) /><td rowspan=2 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td bgcolor="#008ef4" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#0075c9" style=opacity:0.69;filter:alpha(opacity=69) /><td colspan=5 bgcolor="#008ef4" /><td bgcolor="#b6dffc" /><td bgcolor="#c9e7fd" /><td colspan=5 bgcolor="#008ef4" /><td bgcolor="#0079d0" style=opacity:0.77;filter:alpha(opacity=77) /></tr><tr height=1><td bgcolor="#005ea4" style=opacity:0.10;filter:alpha(opacity=9) /><td bgcolor="#008aef" style=opacity:0.99;filter:alpha(opacity=99) /><td colspan=5 bgcolor="#008bf1" /><td bgcolor="#aad8fa" /><td bgcolor="#c0e2fc" /><td colspan=6 bgcolor="#008bf1" /><td bgcolor="#0060a7" style=opacity:0.19;filter:alpha(opacity=19) /></tr><tr height=1><td bgcolor="#0068b6" style=opacity:0.50;filter:alpha(opacity=49) /><td colspan=2 bgcolor="#0088ee" /><td bgcolor="#64b7f5" /><td colspan=3 bgcolor="#a2d4f9" /><td bgcolor="#e4f2fd" /><td bgcolor="#ebf6fe" /><td colspan=3 bgcolor="#a2d4f9" /><td bgcolor="#64b7f5" /><td colspan=2 bgcolor="#0088ee" /><td bgcolor="#006aba" style=opacity:0.58;filter:alpha(opacity=57) /></tr><tr height=1><td bgcolor="#006ec2" style=opacity:0.70;filter:alpha(opacity=70) /><td colspan=2 bgcolor="#0085eb" /><td bgcolor="#b6dcf9" /><td colspan=11 rowspan=3 bgcolor="#ffffff" /><td bgcolor="#b6dcf9" /><td colspan=2 bgcolor="#0085eb" /><td bgcolor="#006fc3" style=opacity:0.71;filter:alpha(opacity=71) /></tr><tr height=1><td bgcolor="#006ec5" style=opacity:0.76;filter:alpha(opacity=76) /><td colspan=2 bgcolor="#0081e7" /><td bgcolor="#9ecff6" /><td bgcolor="#9ecff6" /><td colspan=2 bgcolor="#0081e7" /><td bgcolor="#006dc3" style=opacity:0.76;filter:alpha(opacity=75) /></tr><tr height=1><td bgcolor="#0068bd" style=opacity:0.71;filter:alpha(opacity=70) /><td colspan=2 bgcolor="#007ee4" /><td bgcolor="#abd5f6" /><td bgcolor="#abd5f6" /><td colspan=2 bgcolor="#007ee4" /><td bgcolor="#0069be" style=opacity:0.72;filter:alpha(opacity=71) /></tr><tr height=1><td bgcolor="#005eac" style=opacity:0.53;filter:alpha(opacity=52) /><td colspan=2 bgcolor="#007ae0" /><td bgcolor="#87c0f0" /><td colspan=3 bgcolor="#dbecfb" /><td bgcolor="#f5fafe" /><td colspan=3 rowspan=4 bgcolor="#ffffff" /><td bgcolor="#f7fbfe" /><td colspan=3 bgcolor="#dbecfb" /><td bgcolor="#87c0f0" /><td colspan=2 bgcolor="#007ae0" /><td bgcolor="#0060b1" style=opacity:0.59;filter:alpha(opacity=59) /></tr><tr height=1><td bgcolor="#005298" style=opacity:0.13;filter:alpha(opacity=12) /><td colspan=6 bgcolor="#0077dd" /><td bgcolor="#b0d5f4" /><td bgcolor="#c5e0f7" /><td colspan=6 bgcolor="#0077dd" /><td bgcolor="#00549b" style=opacity:0.22;filter:alpha(opacity=22) /></tr><tr height=1><td bgcolor="#0074da" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#0061b6" style=opacity:0.73;filter:alpha(opacity=72) /><td colspan=5 bgcolor="#0074da" /><td bgcolor="#b5d7f4" /><td bgcolor="#c8e1f7" /><td colspan=5 bgcolor="#0074da" /><td bgcolor="#0065bd" style=opacity:0.80;filter:alpha(opacity=80) /><td rowspan=2 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td bgcolor="#0071d7" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#004e95" style=opacity:0.09;filter:alpha(opacity=9) /><td bgcolor="#0071d7" style=opacity:1.00;filter:alpha(opacity=99) /><td colspan=4 bgcolor="#0071d7" /><td bgcolor="#d8e9f9" /><td bgcolor="#eff6fc" /><td colspan=5 bgcolor="#0071d7" /><td bgcolor="#004f97" style=opacity:0.16;filter:alpha(opacity=15) /></tr><tr height=1><td colspan=2 bgcolor="#006ed4" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#00509a" style=opacity:0.35;filter:alpha(opacity=34) /><td colspan=4 bgcolor="#006ed4" /><td bgcolor="#71aee7" /><td colspan=3 bgcolor="#9ec8ef" /><td bgcolor="#7cb5e9" /><td colspan=4 bgcolor="#006ed4" /><td bgcolor="#00529f" style=opacity:0.44;filter:alpha(opacity=43) /><td colspan=2 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td colspan=3 bgcolor="#006cd2" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#004f9a" style=opacity:0.38;filter:alpha(opacity=38) /><td bgcolor="#006bd0" style=opacity:0.99;filter:alpha(opacity=99) /><td colspan=10 bgcolor="#006cd2" /><td bgcolor="#00519d" style=opacity:0.45;filter:alpha(opacity=45) /><td colspan=3 rowspan=3 bgcolor="#000000" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td colspan=4 bgcolor="#0069cf" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#00488f" style=opacity:0.16;filter:alpha(opacity=16) /><td bgcolor="#0058ae" style=opacity:0.74;filter:alpha(opacity=73) /><td colspan=7 bgcolor="#0069cf" /><td bgcolor="#0059b0" style=opacity:0.76;filter:alpha(opacity=76) /><td bgcolor="#004a91" style=opacity:0.21;filter:alpha(opacity=21) /><td bgcolor="#0069cf" style="opacity:0;filter:alpha(opacity=0)" /></tr><tr height=1><td colspan=6 bgcolor="#0068ce" style="opacity:0;filter:alpha(opacity=0)" /><td bgcolor="#004991" style=opacity:0.21;filter:alpha(opacity=21) /><td bgcolor="#0051a1" style=opacity:0.55;filter:alpha(opacity=54) /><td bgcolor="#0056aa" style=opacity:0.69;filter:alpha(opacity=68) /><td bgcolor="#0057ad" style=opacity:0.74;filter:alpha(opacity=73) /><td bgcolor="#0056aa" style=opacity:0.70;filter:alpha(opacity=69) /><td bgcolor="#0052a2" style=opacity:0.56;filter:alpha(opacity=56) /><td bgcolor="#004a92" style=opacity:0.24;filter:alpha(opacity=24) /><td colspan=3 bgcolor="#0068ce" style="opacity:0;filter:alpha(opacity=0)" /></tr></table></td></tr></table>');			
				var $switch = $div.find('input').eq(0);
				$switch.bind('click',function() { Prefs.set('reload-projects-enabled',$(this).prop('checked')); });
				$div.find('.switch').bind('click',function(e) { if ('INPUT' != e.target.tagName) $switch.click(); });
				$div.find('select').bind('change',function() { Prefs.set('reload-projects-interval',parseInt($(this).val(),10)); });
				$div.find('a').bind('click',function() {
					window.alert('Configure sound, email and SMS alerts by clicking the RaterAide icon at the top right of the window.\n\nAlerts are sent when tasks appear for a project that previously had zero available tasks.\n\nGood luck!');
					Prefs.set('selected-popup-pane',2);
				});
				updateReloading();
			}
		}
		function setTabCountdown(val) {
			var separator = ' • ';
			if (!window.original_title) window.original_title = document.title.split(separator)[0];
			if (null !== val) {
				var title = document.title.split(separator)[0];
				title = title + separator + Math.max(val,0);
				document.title = title;
			} else if (window.original_title !== document.title) document.title = window.original_title;
		}
		function updateReloading() {
			var reload_enabled = !!Prefs.get('reload-projects-enabled');
			var reload_interval = Prefs.get('reload-projects-interval') || 1;
			var $div = $('#ra-reloader');
			$div.find('input').eq(0).prop('checked',reload_enabled);
			$div.find('select').val(reload_interval);
			if (reload_enabled) {
				var target = 60 * reload_interval;
				window.ra_elapsed = 0;
				clearInterval(window.ra_timer);
				window.ra_timer = setInterval(function() {
					if (current_ra != sessionStorage.getItem('current-ra')) {
						clearInterval(window.ra_timer);
						return;
					}
					++window.ra_elapsed;
					setTabCountdown(target - window.ra_elapsed);
					if (target - window.ra_elapsed <= 0) {
						chrome.runtime.sendMessage({method:'projects-will-reload'});
						window.location.href = 'https://www.leapforceathome.com/qrp/core/vendors/projects';
						clearInterval(window.ra_timer);
					}
				},1000);
				setTabCountdown(target);
				// Parse project counts and compare the new counts
				var info = parseProjectInfo();
				if (info) {
					var now = Date.now();
					var last_info = Prefs.get('reload-projects-info');
					if (last_info) {
						var max_elapsed_ms = (target * 1000) + 30000;
						var elapsed = now - last_info.date;
						var since = Date.now() - (Prefs.get('last-projects-change') || 0);
						if (elapsed <= max_elapsed_ms && since >= 10000) {
							for (var i in info.counts) {
								if (info.counts[i] > 0 && 0 === last_info.counts[i]) {
									Prefs.set('last-projects-change',Date.now());

									// Create notification message
									var ct = info.counts[i];
									var subject = commas(ct) + ' ' + i + ' Task' + (1 == ct ? '' : 's') + ' Available!';
									var body = 'Project ' + i + ' now has ' + commas(ct) + ' available task' + (1 == ct ? '' : 's') + '.';

									// Show desktop notification
									chrome.runtime.sendMessage({method:'show-projects-notification',message:subject});
								
									// Play notification sound
									var sound_enabled = Prefs.get('reload-sound-enabled');
									var sound_name = Prefs.get('reload-sound-name');									
									if (sound_enabled && sound_name) playSound(sound_name);

									// Send email notifications
									var email_enabled = Prefs.get('reload-email-enabled');
									var email_address = Prefs.get('reload-email-address');
									if (email_enabled && email_address) {
										var obj = {
											"key":MANKEY,
											"message":{
												"text":body,
												"subject":subject,
												"from_email":"alerts@rateraide.com",
												"from_name":"RaterAide",
												"to":[{"email":email_address,"type":"to"}],
												"headers":{"Reply-To":"no-reply@rateraide.com"}
											},
											"send_at":"1970-01-01 00:00:00"
										};
										var xhr = new XMLHttpRequest();
										xhr.open('POST','https://mandrillapp.com/api/1.0/messages/send.json',true);
										xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
										xhr.onreadystatechange = function() {
											if (4 == xhr.readyState) Prefs.set('last-email-date',Date.now());
										}
										xhr.send(JSON.stringify(obj));
									} else if (Prefs.get('reload-sms2-enabled')) {
										var addr = Prefs.get('reload-sms2-address');
										var obj = {to:addr,body:'RA: ' + body};
										var xhr = new XMLHttpRequest();
										xhr.open('POST','https://www.rateraide.com/api/sms-rest.php',true);
										xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
										xhr.onreadystatechange = function() {
											if (xhr.readyState == 4) {
												var result = {status:'fail',reason:'Unknown error'};
												try {
													result = JSON.parse(xhr.responseText);
												} catch (e) {}
												if ('sent' == result.status) {
													Prefs.set('last-sms-date',Date.now());
												}
											}
										}
										xhr.send(JSON.stringify(obj));
									} else if (Prefs.get('reload-push-enabled')) {
/*
										var user = Prefs.get('user');
										if (user && user.uid) {
											$.ajax({
												contentType:'application/json',
												data:JSON.stringify({
													'channel':'reloader_' + user.uid,
													'data':{'alert':body},
												}),
												headers:{
													'X-Parse-Application-Id':'SBNQKHcVr4fa8B8s9DDzFqMIxPDCwelr4jTpib8y',
													'X-Parse-REST-API-Key':'p7B11FlrB2CDpwzttx5FQAgtm6NoYniVaNTHlwAv'
												},
												type:'POST',
												url:'https://api.parse.com/1/push'
											});
										}
*/										
									}
								}
							}
						}
					}
					Prefs.set('reload-projects-info',info);
					return;
				}
			}
			clearInterval(window.ra_timer);
			setTabCountdown(null);
		}
		function updateSounds(do_play) {
			var sound_enabled = Prefs.get('reload-sound-enabled');
			var sound_name = Prefs.get('reload-sound-name');
			playSound(sound_enabled && sound_name);
		}
		Prefs.monitor('reload-projects-enabled',function() {
			if (current_ra != sessionStorage.getItem('current-ra')) return;
			Prefs.set('reload-projects-info',null);
			updateReloading();
		});
		Prefs.monitor('reload-projects-interval',function() {
			if (current_ra != sessionStorage.getItem('current-ra')) return;
			Prefs.set('reload-projects-info',null);
			updateReloading();
		});
		Prefs.monitor('reload-sound-enabled',function(r) {
			playSound(r ? (Prefs.get('reload-sound-name') || 'default') : null);
		});
		Prefs.monitor('reload-sound-name',playSound);
		setTimeout(function() { renderDiv(); },1000);
	});
})();
