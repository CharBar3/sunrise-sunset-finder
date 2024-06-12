"use server";

const FetchSunriseSunsetData = async (lat: number, lng: number) => {
  const res = await fetch(
    `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}`
  );
  const data = await res.json();

  if (data.status === "ERROR") {
    throw new Error("Error fetching data from api");
  }

  return data.results;
};

export default FetchSunriseSunsetData;
