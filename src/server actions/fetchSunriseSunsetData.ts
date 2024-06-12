"use server";

const FetchSunriseSunsetData = async (lat: number, lng: number) => {
  const res = await fetch(
    `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}`
  );
  const data = await res.json();
  return data.results;
};

export default FetchSunriseSunsetData;
