// hooks/useStudiengaenge.ts
import { useContext } from 'react';
import { AuthContext } from '@/components/AuthContext';

export function useStudiengaenge() {
  const { tokenResponse } = useContext(AuthContext);

  const fetchStudiengaenge = async () => {
    if (!tokenResponse?.access_token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://oc-digital.de/campus/api/epm/studiengaenge', {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'de-DE',
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'DNT': '1',
          'Referer': 'https://oc-digital.de/node/6148',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching studiengaenge:', error);
      throw error;
    }
  };

  return { fetchStudiengaenge };
}