// api/services.js
import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';

// Base API Client
const createApiClient = (tokenResponse) => {
  const BASE_URL = 'https://oc-digital.de';

  const getHeaders = () => ({
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'de-DE',
    'Authorization': `Bearer ${tokenResponse?.access_token}`,
    'DNT': '1',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  });

  return {
    getStudybook: async (studybookId) => {
      if (!tokenResponse?.access_token) {
        throw new Error('Not authenticated');
      }

      try {
        const response = await fetch(`${BASE_URL}/campus/api/epm/studybook/${studybookId}`, {
          method: 'GET',
          headers: {
            ...getHeaders(),
            'Referer': `${BASE_URL}/node/6148/course/${studybookId}`,
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Error fetching studybook:', error);
        throw error;
      }
    }
  };
};

// Hook für einfache Verwendung
export const useApi = () => {
  const { tokenResponse } = useContext(AuthContext);
  return createApiClient(tokenResponse);
};