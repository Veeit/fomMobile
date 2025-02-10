import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { CalendarEntry } from '@/interfaces/CalendarEntry';

interface CalendarListProps {
  entries: CalendarEntry[];
}

export const CalendarList: React.FC<CalendarListProps> = ({ entries }) => {
  const renderItem = ({ item }: { item: CalendarEntry }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{new Date(item.start).toLocaleDateString()}</Text>
      <Text style={styles.time}>
        {new Date(item.start).toLocaleTimeString()} - {new Date(item.end).toLocaleTimeString()}
      </Text>
      {item.location && <Text style={styles.location}>{item.location}</Text>}
    </View>
  );

  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default CalendarList;