import { NextResponse } from 'next/server';

type PostalApiResponse = Array<{
  Status?: string;
  Message?: string;
  PostOffice?: Array<{
    Name?: string;
    District?: string;
    State?: string;
    Country?: string;
    DeliveryStatus?: string;
  }> | null;
}>;

type ZippopotamResponse = {
  country?: string;
  places?: Array<{
    'place name'?: string;
    state?: string;
  }>;
};

type IndiaPincodeDatasetResponse = {
  state?: string;
  district?: string;
  offices?: Array<{
    officeName?: string;
    deliveryStatus?: string;
  }>;
};

async function lookupWithIndiaPincodeDataset(pin: string) {
  const response = await fetch(`https://aniket-thapa.github.io/india-pincode-api/pincodes/${pin}.json`, {
    cache: 'force-cache',
    next: { revalidate: 60 * 60 * 24 },
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as IndiaPincodeDatasetResponse;
  const office = data.offices?.[0];

  if (!data.state || !data.district || !office) return null;

  return {
    pin,
    name: office.officeName || '',
    district: data.district,
    state: data.state,
    country: 'India',
    deliveryStatus: office.deliveryStatus || 'Delivery available',
  };
}

async function lookupWithZippopotam(pin: string) {
  const response = await fetch(`https://api.zippopotam.us/IN/${pin}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as ZippopotamResponse;
  const place = data.places?.[0];

  if (!place) return null;

  return {
    pin,
    name: place['place name'] || '',
    district: place['place name'] || '',
    state: place.state || '',
    country: data.country || 'India',
    deliveryStatus: 'Delivery available',
  };
}

async function lookupWithIndiaPost(pin: string) {
  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as PostalApiResponse;
  const result = data[0];
  const postOffice = result?.PostOffice?.[0];

  if (result?.Status !== 'Success' || !postOffice) return null;

  return {
    pin,
    name: postOffice.Name || '',
    district: postOffice.District || '',
    state: postOffice.State || '',
    country: postOffice.Country || 'India',
    deliveryStatus: postOffice.DeliveryStatus || 'Delivery available',
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pin: string }> }
) {
  const { pin } = await params;

  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: 'Please enter a valid 6 digit PIN code.' }, { status: 400 });
  }

  const providers = [lookupWithIndiaPincodeDataset, lookupWithZippopotam, lookupWithIndiaPost];

  for (const lookup of providers) {
    try {
      const result = await lookup(pin);

      if (result) {
        return NextResponse.json(result);
      }
    } catch {
      // Try the next provider before returning an error.
    }
  }

  return NextResponse.json({ error: 'No delivery location found for this PIN code.' }, { status: 404 });
}
