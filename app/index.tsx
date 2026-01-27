import { useFocusEffect, useRouter } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClientCard } from "../src/components/ClientCard";
import { Input } from "../src/components/Input";
import { Client, getClients } from "../src/services/api";

export default function ClientsList() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text) {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(text.toLowerCase()) ||
        client.phone.includes(text) ||
        client.city?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 mx-5 pt-2 ">
      <View className="mb-4">
        
        <View className="relative">
             <View className="absolute left-3 top-4 z-10">
                <Search size={20} color="#9CA3AF" />
             </View>
            <Input
                placeholder="Buscar clientes..."
                value={search}
                onChangeText={handleSearch}
                className="pl-10 h-12"
            />
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() => router.push(`/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center mt-20">
              <Text className="text-gray-400 text-lg">clientes no encontrados</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-xl shadow-primary/40"
        onPress={() => router.push("/create")}
        activeOpacity={0.8}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
