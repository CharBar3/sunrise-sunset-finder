const coordsLookup = require("coordinate_to_country");
import countryCodes from "@/country-code-lookup";

export default class MapUtils {
  public static getCountryNameFromLatLng(lat: number, lng: number) {
    const countryCode = coordsLookup(lat, lng)[0];
    const country = countryCodes[countryCode as keyof typeof countryCodes];
    return country;
  }
}
