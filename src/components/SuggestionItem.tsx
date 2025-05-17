import React from 'react';
import { View, Text } from 'react-native';

interface SuggestionItemProps {
  suggestion: string;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion }) => {
  return (
    <View style={{ padding: 10, backgroundColor: '#2A3550', borderRadius: 5, marginVertical: 5 }}>
      <Text style={{ color: '#fff' }}>{suggestion}</Text>
    </View>
  );
};

export default SuggestionItem;