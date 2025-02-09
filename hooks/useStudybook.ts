// hooks/useStudybook.js
import { useApi } from './apiClient';

const BASE_URL = 'https://oc-digital.de';

export const useStudybook = () => {
  const api = useApi();

  const getStudybook = async (studybookId) => {
    try {
      const response = await fetch(`${BASE_URL}/campus/api/epm/studybook/${studybookId}`, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'de-DE',
          'Authorization': `Bearer ${api.tokenResponse?.access_token}`,
          'DNT': '1',
          'Referer': `${BASE_URL}/node/6148/course/${studybookId}`,
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
      console.error('Error fetching studybook:', error);
      throw error;
    }
  };

  return { getStudybook };
};
