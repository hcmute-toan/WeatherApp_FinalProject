import React from 'react';
import { FlatList, FlatListProps, View } from 'react-native';

interface CustomFlatListProps<T> extends FlatListProps<T> {
  HeaderComponent?: React.ReactNode;
  StickyElementComponent?: React.ReactNode;
  TopListElementComponent?: React.ReactNode;
}

const CustomFlatList = <T,>({
  HeaderComponent,
  StickyElementComponent,
  TopListElementComponent,
  ...props
}: CustomFlatListProps<T>) => {
  return (
    <FlatList
      {...props}
      ListHeaderComponent={
        <>
          {HeaderComponent}
          {StickyElementComponent && (
            <View style={{ marginVertical: 10 }}>{StickyElementComponent}</View>
          )}
          {TopListElementComponent}
        </>
      }
    />
  );
};

export default CustomFlatList;