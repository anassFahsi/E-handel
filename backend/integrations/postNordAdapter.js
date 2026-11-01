import { z } from "zod";

const API_KEY = process.env.POSTNORD_API_KEY;

const URL =
  "https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress";

export const PostNordAnswer = z.object({
  servicePointInformationResponse: z.object({
    servicePoints: z.array(
      z.object({
        servicePointId: z.string(),
        name: z.string(),
        visitingAddress: z.object({
          streetName: z.string(),
          streetNumber: z.string().optional(),
          postalCode: z.string(),
          city: z.string()
        })
      })
    )
  })
});

const deliveryTimeSchema=z.array(
  z.object({
    timeOfArrival: z.string()
  })
)

export async function findServicePoints(
  postalCode
) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    returnType: "json",
    countryCode: "SE",
    postalCode,
    numberOfServicePoints: "5"
  });

  const response = await fetch(
    `${URL}?${params}`,
    {
      signal: AbortSignal.timeout(5000)
    }
  );

  if (!response.ok) {
    throw new Error(
      `PostNord answered ${response.status}`
    );
  }

  const json = await response.json();

  const parsed =
    PostNordAnswer.safeParse(json);
    console.log(parsed)

  if (!parsed.success) {
    throw new Error(
      "Unexpected answer from PostNord"
    );
  }

  return parsed.data
    .servicePointInformationResponse
    .servicePoints
    .map((point) => ({
      id: point.servicePointId,
      name: point.name,
      address:
        `${point.visitingAddress.streetName} ` +
        `${point.visitingAddress.streetNumber ?? ""}, ` +
        `${point.visitingAddress.city}`
    }));
}

const TRANSIT_URL =
  "https://atapi2.postnord.com/rest/transport/v1/transittime/addresstoaddress";

export async function getDeliveryTime(
  destinationPostalCode
) {

  const params = new URLSearchParams({
    apikey: API_KEY,

    startTime: new Date().toLocaleDateString("sv","SE"),

    originPostCode: process.env.SHOP_POSTAL_CODE,

    originCountryCode: "SE",

    destinationPostCode:
      destinationPostalCode,

    destinationCountryCode: "SE"
  });

  const response = await fetch(
    `${TRANSIT_URL}?${params}`,
    {
      signal: AbortSignal.timeout(5000)
    }
  );

  if (!response.ok) {
    throw new Error(
      `PostNord answered ${response.status}`
    );
  }
  const json = await response.json();
  const parsed=deliveryTimeSchema.safeParse(json)

 if(!parsed.success){
   throw new Error(
    "Unexpected answer from PostNord"
  );
 }
 
return parsed.data[0].timeOfArrival
}