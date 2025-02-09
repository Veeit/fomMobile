// App.js
import React, { useContext, useCallback, useState} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthProvider, AuthContext } from '@/components/AuthContext';
import OAuthScreen from '@/components/OAuth';
import { useApi } from '@/hooks/apiClient';
import { useStudiengaenge } from '@/hooks/useStudiengang';
import { Studiengang } from '@/types/studiengang';

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

function MainContent() {
  const { tokenResponse, logout, isLoggedIn } = useContext(AuthContext);
  const { fetchStudiengaenge } = useStudiengaenge();
  const [studiengaenge, setStudiengaenge] = useState<Studiengang[]>([]);
  const [selectedStudiengang, setSelectedStudiengang] = useState<Studiengang>();
  
  const handleFetchStudiengaenge = async () => {
    try {
      const data = await fetchStudiengaenge();
      // Convert numeric IDs to strings if necessary
      const formattedData = data.map((item: any) => ({
        id: String(item.id),
        studienfach: item.studienfach
      }));
      setStudiengaenge(formattedData);
      console.log('Studiengänge:', formattedData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const api = useApi();

  const fetchStudybook = useCallback(async () => {
    console.log('Selected studiengang:', selectedStudiengang);

    try {
      const studybookData = await api.getStudybook(selectedStudiengang);
      console.log('Studybook data:', studybookData);
    } catch (error) {
      console.error('Error fetching studybook:', error);
    }
  }, [api]);

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <>
          <Text style={styles.title}>Willkommen!</Text>
          <Text style={styles.text}>Sie sind eingeloggt</Text>
          <Button title="Studiengänge laden" onPress={handleFetchStudiengaenge} />
          <Picker
            selectedValue={selectedStudiengang}
            style={styles.picker}
            onValueChange={(itemValue: string) => setSelectedStudiengang(itemValue)}
          >
            <Picker.Item label="Bitte wählen" value="" />
            {studiengaenge.map((studiengang) => (
              <Picker.Item 
                key={studiengang.id} 
                label={studiengang.studienfach} 
                value={studiengang.id} 
              />
            ))}

          </Picker>
          <Button title="Logout" onPress={logout} />
          <Button title='Studybook' onPress={fetchStudybook} />
        </>
      ) : (
        <OAuthScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
});
