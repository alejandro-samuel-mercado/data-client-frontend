import { useFocusEffect, useRouter } from "expo-router";
import { Plus, Search, Settings } from "lucide-react-native";
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
  const [filterSend, setFilterSend] = useState<boolean | null>(null);

  const fetchClients = async () => {
    try {
      
      const data = await getClients(); 
      setClients(data);
      applyFilters(data, search, filterSend);
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

  const applyFilters = (data: Client[], searchText: string, sendStatus: boolean | null) => {
    let result = data;

    if (sendStatus !== null) {
        result = result.filter(c => (c.send ?? false) === sendStatus);
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((client) =>
        client.name.toLowerCase().includes(lowerSearch) ||
        client.phone.includes(searchText) ||
        client.city?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredClients(result);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilters(clients, text, filterSend);
  };

  const toggleFilter = () => {
      let nextStatus: boolean | null = null;
      if (filterSend === null) nextStatus = false;
      else if (filterSend === false) nextStatus = true;
      else nextStatus = null;
      
      setFilterSend(nextStatus);
      applyFilters(clients, search, nextStatus);
  };

  const getFilterLabel = () => {
      if (filterSend === null) return "Todos";
      if (filterSend === false) return "No enviado";
      return "Enviado";
  };

  return (
    <SafeAreaView edges={['bottom', 'top']} className="flex-1 mx-5 pt-2">
      <View className="mb-2">
        {/* Navigation Header */}
        <View className="flex-row justify-end items-center mb-4">
             <TouchableOpacity 
                onPress={() => router.push("/config")}
                className="p-2 bg-gray-100 rounded-full"
             >
                 <Settings size={24} color="#374151" />
             </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="relative mb-3">
             <View className="absolute left-3 top-3 z-10">
                <Search size={20} color="#9CA3AF" />
             </View>
            <Input
                placeholder="Buscar clientes..."
                value={search}
                onChangeText={handleSearch}
                className="pl-10 h-10" 
            />
        </View>

        {/* Filter Toggle */}
        <View className="flex-row items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100 mb-2">
            <Text className="text-gray-600 font-medium">Filtro Estado:</Text>
            <TouchableOpacity 
                onPress={toggleFilter}
                className={`px-4 py-1.5 rounded-md ${filterSend === null ? 'bg-gray-200' : filterSend ? 'bg-green-100' : 'bg-orange-100'}`}
            >
                <Text className={`font-bold ${filterSend === null ? 'text-gray-700' : filterSend ? 'text-green-700' : 'text-orange-700'}`}>
                    {getFilterLabel()}
                </Text>
            </TouchableOpacity>
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
              <Text className="text-gray-400 text-lg">No se encontraron clientes</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-xl shadow-blue-600/40"
        onPress={() => router.push("/create")}
        activeOpacity={0.8}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
