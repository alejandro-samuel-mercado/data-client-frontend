import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { ClientType, MessageTemplate, createClientType, createTemplate, deleteClientType, deleteTemplate, getClientTypes, getTemplates } from "../src/services/api";

export default function ConfigurationScreen() {
  const router = useRouter();
  const [types, setTypes] = useState<ClientType[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const [newTypeName, setNewTypeName] = useState("");

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [hasWeb, setHasWeb] = useState(false);
  const [templateContent, setTemplateContent] = useState("");
  
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pt, mt] = await Promise.all([getClientTypes(), getTemplates()]);
      setTypes(pt);
      setTemplates(mt);
    } catch (error) {
      Alert.alert("Error", "Error al cargar configuración");
    }
  };

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;
    setLoading(true);
    try {
      await createClientType(newTypeName);
      setNewTypeName("");
      await fetchData();
    } catch (error) {
      Alert.alert("Error", "Error al crear tipo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id: number) => {
    Alert.alert("Eliminar", "¿Seguro que deseas eliminar este tipo?", [
        { text: "Cancelar" },
        { text: "Eliminar", style: 'destructive', onPress: async () => {
            try {
                await deleteClientType(id);
                fetchData();
            } catch (error) {
                Alert.alert("Error", "No se puede eliminar un tipo que está en uso");
            }
        }}
    ])
  };

  const handleCreateTemplate = async () => {
    if (!selectedTypeId || !templateContent.trim()) {
        Alert.alert("Error", "Selecciona un tipo y escribe el contenido");
        return;
    }
    setLoading(true);
    try {
      await createTemplate({ clientTypeId: selectedTypeId, hasWeb, content: templateContent });
      setTemplateContent("");
      await fetchData();
    } catch (error) {
      Alert.alert("Error", "Error al crear plantilla");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
        await deleteTemplate(id);
        fetchData();
    } catch (error) {
        Alert.alert("Error", "Error al eliminar plantilla");
    }
  };

  const getTypeName = (id: number) => types.find(t => t.id === id)?.name || "Desconocido";

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Configuración</Text>

        {/* --- CLIENT TYPES --- */}
        <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-4">Tipos de Locales</Text>
            
            <View className="flex-row space-x-2 mb-4">
                <View className="flex-1">
                    <Input 
                        placeholder="Nuevo tipo (ej. Tienda, Profesional)" 
                        value={newTypeName}
                        onChangeText={setNewTypeName}
                        label=""
                    />
                </View>
                <TouchableOpacity 
                    onPress={handleCreateType}
                    className="bg-blue-600 justify-center px-4 rounded-xl"
                    style={{ height: 50, marginTop: 24 }}  
                >
                    <Text className="text-white font-bold">Agregar</Text>
                </TouchableOpacity>
            </View>

            <View className="bg-gray-50 rounded-xl p-4">
                {types.map(type => (
                    <View key={type.id} className="flex-row justify-between items-center py-2 border-b border-gray-200 last:border-0">
                        <Text className="text-gray-700 font-medium">{type.name}</Text>
                        <TouchableOpacity onPress={() => handleDeleteType(type.id)}>
                            <Text className="text-red-500">Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {types.length === 0 && <Text className="text-gray-400 text-center">No hay tipos definidos</Text>}
            </View>
        </View>

        {/* --- MESSAGE TEMPLATES --- */}
        <View className="mb-8">
            <Text className="text-xl font-semibold text-gray-800 mb-4">Plantillas de Mensaje</Text>
            
            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-4 shadow-sm">
                <Text className="font-medium text-gray-700">Nueva Plantilla</Text>
                
                {/* Type Selector */}
                <TouchableOpacity 
                    onPress={() => setShowTypeSelector(true)}
                    className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                >
                    <Text className={selectedTypeId ? "text-gray-900" : "text-gray-400"}>
                        {selectedTypeId ? getTypeName(selectedTypeId) : "Seleccionar Tipo de Cliente"}
                    </Text>
                </TouchableOpacity>

                {/* HasWeb Switch */}
                 <View className="flex-row items-center justify-between">
                    <Text className="text-gray-700">¿Caso con web?</Text>
                    <Switch
                        value={hasWeb}
                        onValueChange={setHasWeb}
                        trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
                    />
                </View>

                 {/* Content Input */}
                 <View>
                    <Text className="text-sm text-gray-500 mb-1">Variables: {"{nombre}"}, {"{tipo}"}</Text>
                    <TextInput
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholder="Contenido del mensaje..."
                        className="border border-gray-300 rounded-lg p-3 bg-gray-50 h-32"
                        value={templateContent}
                        onChangeText={setTemplateContent}
                    />
                 </View>

                 <Button loading={loading} onPress={handleCreateTemplate}>Guardar Plantilla</Button>
            </View>

            {/* List Templates */}
            <View className="space-y-3">
                {templates.map(tmpl => (
                    <View key={tmpl.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <View className="flex-row justify-between items-start mb-2">
                             <View className="flex-row space-x-2">
                                <View className="bg-blue-100 px-2 py-1 rounded">
                                    <Text className="text-blue-800 text-xs font-bold">{getTypeName(tmpl.clientTypeId)}</Text>
                                </View>
                                <View className={tmpl.hasWeb ? "bg-green-100 px-2 py-1 rounded" : "bg-orange-100 px-2 py-1 rounded"}>
                                    <Text className={tmpl.hasWeb ? "text-green-800 text-xs font-bold" : "text-orange-800 text-xs font-bold"}>
                                        {tmpl.hasWeb ? "Con Web" : "Sin Web"}
                                    </Text>
                                </View>
                             </View>
                             <TouchableOpacity onPress={() => handleDeleteTemplate(tmpl.id)}>
                                <Text className="text-red-500 text-xs">Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-600 text-sm leading-5">{tmpl.content}</Text>
                    </View>
                ))}
            </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>

      {/* Type Selector Modal */}
      <Modal visible={showTypeSelector} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white w-full max-w-sm rounded-2xl p-4 max-h-[80%]">
                <Text className="text-lg font-bold mb-4 text-center">Seleccionar Tipo</Text>
                <FlatList
                    data={types}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            className="py-3 border-b border-gray-100"
                            onPress={() => {
                                setSelectedTypeId(item.id);
                                setShowTypeSelector(false);
                            }}
                        >
                            <Text className="text-center text-lg text-blue-600">{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
                <Button variant="outline" onPress={() => setShowTypeSelector(false)} className="mt-4">Cancelar</Button>
            </View>
        </View>
      </Modal>
    </View>
  );
}
