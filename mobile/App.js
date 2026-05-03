import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import StatusScreen from './src/screens/StatusScreen';
import SearchAvailabilityScreen from './src/screens/SearchAvailabilityScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AvailabilityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.ink, fontWeight: '800' },
        headerTintColor: colors.brand,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="BuscarDisponibilidade"
        component={SearchAvailabilityScreen}
        options={{ title: 'Disponibilidade' }}
      />
      <Stack.Screen
        name="DetalheImovel"
        component={PropertyDetailsScreen}
        options={{ title: 'Detalhes do imóvel' }}
      />
      <Stack.Screen
        name="Reserva"
        component={ReservationScreen}
        options={{ title: 'Confirmar reserva' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 78,
            paddingBottom: 18,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
          tabBarIcon: ({ color, size }) => {
            const iconByRoute = {
              Status: 'pulse-outline',
              Disponibilidade: 'calendar-outline',
              Reservas: 'key-outline',
            };
            return (
              <Ionicons
                name={iconByRoute[route.name]}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Status" component={StatusScreen} />
        <Tab.Screen name="Disponibilidade" component={AvailabilityStack} />
        <Tab.Screen name="Reservas" component={ReservationsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
