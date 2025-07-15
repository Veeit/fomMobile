interface Examiner {
  aufgabe: string;
  dozentid: number;
  id: number;
  pruefungsdozentid: number;
  pruefungsdozenttnid: number;
  minuten: number;
  punkteAufgabenstellung: number;
  widersprueche: any[];
  einsichtBuchbar: boolean;
  widerspruch: {
    id: number;
  };
  digitaleEinsicht: boolean;
}

interface Room {
  id: number;
  anschriftid: number;
  name: string;
  raum: string;
  plz: string;
  stadt: string;
  strasse: string;
  land: string;
  googlemapslink: string;
  dummy: number;
  details: boolean;
  formatierteanschrift: string;
}

interface Achievement {
  datum: string;
  uhrzeitVon: string;
  uhrzeitBis: string;
  anmeldungbis: string;
  abmeldungbis: string;
  pruefungsdauer: string;
  prueferList: Examiner[];
  ort: string;
  pruefungstyp: string;
  veranstaltungssemester: string;
  studiengaenge: string;
  standardhilfsmittel: string;
  raum: Room;
  widerspruchEinreichenMoeglich: boolean;
  pruefungseinsichtMoeglich: boolean;
  pruefungsform: string;
  nachtraeglicherRuecktritt: {
    pruefungstyp: string;
    pruefungstypKategorie: string;
    hasStarted: boolean;
    erschienen: string;
  };
  titleMap: {
    [key: string]: string;
  };
}

import { Context, useContext as reactUseContext } from 'react';
import { useApi } from './apiClient';
import { AuthContext } from '@/components/AuthContext';

const BASE_URL = 'https://oc-digital.de';

export const useAchievements = () => {
    const api = useApi();
    const { tokenResponse } = useContext(AuthContext);

    const getAchievement = async (achievementId: string): Promise<Achievement> => {
        if (!tokenResponse?.access_token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(
                `${BASE_URL}/campus/api/epm/pruefungsergebnis/ergebnis/${achievementId}`,
                {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'de-DE',
                        'Authorization': `Bearer ${tokenResponse.access_token}`,
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            print(data);
            return data;
        } catch (error) {
            console.error('Error fetching achievement:', error);
            throw error;
        }
    };

    return { getAchievement };
};

function useContext<T>(context: Context<T>): T {
    return reactUseContext(context);
}
