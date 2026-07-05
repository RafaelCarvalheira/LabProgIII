import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { setUnauthorizedHandler } from './src/api/client';
import LoginScreen from './src/screens/LoginScreen';
import StatusScreen from './src/screens/StatusScreen';
import SearchAvailabilityScreen from './src/screens/SearchAvailabilityScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import ReservationScreen from './src/screens/ReservationScreen';
import ReservationsScreen from './src/screens/ReservationsScreen';
import { colors } from './src/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HEADER_OPTS = {
  headerStyle: {
    backgroundColor: '#080C17',
  },
  headerShadowVisible: false,
  headerTitleStyle: { color: colors.ink, fontWeight: '800' },
  headerTintColor: colors.brand,
  contentStyle: { backgroundColor: colors.background },
};

function AvailabilityStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen
        name="BuscarDisponibilidade"
        component={SearchAvailabilityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="DetalheImovel"  component={PropertyDetailsScreen} options={{ title: 'Detalhes' }} />
      <Stack.Screen name="Reserva"        component={ReservationScreen}     options={{ title: 'Confirmar reserva' }} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: '#080C17',
          borderTopColor: colors.border,
          height: 78,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Status:          'pulse-outline',
            Disponibilidade: 'calendar-outline',
            Reservas:        'key-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Status"          component={StatusScreen} />
      <Tab.Screen name="Disponibilidade" component={AvailabilityStack} />
      <Tab.Screen name="Reservas"        component={ReservationsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, loading, logout } = useAuth();

  // Registra handler de 401 para logout automático
  setUnauthorizedHandler(logout);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return token ? <AppTabs /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
