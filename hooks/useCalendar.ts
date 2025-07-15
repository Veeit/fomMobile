import { useContext } from 'react';
import { AuthContext } from '@/components/AuthContext';
import { useApi } from './apiClient';

export function useCalendar() {
  const { tokenResponse } = useContext(AuthContext);

  const fetchCalendar = async () => {
    if (!tokenResponse?.access_token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://oc-digital.de/campus/api/user/calendar', {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'de-DE',
          'Authorization': `Bearer ${tokenResponse.access_token}`,
          'DNT': '1',
          'Referer': 'https://oc-digital.de/node/6100',
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
      console.error('Error fetching calendar:', error);
      throw error;
    }
  };

  return { fetchCalendar };
}