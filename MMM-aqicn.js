/* Magic Mirror
 * Module: MMM-aqicn
 *
 * By Gregoire Pailler https://github.com/gpailler/MMM-aqicn
 * Based on MMM-Looko2-aq module https://github.com/marska/MMM-Looko2-aq
 * Localizations from https://aqicn.org/translate/
 *
 * MIT Licensed.
 */
Module.register("MMM-aqicn", {
	defaults: {
		token: "", // From https://aqicn.org/data-platform/token/
		stationName: "", // Name of the station
		showLocationName: false,
		showDetails: true,
		updateInterval: 15,
		animationSpeed: 1000,
		apiDomain: "https://api.waqi.info"
	},

	start: function(){
		Log.info("Starting module: " + this.name);

		this.initialize();
	},

	initialize: function(){
		var self = this;
		$.getJSON(
			"{0}/search/".format(this.config.apiDomain),
			{ token: this.config.token, keyword: this.config.stationName }
			)
			.done(function(response){
				if (response.status == "ok")
				{
					// Search for station with exact same name
					// (for example, when the station name is the name of the city, we have several results)
					response.data.forEach(x => {
						if (x.station.name == self.config.stationName) {
							self.data.stationId = x.uid;
						}
					});

					if (typeof self.data.stationId === "undefined") {
						self.data.apiStatus = "Station name '{0}' not found".format(self.config.stationName);
					}
					else
					{
						// Start timer only if we found the stationId
						setInterval(
							self.load.bind(self),
							self.config.updateInterval * 60 * 1000);
					}
				}
				else
				{
					self.data.apiStatus = "Invalid response status from the API: '{0}'".format(response.data);
				}
			})
			.fail(function(jqxhr, textStatus, error){
				self.data.apiStatus = "API call error: '{0}'".format(textStatus);
			})
			.always(function(){
				self.load();
			});
	},

	load: function(){
			$.getJSON(
				"{0}/feed/@{1}/".format(this.config.apiDomain, this.data.stationId),
				{ token: this.config.token },
				this.render.bind(this)
				);
	},

	render: function(response){
		if (typeof this.data.apiStatus === "undefined") {
			this.data.aqi = response.data.aqi;										// Air quality information
			this.data.pm25 = ((response.data.iaqi || {}).pm25 || {}).v || "-";		// PM 2.5
			this.data.pm10 = ((response.data.iaqi || {}).pm10 || {}).v || "-";		// PM 10
			this.data.o3 = ((response.data.iaqi || {}).o3 || {}).v || "-";			// Ozone
			this.data.no2 = ((response.data.iaqi || {}).no2 || {}).v || "-";		// Nitrogen dioxide
			this.data.so2 = ((response.data.iaqi || {}).so2 || {}).v || "-";		// Sulfur dioxide
			this.data.co = ((response.data.iaqi || {}).o3 || {}).v || "-";			// Carbon monoxyde

			this.data.location = response.data.city.name;
		}

		this.loaded = true;
		this.updateDom(this.animationSpeed);
	},

	html: {
		icon: '<i class="fa fa-leaf {0}"></i>',
		quality: '<div class="medium">{0} {1} ({2})</div>',
		details: '<div class="bright xsmall">'
				+'PM<sub>10</sub> <b>{0}</b>&nbsp;&nbsp;&nbsp;'
				+'PM<sub>2.5</sub> <b>{1}</b>&nbsp;&nbsp;&nbsp;'
				+'O<sub>3</sub> <b>{2}</b>'
				+'</div>',
		city: '<div class="xsmall">{0}</div>',
	},

	getScripts: function() {
		return [
			'//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.js',
			'String.format.js'
		];
	},

	getStyles: function() {
		return ["MMM-aqicn.css", "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"];
	},

	getTranslations: function() {
		return {
				en: "translations/en.json",
				fr: "translations/fr.json"
		}
	},

	getLocalizationAndStyle: function(value) {
		var spectrum = [
			{ value: 0,   level: "LevelNotAvailable", style: "good" },
			{ value: 50,  level: "LevelGood",         style: "good" },
			{ value: 100, level: "LevelModerate",     style: "moderate" },
			{ value: 150, level: "LevelUnhealthy",    style: "unhealthy-sensitive" },
			{ value: 200, level: "LevelUnhealthy",    style: "unhealthy" },
			{ value: 300, level: "LevelUnhealthy",    style: "very-unhealthy" },
			{ value: 500, level: "LevelHazardous",    style: "hazardous" },
			];

		var idx = 0;
		for (idx = 0; idx < spectrum.length - 2; idx++) {
			if (value == "-" || value <= spectrum[idx].value) {
				break;
			}
		};

		return { level: this.translate(spectrum[idx].level), style: "MMM-aqicn-status-" + spectrum[idx].style };
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		if (typeof this.data.apiStatus !== "undefined") {
			wrapper.innerHTML = this.name + " " + this.data.apiStatus;
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var locAndStyle = this.getLocalizationAndStyle(this.data.aqi);

		wrapper.innerHTML = this.html.quality.format(
			this.html.icon.format(locAndStyle.style),
			locAndStyle.level,
			this.data.aqi);

		if(this.config.showDetails){
			wrapper.innerHTML += this.html.details.format(this.data.pm10, this.data.pm25, this.data.o3);
		}

		if(this.config.showLocationName){
			wrapper.innerHTML += this.html.city.format(this.data.Location);
		}

		return wrapper;
	}
});
