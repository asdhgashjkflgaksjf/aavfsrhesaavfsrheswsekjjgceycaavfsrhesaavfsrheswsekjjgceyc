import { useState, useEffect } from 'react';

interface GeoLocation {
  isIndonesia: boolean;
  loading: boolean;
  error: string | null;
}

const GEO_APIS = [
  {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    parseCountry: (data: any) => data.country_code
  },
  {
    url: 'https://ipapi.co/json/',
    parseCountry: (data: any) => data.country_code
  },
  {
    url: 'http://ip-api.com/json/',
    parseCountry: (data: any) => data.countryCode
  },
  {
    url: 'https://ipwhois.app/json/',
    parseCountry: (data: any) => data.country_code
  }
];

export const useGeoLocation = (): GeoLocation => {
  const [state, setState] = useState<GeoLocation>({
    isIndonesia: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkLocation = async () => {
      for (const api of GEO_APIS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(api.url, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) continue;

          const data = await response.json();
          const countryCode = api.parseCountry(data);

          setState({
            isIndonesia: countryCode === 'ID',
            loading: false,
            error: null
          });
          return;
        } catch (error) {
          continue;
        }
      }

      setState({
        isIndonesia: false,
        loading: false,
        error: 'Failed to verify location'
      });
    };

    checkLocation();
  }, []);

  return state;
};