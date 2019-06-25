function minutesForTotals(totals,rounding_mode,limiting_mode) {
	var result = 0;
	var allotted = totals.allotted;
	var duration = totals.duration;
	if (limiting_mode) {
		duration = Math.min(allotted,duration);
	}
	var mom = moment.duration(duration);
	var result = Math.round(mom.asMinutes() * 100) / 100;
	if (null !== rounding_mode) {
		switch(rounding_mode) {
			case 1: result = Math.ceil(result); break;
			case 2: result = Math.floor(result); break;
			default: result = Math.round(result); break;
		}
	}
	return result;
}
