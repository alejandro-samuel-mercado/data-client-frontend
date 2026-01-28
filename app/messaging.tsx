import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, Switch, Text, TouchableOpacity, View } from "react-native";
import { Client, ClientType, getClients, getClientTypes, getTemplates, MessageTemplate } from "../src/services/api";

export default function MessagingScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [types, setTypes] = useState<ClientType[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterSend, setFilterSend] = useState(false); 
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
  }, [filterSend]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [c, t, tmpl] = await Promise.all([
          getClients({ send: filterSend }),
          getClientTypes(),
          getTemplates()
      ]);
      setClients(c);
      setTypes(t);
      setTemplates(tmpl);
    } catch (error) {
      Alert.alert("Error", "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const toggleClientSelection = (id: number) => {
    const newSet = new Set(selectedClientIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedClientIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedClientIds.size === clients.length) {
        setSelectedClientIds(new Set());
    } else {
        const newSet = new Set(clients.map(c => c.id));
        setSelectedClientIds(newSet);
    }
  };

  const getTemplateForClient = (client: Client) => {
    if (!client.clientTypeId) return null;
    return templates.find(t => 
        t.clientTypeId === client.clientTypeId && 
        t.hasWeb === (client.hasWeb || false)
    );
  };

  const handleSend = async () => {
    const selectedClients = clients.filter(c => selectedClientIds.has(c.id));
    if (selectedClients.length === 0) {
        Alert.alert("Error", "Selecciona al menos un cliente");
        return;
    }

    for (const client of selectedClients) {
        const template = getTemplateForClient(client);
        if (!template) {
            Alert.alert("Aviso", `No hay plantilla para ${client.name} (Tipo: ${client.clientType?.name || 'N/A'}, Web: ${client.hasWeb ? 'Sí' : 'No'})`);
            continue;
        }

        let message = template.content;
        message = message.replace(/{nombre}/g, client.name);
        message = message.replace(/{tipo}/g, client.clientType?.name || "");

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${client.phone}?text=${encodedMessage}`;
        
        await Linking.openURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Envíos Masivos</Text>
        
        <View className="flex-row items-center justify-between mt-4 bg-gray-50 p-3 rounded-lg">
            <Text className="text-gray-700 font-medium">
                Mostrar: {filterSend ? "Enviados (true)" : "Pendientes (false)"}
            </Text>
            <Switch
                value={filterSend}
                onValueChange={setFilterSend}
                trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
            />
        </View>

        <View className="flex-row justify-between items-center mt-4">
            <TouchableOpacity onPress={toggleSelectAll}>
                <Text className="text-blue-600 font-medium">
                    {selectedClientIds.size === clients.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
                </Text>
            </TouchableOpacity>
            <Text className="text-gray-500">{selectedClientIds.size} seleccionados</Text>
        </View>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshing={loading}
        onRefresh={fetchData}
        renderItem={({ item }) => (
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => toggleClientSelection(item.id)}
                className={`p-4 mb-3 rounded-xl border ${selectedClientIds.has(item.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                        <Text className="text-gray-500">{item.phone}</Text>
                         <View className="flex-row items-center mt-2 space-x-2">
                             {item.clientType && (
                                <View className="bg-gray-100 px-2 py-0.5 rounded">
                                    <Text className="text-xs text-gray-600 font-medium">{item.clientType.name}</Text>
                                </View>
                             )}
                             <View className={item.hasWeb ? "bg-green-100 px-2 py-0.5 rounded" : "bg-orange-100 px-2 py-0.5 rounded"}>
                                <Text className={item.hasWeb ? "text-green-800 text-xs" : "text-orange-800 text-xs"}>
                                    {item.hasWeb ? "Web: Sí" : "Web: No"}
                                </Text>
                             </View>
                        </View>
                    </View>
                    
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedClientIds.has(item.id) ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                        {selectedClientIds.has(item.id) && (
                            <View className="w-2.5 h-2.5 bg-white rounded-full" />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        )}
      />

       <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <TouchableOpacity 
                onPress={handleSend}
                disabled={selectedClientIds.size === 0}
                className={`w-full py-4 rounded-xl items-center ${selectedClientIds.size > 0 ? "bg-green-600" : "bg-gray-300"}`}
            >
                <Text className="text-white font-bold text-lg">
                    Enviar WhatsApp ({selectedClientIds.size})
                </Text>
            </TouchableOpacity>
       </View>
    </View>
  );
}
