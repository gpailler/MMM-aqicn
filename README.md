# MMM-aqicn

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Display the air quality index from aqicn website ([World Air Quality Index project](http://aqicn.org/contact/)).

This module is inspired by [MMM-Looko2-aq](https://github.com/marska/MMM-Looko2-aq)

![img](https://user-images.githubusercontent.com/3621529/51427337-7beedf80-1c29-11e9-8265-f55aee42d323.png)

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
        module: "MMM-aqicn",
        position: "top_right",
        header: "Air Quality Index",
        config: {
            token: "XYZ",
            stationName: "Bangkok University Rangsit Campus, Pathum Thani",
            showDetails: true
            }
        }
    ]
}
```

You might need to specify the country in the ``stationName`` if your station is not found. In our examply, it would be
``Bangkok University Rangsit Campus, Pathum Thani, India``

## Configuration options

| Option             | Description
|--------------------|-----------
| `token`            | *Required* Token to access the aqicn API. Can be retrieved from https://aqicn.org/data-platform/token/.
| `stationName`      | *Required* Name of the station. For example `Bangkok University Rangsit Campus, Pathum Thani` for http://aqicn.org/city/thailand/bangkok/bodindecha-sing-singhaseni-school/.
| `showDetails`      | *Optional* Toggle PM10, PM2.5, O3 values printing.
| `showLocationName` | *Optional* Show location label.
| `updateInterval`   | *Optional* How often the module should reload the air quality data (in minutes).
