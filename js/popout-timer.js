function log(msg) { chrome.runtime.sendMessage({method:'log',message:msg}); }

var is_action_panel = !!(parent && parent.document && -1 != parent.document.URL.indexOf('popup.html'));
var is_extension = 0 == document.URL.indexOf('chrome-extension');
var is_node = 'undefined' !== typeof process;
var is_web_popout = !is_extension && !is_node && self == top;

var Prefs = {
	initialize:function(callback) {
		chrome.storage.onChanged.addListener(function(changes,area) {
			if ('local' == area) {
				for (var key in changes)
					Prefs._prefs[key] = changes[key].newValue;
				for (var key in changes)
					if (Prefs._monitors[key]) Prefs._monitors[key](Prefs._prefs[key]);
			}
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

var $typeSelect = $('#task-type').selectize({
	create:true,
	valueField:'value',
	labelField:'type',
	sortField:'type'
})[0].selectize;

$typeSelect.addOption({type:'EXP Mobile',value:'EXP Mobile'});
$typeSelect.addOption({type:'SxS Mobile',value:'SxS Mobile'});
$typeSelect.refreshOptions(false);

var $aetSelect = $('#task-aet').selectize({
	create:true,
	valueField:'aet',
	labelField:'time',
	sortField:'aet'
})[0].selectize;

$aetSelect.addOption({aet:120,time:'2:00'});
$aetSelect.addOption({aet:480,time:'8:00'});
$aetSelect.addOption({aet:540,time:'9:00'});
$aetSelect.addOption({aet:600,time:'10:00'});
$aetSelect.addOption({aet:720,time:'12:00'});
$aetSelect.addOption({aet:840,time:'14:00'});
$aetSelect.refreshOptions(false);

var $deviceSelect = $('#task-device').selectize({
	create:false,
	valueField:'value',
	labelField:'name',
	sortField:'value',
	onDelete:function() {
		$deviceSelect.addItem(0);
	}
})[0].selectize;

$deviceSelect.addOption({value:0,name:'Desktop'});
$deviceSelect.addOption({value:1,name:'Android Phone'});
$deviceSelect.addOption({value:2,name:'Android Tablet'});
$deviceSelect.addOption({value:8,name:'iPhone'});
$deviceSelect.addOption({value:9,name:'iPad'});
$deviceSelect.refreshOptions(false);
$deviceSelect.addItem(0);

var $projectSelect = $('#session-project').selectize({
	create:false,
	valueField:'value',
	labelField:'name',
	sortField:'index'
})[0].selectize;

$projectSelect.addOption({value:15,name:'Truckee',index:14});
$projectSelect.addOption({value:14,name:'Hudson',index:13});
$projectSelect.addOption({value:13,name:'Kern',index:12});
$projectSelect.addOption({value:12,name:'Tahoe',index:11});
$projectSelect.addOption({value:11,name:'Shasta',index:10});
$projectSelect.addOption({value:10,name:'Danube',index:9});
$projectSelect.addOption({value:9,name:'Thames',index:8});
$projectSelect.addOption({value:8,name:'Platte',index:7});
$projectSelect.addOption({value:7,name:'Kwango',index:6});
$projectSelect.addOption({value:6,name:'Caribou',index:5});
$projectSelect.addOption({value:4,name:'Sonora',index:4});
$projectSelect.addOption({value:5,name:'White Nile',index:3});
$projectSelect.addOption({value:3,name:'Blue Nile',index:2});
$projectSelect.addOption({value:2,name:'Nile',index:1});
$projectSelect.addOption({value:0,name:'Yukon',index:0});
$projectSelect.refreshOptions(false);
$projectSelect.addItem(0);

//****************************************************************************************
// #mark   jQuery Selectors
//****************************************************************************************

var $resumeRow = $('#session-resume-row');
var $startRow = $('#session-start-row');
var $stopRow = $('#session-stop-row');
var $submitButton = $('.submit-task');

//****************************************************************************************
// #mark   UI Updates
//****************************************************************************************

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

var isAnimating = false;
var isSettingTaskInfo = false;

function setTaskInfo(info) {
	isSettingTaskInfo = true;
	var type = info && info.type;
	var aetSeconds = info && info.time;
	var deviceId = (info && info.deviceId) || 0;
	var projectId = (info && info.projectId) || 0;

	var lastTaskInfo = selectedTaskInfo();
	var didChange = lastTaskInfo && aetSeconds && lastTaskInfo.time != aetSeconds;
	var isActive = Prefs.get('is-active');

	if (isActive && didChange && !isAnimating) {
		isAnimating = true;
		var $numbers = $('.ticker-numbers').eq(0);
		var $numbers2 = $numbers.clone();
		$numbers.find('.ticker-text').removeClass('ticker-text');
		$numbers.addClass('to-delete');
		$numbers.one('webkitAnimationEnd oanimationend animationend',function () {
			$('.to-delete').remove();
		});
		$numbers2.one('webkitAnimationEnd oanimationend animationend',function () {
			$numbers2.removeClass('animated slideInDown slideInRight');
			isAnimating = false;
		});
		$numbers.parent().append($numbers2);
		$numbers.css('-webkit-animation-duration','.5s').addClass('animated slideOutDown');
		$numbers2.css('-webkit-animation-duration','.2s').addClass('animated slideInDown');
	}

	if (type && 'undefined' !== typeof aetSeconds) {
		$typeSelect.addOption({
			type:type,
			value:type
		});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		// Set AET field
		var timeStr = formattedTime(aetSeconds * 1000);
		$aetSelect.addOption({
			aet:aetSeconds,
			time:timeStr
		});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(aetSeconds);
		// Set device and project fields
		$deviceSelect.addItem(deviceId);
		$projectSelect.addItem(projectId);
	}

	$('.ticker-text').css('visibility','visible')

	isSettingTaskInfo = false;
}

function setTaskList(types) {
	if (!types) return;
	isSettingTaskInfo = true;
	for (var i in types) {
		var c = i.split(',');
		if (c[0]) $typeSelect.addOption({type:c[0],value:c[0]});
		if (c[1]) {
			var aetSeconds = parseInt(c[1],10);
			var timeStr = formattedTime(aetSeconds * 1000);
			$aetSelect.addOption({aet:aetSeconds,time:timeStr});
		}
	}
	$typeSelect.refreshOptions(false);
	$aetSelect.refreshOptions(false);
	isSettingTaskInfo = false;
}

function showTaskSubmitted() {
	if (isAnimating) return;
	isAnimating = true;
	var $numbers = $('.ticker-numbers').eq(0);
	var $numbers2 = $numbers.clone();
	$numbers.find('.ticker-text').removeClass('ticker-text');
	$numbers.addClass('to-delete');
	$numbers.one('webkitAnimationEnd oanimationend animationend',function () {
		$('.to-delete').remove();
	});
	$numbers2.one('webkitAnimationEnd oanimationend animationend',function () {
		$numbers2.removeClass('animated slideInDown slideInRight');
		isAnimating = false;
	});
	$numbers.parent().append($numbers2);
	$numbers.css('-webkit-animation-duration','.5s').addClass('animated slideOutLeft');
	$numbers2.css('-webkit-animation-duration','.2s').addClass('animated slideInRight');
}

var lastFlash = 0;

function updateSubmitButton() {
	$submitButton.text('Submit');
	var taskInfo = selectedTaskInfo();
	$submitButton.toggleClass('disabled',!Prefs.get('is-active') || !taskInfo);
}

function updateUI(totals) {
	var isActive = !!Prefs.get('is-active');
	if (!isActive) {
		if (Prefs.get('resumable')) {
			$startRow.hide();
			$stopRow.hide();
			$resumeRow.show();
		} else {
			$startRow.show();
			$stopRow.hide();
			$resumeRow.hide();
		}
		$('.ticker-text').text('0:00');
		$('.ticker-numbers').toggleClass('disabled',true);
		$('.ticker-container').removeClass('good slow tooslow');
		lastFlash = 0;
	} else  {
		$startRow.hide();
		$stopRow.show();
		$resumeRow.hide();
		if (totals && 'undefined' !== typeof totals.surplus.task) {
			var time = totals.surplus.task;
			time = Math.min(Math.max(time,-3599000),3599000); // limit to +/- 59m59s
			$('.ticker-numbers').toggleClass('disabled',false);
			$('.ticker-text').text(formattedTime(time || 0));
			$('.ticker-container').addClass('slow');
			var sp = totals.speed.task || 1.0;
			if (sp < 0.98) $('.ticker-container').addClass('tooslow').removeClass('slow');
			else if (sp < 1.0) $('.ticker-container').addClass('slow').removeClass('tooslow');
			else $('.ticker-container').addClass('good').removeClass('slow tooslow');
		} else if (Date.now() - lastFlash >= 200) {
			var text = $('.ticker-text').text();
			if ('0 00' != text) text = '0:00';
			if (lastFlash) text = -1 != text.indexOf(':') ? text.replace(':',' ') : text.replace(' ',':');
			$('.ticker-text').text(text);
			$('.ticker-container').addClass('good').removeClass('slow tooslow');
			lastFlash = Date.now();
		}
	}
	$(".ticker-text").css("color", isActive ? "Black" : "DarkGray");
	$('#session-project-cell').toggle('lionbridge' != Prefs.get('user-vendor'));
	updateSubmitButton();
}

//****************************************************************************************
// #mark   Event Handling
//****************************************************************************************

$(document).on('keydown',function(e) {
	if (17 == e.which || 93 == e.which)
		$('#session-resume-row .toggle-session').text('New');
});

$(document).on('keyup',function(e) {
	if (17 == e.which || 93 == e.which)
		$('#session-resume-row .toggle-session').text('Resume');
});

//****************************************************************************************
// #mark   Initialization
//****************************************************************************************

var port = chrome.runtime.connect({name:'popout-timer'});

chrome.runtime.onMessage.addListener(function(msg) {
	if ('did-submit-task' == msg.type) {
		showTaskSubmitted();
	} else if ('do-close' == msg.type) {
		window.close();
	} else if ('post-user-totals' == msg.type) {
		updateUI(msg.totals);
	} else if ('send-task-info' == msg.type) {
		handleSelectionChanged();
	} else if ('set-task-info' == msg.type) {
		if (msg.info) {
			setTaskInfo(msg.info);
		} else {
			lastFlash = 0;
			setTaskInfo(null);
		}
	}
});

//****************************************************************************************
// #mark   Window Sizing
//****************************************************************************************

function rememberWindowSize() {
	if (self == top) {
		port.postMessage({type:'save-popout-timer-state'});
	}
}

(function($,sr){
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
	  var timeout;
	  return function debounced () {
		  var obj = this, args = arguments;
		  function delayed () {
			  if (!execAsap)
				  func.apply(obj, args);
			  timeout = null;
		  };
		  if (timeout)
			  clearTimeout(timeout);
		  else if (execAsap)
			  func.apply(obj, args);
		  timeout = setTimeout(delayed, threshold || 100);
	  };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

  window.onbeforeunload = rememberWindowSize;

})(jQuery,'smartresize');

var $submitRow = $('#submit-row');
var $taskSelectRow = $('#task-select-row')
var $tickerRow = $('#ticker-row');

var compactWindowWidth = 320;
var compactWindowHeight = 220;

function updateWindowSize(isHovering) {
	var docHeight = $(document).height();

	if (docHeight >= compactWindowHeight || is_action_panel) {
		$taskSelectRow.show();
		$submitRow.show();
	} else if (isHovering) {
		$taskSelectRow.hide();
		$submitRow.show();
	} else {
		$taskSelectRow.hide();
		$submitRow.hide();
	}

// 	var docWidth = $(document).width();
// 	if (docWidth < compactWindowWidth && !is_action_panel) {
// 		$('#session-project-cell').hide();
// 		$('#task-type-cell').hide();
// 		$('button.toggle-session').closest('td').hide();
// 	} else {
// 		if ('lionbridge' != Prefs.get('user-vendor')) $('#session-project-cell').show();
// 		$('#task-type-cell').show();
// 		$('button.toggle-session').closest('td').show();
// 	}

	if (is_action_panel) $('button.toggle-session').closest('td').hide();

	document.title = $(document).width() < 170 ? 'RA' : 'RaterAide'

	// Have to reference this every time since it's cloned on submit
	var $tickerNumbers = $('.ticker-numbers').eq(0);
	var size = Math.min($tickerNumbers.height() + 12,$tickerNumbers.width() - 24);
	size = Math.floor(size / 2); // Yields 32px at default window size
	size = Math.max(size,32);
	size = Math.min(size,256);

	$('.ticker-text').eq(0).css('font-size',size + 'px');

	updateSubmitButton();
}

$(document).ready(function() { updateWindowSize(); });

$(window).resize(function() { updateWindowSize(); });

if (is_action_panel) {
	$('.toggle-session').parent().hide();
	$submitButton.parent().css('padding','0');
	$(document.body).css('margin-left','1px').css('margin-right','1px').css('margin-bottom','1px');
} else {
	$(window).smartresize(rememberWindowSize);
	$(window).blur(rememberWindowSize);
}

// Show the "Open in Separate Window" button if we're in an iframe
if (self != top) { $('.pop-out-button-row').show(); }

//****************************************************************************************
// #mark   Actions
//****************************************************************************************

$(document.body).on('contextmenu',function() { return false; });

$('.open-in-separate-window').click(function() {
	port.postMessage({type:'open-in-separate-window'});
});

$('.toggle-session').click(function() {
	toggleSession();
});

function toggleSession() {
	var forceNew = -1 != $(this).text().indexOf('New');
	var isPopout = self == top;
	var taskInfo = selectedTaskInfo();
	port.postMessage({type:'clicked-toggle-session',
		forceNew:forceNew,
		isPopout:isPopout,
		projectId:(taskInfo && taskInfo.projectId) || 0
	});
}

$submitButton.click(function() {
	var $this = $(this);
	if ($this.hasClass('disabled') || $this.hasClass('debounce')) return;
	port.postMessage({type:'clicked-submit-task'});
	setTimeout(function() { $this.removeClass('debounce'); },1000);
	$this.addClass('debounce');
});

$('button').on('keydown',function(e) { e.preventDefault(); return false; })

$typeSelect.on('option_add',function(value,data) {
	if (-1 != value.indexOf(',')) $typeSelect.removeOption(value);
});

$aetSelect.on('option_add',function(value,data) {
	function parseAetSeconds(str) {
		if (-1 != str.indexOf(':')) {
			var comp = str.split(':');
			var comp_ct = comp.length;
			if (comp.length > 1) {
				var m = parseInt(comp[comp_ct - 2],10);
				var s = parseInt(comp[comp_ct - 1],10);			
				if (!isNaN(m) && !isNaN(s)) return (60 * m + s);
			}
		} else {		
			var r = parseFloat(str);
			if (!isNaN(r)) {
				var assumeSeconds = r > 15;
				return assumeSeconds ? Math.floor(r) : Math.floor(r * 60);
			}
		}
		return null;
	}
	if (!isSettingTaskInfo) {
		var aetSeconds = 'string' === typeof data.aet ? parseAetSeconds(data.aet) : data.aet;
		if (null !== aetSeconds && aetSeconds > 0) {
			aetSeconds = Math.min(aetSeconds,7200);
			data.aet = aetSeconds;
			var timeStr = formattedTime(aetSeconds * 1000);
			data.time = timeStr;
			$aetSelect.updateOption(value,data);		
			$aetSelect.addItem(data.aet);
		} else $aetSelect.removeOption(value);
	}
});

function handleSelectionChanged() {
	if (isSettingTaskInfo) return;
	var type = $typeSelect.getValue();
	var aetSeconds = $aetSelect.getValue();
	var deviceId = parseInt($deviceSelect.getValue(),10);
	var projectId = parseInt($projectSelect.getValue(),10);
	if (type && !isNaN(aetSeconds) && aetSeconds > 0) {
		var typeStr = type + ',' + aetSeconds;
		if (deviceId > 0) typeStr += ',' + deviceId;
		var info = {
			typeStr:typeStr,
			type:type,
			time:aetSeconds,
			deviceId:deviceId,
			projectId:projectId
		};
		port.postMessage({type:'did-select-task',info:info});
		$(this).blur();
	}
}

function selectedTaskInfo() {
	var type = $typeSelect.getValue();
	var aetSeconds = $aetSelect.getValue();
	var deviceId = parseInt($deviceSelect.getValue(),10);
	var projectId = parseInt($projectSelect.getValue(),10);
	if (type && !isNaN(aetSeconds) && aetSeconds > 0) {
		var typeStr = type + ',' + aetSeconds;
		if (deviceId > 0) typeStr += ',' + deviceId;
		return {
			typeStr:typeStr,
			type:type,
			time:aetSeconds,
			deviceId:deviceId,
			projectId:projectId
		};
	}
	return null;
}

$aetSelect.on('item_add',handleSelectionChanged);
$deviceSelect.on('item_add',handleSelectionChanged);
$typeSelect.on('item_add',handleSelectionChanged);

$projectSelect.on('item_add',function(pid) {
	if (isSettingTaskInfo) return;

	if (15 == pid) {
		var type = 'Truckee Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:180,time:'3:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(180);
	} else if (14 == pid) {
		var type = 'Hudson Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:240,time:'4:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(240);
	} else if (13 == pid) {
		var type = 'Kern Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:540,time:'9:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(540);
	} else if (12 == pid) {
		var type = 'Tahoe Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:90,time:'1:30'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(90);
	} else if (11 == pid) {
		var type = 'Shasta Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:1800,time:'30:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(1800);	
	} else if (10 == pid) {
		var type = 'Danube Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:1800,time:'30:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(1800);	
	} else if (9 == pid) {
		var type = 'Thames Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:1800,time:'30:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(1800);
	} else if (8 == pid) {
		var type = 'Product Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:30,time:'0:30'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(30);
	} else if (7 == pid) {
		var type = 'Kwango Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:45,time:'0:45'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(45);
	} else if (6 == pid) {
		var type = 'Recommendation Eval';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:120,time:'2:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(120);
	} else if (4 == pid) {
		var type = 'Group Eval';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:20,time:'0:20'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(20);
	} else if (3 == pid) {
		var type = 'Souvenir Eval';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:1200,time:'20:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(1200);
	} else if (2 == pid) {
		var type = 'Ad Rating';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:180,time:'3:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(180);
	} else {
		var type = 'SxS Mobile';
		$typeSelect.addOption({type:type,value:type});
		$typeSelect.refreshOptions(false);
		$typeSelect.addItem(type);
		$aetSelect.addOption({aet:540,time:'9:00'});
		$aetSelect.refreshOptions(false);
		$aetSelect.addItem(540);
	}
	var resumable = Prefs.get('resumable');
	if (resumable) {
		var resumable_pid = resumable.pid || 0;
		if (resumable_pid != pid) {
			Prefs.set('resumable',null);
		}
	}
	handleSelectionChanged();
});

$(window).on('focus',function() { $('#hiddeninput').focus(); });

chrome.runtime.sendMessage({type:'get-user-totals'});

Prefs.initialize(function() {
	$(document).ready(function() {
		Prefs.monitor('has-hub-task',updateSubmitButton);
		Prefs.monitor('is-active',function() { updateUI(); });
		Prefs.monitor('resumable',function() { updateUI(); });
		Prefs.monitor('recent-task-types',setTaskList);
		Prefs.monitor('popout-timer-ping',function(r) {
			if (r && self == top) Prefs.set('popout-timer-ping',null);
		});
		Prefs.monitor('user-vendor',function() { updateUI(); });
		setTaskList(Prefs.get('recent-task-types'));
		port.postMessage({type:'popout-did-open'});
		updateUI();
	});

	// Handle clicks on the timer window to toggle it on and off
	$('.ticker-container').on('click', function() {
		if (false !== Prefs.get("toggle-timer-on-click")) {
			setTimeout(function() {
				toggleSession();
			}, 10);
		}
	});

	$(document).on('mouseenter', function() {
		if (document.hasFocus()) updateWindowSize(true);
	});
	
	$(document).on('mouseleave', function() {
		updateWindowSize(false);
	});
});
