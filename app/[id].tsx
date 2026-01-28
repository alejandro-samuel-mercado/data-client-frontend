import { useLocalSearchParams, useRouter } from "expo-router";
import { Edit, Send } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Client, ClientType, deleteClient, getClient, getClientTypes, getTemplates, MessageTemplate, updateClient } from "../src/services/api";

export default function ClientDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>({});
  
  const [types, setTypes] = useState<ClientType[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [clientData, typesData, templatesData] = await Promise.all([
          getClient(Number(id)),
          getClientTypes(),
          getTemplates()
      ]);
      setClient(clientData);
      setForm(clientData);
      setTypes(typesData);
      setTemplates(templatesData);
    } catch (error) {
      Alert.alert("Error", "Error al cargar datos");
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = await updateClient(Number(id), form);
      setClient(updated); 
      setIsEditing(false);
      Alert.alert("Éxito", "Cliente actualizado");
    } catch (error) {
      Alert.alert("Error", "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
      if (!client) return;

      const template = templates.find(t => 
        t.clientTypeId === client.clientTypeId && 
        t.hasWeb === (client.hasWeb || false)
      );

      if (!template) {
          Alert.alert("Aviso", "No se encontró una plantilla para este tipo de cliente y estado web.");
          return;
      }

      let message = template.content;
      message = message.replace(/{nombre}/g, client.name);
      message = message.replace(/{tipo}/g, client.clientType?.name || "");

      const encodedMessage = encodeURIComponent(message);
      const url = `https://wa.me/${client.phone}?text=${encodedMessage}`;
      
      try {
        await Linking.openURL(url);
        
        if (!client.send) {
            await updateClient(client.id, { send: true });
            setClient({ ...client, send: true });
            setForm({ ...form, send: true });
        }
      } catch (err) {
          Alert.alert("Error", "No se pudo abrir WhatsApp");
      }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar", "¿Seguro que deseas eliminar este cliente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(Number(id));
            router.back();
          } catch (error) {
            Alert.alert("Error", "Error al eliminar");
          }
        },
      },
    ]);
  };

  if (fetching || !client) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Cargando...</Text>
      </View>
    );
  }

  const selectedTypeName = types.find(t => t.id === form.clientTypeId)?.name || "Seleccionar Tipo";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
             <Text className="text-blue-600 font-medium">Volver</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">
              {isEditing ? "Editar Cliente" : "Detalles"}
          </Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              {isEditing ? <Text className="text-blue-600 font-bold">Cancelar</Text> : <Edit size={24} color="#2563EB"/>}
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        
        {/* --- VIEW MODE --- */}
        {!isEditing && (
            <View className="space-y-6">
                <View className="items-center mb-4">
                    <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-3">
                        <Text className="text-3xl font-bold text-gray-400">{client.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-center">{client.name}</Text>
                    <Text className="text-gray-500 text-lg">{client.phone}</Text>
                    
                    <View className="flex-row space-x-2 mt-3">
                        {client.clientType && (
                            <View className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-blue-800 font-medium">{client.clientType.name}</Text>
                            </View>
                        )}
                         <View className={client.hasWeb ? "bg-green-100 px-3 py-1 rounded-full" : "bg-orange-100 px-3 py-1 rounded-full"}>
                            <Text className={client.hasWeb ? "text-green-800 font-medium" : "text-orange-800 font-medium"}>
                                {client.hasWeb ? "Tiene Web" : "Sin Web"}
                            </Text>
                         </View>
                    </View>
                </View>

                {/* Info Card */}
                <View className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <InfoRow label="Ciudad" value={client.city} />
                    <InfoRow label="Provincia" value={client.province} />
                    <InfoRow label="País" value={client.country} />
                    <InfoRow label="Dirección" value={client.address} />
                    <InfoRow label="Estado Envío" value={client.send ? "Enviado" : "Pendiente"} isStatus status={client.send} />
                </View>

                {/* Actions */}
                <TouchableOpacity 
                    onPress={handleSendMessage}
                    className="flex-row items-center justify-center bg-green-600 py-4 rounded-xl space-x-2 shadow-lg shadow-green-600/30"
                >
                    <Send color="white" size={20} />
                    <Text className="text-white font-bold text-lg">Enviar Mensaje</Text>
                </TouchableOpacity>

            </View>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
             <View className="space-y-4">
                <Input
                  label="Nombre"
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                />
                <Input
                  label="Teléfono"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                />
                
                {/* Type Selector */}
                  <View>
                      <Text className="text-gray-700 font-medium mb-1">Tipo de local</Text>
                      <TouchableOpacity
                          onPress={() => setShowTypeModal(true)}
                          className="border border-gray-300 rounded-xl p-3 bg-gray-50"
                      >
                          <Text className={form.clientTypeId ? "text-gray-900" : "text-gray-400"}>
                              {selectedTypeName}
                          </Text>
                      </TouchableOpacity>
                  </View>
      
                <Input
                  label="Ciudad"
                  value={form.city || ""}
                  onChangeText={(text) => handleChange("city", text)}
                />
                <Input
                  label="Dirección"
                  value={form.address || ""}
                  onChangeText={(text) => handleChange("address", text)}
                />
      
                 <View className="flex-row space-x-4">
                  <View className="flex-1">
                     <Input
                      label="Provincia"
                      placeholder=""
                      value={form.province || ""}
                      onChangeText={(text) => handleChange("province", text)}
                    />
                  </View>
                  <View className="flex-1">
                     <Input
                      label="País"
                      placeholder=""
                      value={form.country || ""}
                      onChangeText={(text) => handleChange("country", text)}
                    />
                  </View>
                </View>
      
                <View className="bg-gray-50 p-4 rounded-xl space-y-4">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-700 font-medium">¿Tiene sitio web?</Text>
                      <Switch
                        value={Boolean(form.hasWeb)}
                        onValueChange={(value) => handleChange("hasWeb", value)}
                        trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
                        thumbColor={form.hasWeb ? "#FFFFFF" : "#F3F4F6"}
                      />
                    </View>
                    
                    <View className="h-[1px] bg-gray-200" />
      
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-700 font-medium">¿Información enviada?</Text>
                      <Switch
                        value={Boolean(form.send)}
                        onValueChange={(value) => handleChange("send", value)}
                        trackColor={{ false: "#E5E7EB", true: "#2563EB" }}
                        thumbColor={form.send ? "#FFFFFF" : "#F3F4F6"}
                      />
                    </View>
                </View>
                
                <View className="mt-6 space-y-3">
                   <Button loading={loading} onPress={handleUpdate}>
                      Guardar Cambios
                  </Button>
                  
                  <Button variant="destructive" onPress={handleDelete}>
                      Eliminar Cliente
                  </Button>
                </View>
             </View>
        )}
        
        <View className="h-10" />
      </ScrollView>

       {/* Type Selection Modal */}
      <Modal visible={showTypeModal} transparent animationType="fade">
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
                                handleChange("clientTypeId", item.id);
                                setShowTypeModal(false);
                            }}
                        >
                            <Text className={`text-center text-lg ${form.clientTypeId === item.id ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
                <Button variant="outline" onPress={() => setShowTypeModal(false)} className="mt-4">Cancelar</Button>
            </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const InfoRow = ({ label, value, isStatus, status }: { label: string, value?: string, isStatus?: boolean, status?: boolean }) => (
    <View className="flex-row justify-between py-1">
        <Text className="text-gray-500">{label}</Text>
        {isStatus ? (
            <Text className={`font-medium ${status ? "text-green-600" : "text-orange-500"}`}>{value}</Text>
        ) : (
            <Text className="text-gray-900 font-medium text-right max-w-[60%]">{value || "-"}</Text>
        )}
    </View>
);
