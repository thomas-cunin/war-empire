import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-2">
      <Text className={`text-lg ${focused ? '' : 'opacity-50'}`}>{icon}</Text>
      <Text
        className={`text-[10px] mt-0.5 ${
          focused ? 'text-accent-gold font-semibold' : 'text-text-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1a2332',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚔️" label="Guerre" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="units"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🪖" label="Unités" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🗺️" label="Carte" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="upgrades"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⬆️" label="Amélior." focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="prestige"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⭐" label="Prestige" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
