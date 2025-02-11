// App.js
import React, { useEffect, useContext, useCallback, useState, useLayoutEffect } from 'react';
import { StyleSheet, FlatList, Text, View, Button, SectionList, Pressable, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthProvider, AuthContext } from '@/components/AuthContext';
import OAuthScreen from '@/components/OAuth';
import CalendarList from '@/components/CalendarList';
import { useApi } from '@/hooks/apiClient';
import { useStudiengaenge } from '@/hooks/useStudiengang';
import { Studiengang } from '@/types/studiengang';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarResponse, CalendarEntry } from '@/interfaces/calendar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Exam {
  id: number;
  name: string;
  date: Date;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
          <MainContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function MainContent() {
  const { tokenResponse, logout, isLoggedIn } = useContext(AuthContext);
  const { fetchStudiengaenge } = useStudiengaenge();
  const [studiengaenge, setStudiengaenge] = useState<Studiengang[]>([]);
  // const [selectedStudiengang, setSelectedStudiengang] = useState<Studiengang>();
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  const { fetchCalendar } = useCalendar();
  const navigation = useNavigation();

  const handleFetchCalendar = useCallback(async () => {
    console.log('Fetching calendar...');
    try {
      const data: CalendarResponse = await fetchCalendar();
      const now = new Date();
      
      const entries: CalendarEntry[] = Object.values(data.termine)
        .flat()
        .filter(entry => new Date(entry.von) > now)
        .sort((a, b) => new Date(a.von).getTime() - new Date(b.von).getTime());
      
      setCalendarEntries(entries);
      console.log('Future Calendar Events:', entries);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchCalendar]);

  useEffect(() => {
    handleFetchCalendar();
    navigation.setOptions({
      headerShown: true,
      headerBackTitle: 'Back',
      headerTitle: 'Dashboard',
      headerLargeTitle: true,
      headerTransparent: true,
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleFetchCalendar}
          style={{ marginRight: 16 }}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#000'} 
          />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity 
          onPress={logout}
          style={{ marginLeft: 16 }}
        >
          <Ionicons 
            name="log-out" 
            size={24} 
            color={Platform.OS === 'ios' ? '#007AFF' : '#000'} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, logout]);

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
  
  const extractExams = (data: any): Exam[] => {
    const examList: Exam[] = [];
    
    // const processNode = (node: any) => {
    //   if (!node) return;
      
    //   // if (node.pruefungstyp === 'Klausur') {
    //   //   const date = parseExamDate(node.onlydatum || node.datum);
    //   //   if (date) {
    //   //     examList.push({
    //   //       id: node.pruefungid || 0,
    //   //       name: node.name || 'Unbekannt',
    //   //       date
    //   //     });
    //   //   }
    //   // }
      
    //   if (Array.isArray(node)) {
    //     node.forEach(processNode);
    //   } else if (typeof node === 'object') {
    //     Object.values(node).forEach(processNode);
    //   }
    // };
    
    // processNode(data);

    // data.

    return examList.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const fetchStudybook = useCallback(async () => {
    const allExams: Exam[] = [];
    
    for (const studiengang of studiengaenge) {
      try {
        const data = await api.getStudybook(studiengang.id);
        console.log(data);
        allExams.push(...extractExams(data));
      } catch (error) {
        console.error('Error fetching studybook:', error);
      }
    }
    
    console.log('All Exams:', allExams);
    setExams(allExams.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, [api, studiengaenge]);

  const renderItem = ({ item, section }: { item: CalendarEntry | Exam; section: any }) => {
    if (section.title === 'Actions') {
      return (
        <Pressable 
          style={styles.button}
          onPress={item.onPress}
        >
          <Text style={styles.buttonText}>{item.title}</Text>
        </Pressable>
      );
    }

    // if (section.title === 'Upcoming Exams') {
    //   return (
    //     <View style={styles.examItem}>
    //       <Text style={styles.examTitle}>{item.name}</Text>
    //       <Text style={styles.examDate}>
    //         {item.date.toLocaleString('de-DE')}
    //       </Text>
    //     </View>
    //   );
    // }
    
    // Calendar item
    return (
      <View style={styles.calendarItem}>
        <Text style={styles.calendarTitle}>{item.title}</Text>
        <Text style={styles.calendarDate}>
          {new Date(item.von).toLocaleString()}
        </Text>
        <Text style={styles.calendarType}>{item.raum?.raum ?? "kein raum"}</Text>
        <Text style={styles.calendarType}>{item.type}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <SectionList
          contentContainerStyle={styles.listContent}
          sections={[
            {
              title: 'Actions',
              data: [
                { title: 'Studiengänge laden', onPress: handleFetchStudiengaenge },
                { title: 'Studybook', onPress: fetchStudybook },
              ],
            },
            // {
            //   title: 'Upcoming Exams',
            //   data: exams.filter(exam => exam.date > new Date()),
            // },
            {
              title: 'Calendar',
              data: calendarEntries,
            },
          ]}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          keyExtractor={(item) => item.uuid || item.title}
        />
      ) : (
        <OAuthScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    marginTop: Platform.OS === 'ios' ? 20 : 25,
    marginBottom: Platform.OS === 'ios' ? 40 : 0,

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
  stage: {
    backgroundColor: '#EFEFF4',
    paddingBottom: 20,
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  
  sectionHeader: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    width: '100%',
    backgroundColor: 'white',
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarDate: {
    fontSize: 14,
    color: '#666',
  },
  calendarType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    width: '100%',
    flexGrow: 1,
  },
  examItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    width: '100%',
    backgroundColor: 'white',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  examDate: {
    fontSize: 14,
    color: '#666',
  },
});