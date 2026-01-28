import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { ClientType, createClient, getClientTypes } from "../src/services/api";

export default function CreateClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [types, setTypes] = useState<ClientType[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ClientType | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    country: "",
    hasWeb: false,
    send: false,
  });

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
        const data = await getClientTypes();
        setTypes(data);
    } catch (error) {
        console.error("Failed to load types");
    }
  };

  const handleChange = (key: string, value: string | boolean) => {
    setForm({ ...form, [key]: value });
    if (typeof value === 'string' && errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.phone.trim()) newErrors.phone = "El teléfono es obligatorio";
    if (!selectedType) newErrors.type = "El tipo es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createClient({
          ...form,
          clientTypeId: selectedType!.id
      });
      router.back();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        Alert.alert("Error", "Ya existe un cliente con este nombre o teléfono");
      } else {
        Alert.alert("Error", "Error al crear cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <Input
            label="Nombre de Local (obligatorio)"
            placeholder=""
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            error={errors.name}
          />
          <Input
            label="Whatsapp (obligatorio)"
            placeholder=""
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => handleChange("phone", text)}
            error={errors.phone}
          />
          
            {/* Type Selector */}
            <View>
                <Text className="text-gray-700 font-medium mb-1">Tipo de local (obligatorio)</Text>
                <TouchableOpacity
                    onPress={() => setShowTypeModal(true)}
                    className={`border rounded-xl p-3 bg-gray-50 ${errors.type ? "border-red-500" : "border-gray-300"}`}
                >
                    <Text className={selectedType ? "text-gray-900" : "text-gray-400"}>
                        {selectedType ? selectedType.name : "Seleccionar Tipo"}
                    </Text>
                </TouchableOpacity>
                {errors.type && <Text className="text-red-500 text-sm mt-1">{errors.type}</Text>}
            </View>

           <Input
            label="Ciudad"
            placeholder=""
            value={form.city}
            onChangeText={(text) => handleChange("city", text)}
          />
           <Input
            label="Dirección"
            placeholder=""
            value={form.address}
            onChangeText={(text) => handleChange("address", text)}
          />

          <View className="flex-row space-x-4">
            <View className="flex-1">
               <Input
                label="Provincia"
                placeholder=""
                value={form.province}
                onChangeText={(text) => handleChange("province", text)}
              />
            </View>
            <View className="flex-1">
               <Input
                label="País"
                placeholder=""
                value={form.country}
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
          <View className="h-4" />
          <Button loading={loading} onPress={handleSubmit}>
            Guardar Cliente
          </Button>
          <Button variant="outline" onPress={() =>{if (router.canGoBack()) {
  router.back();
} else {
  router.replace("/clients");
}}} className="mt-2">
            Cancelar
          </Button>
        </View>
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
                                setSelectedType(item);
                                setShowTypeModal(false);
                                if (errors.type) setErrors({ ...errors, type: "" });
                            }}
                        >
                            <Text className={`text-center text-lg ${selectedType?.id === item.id ? "text-blue-600 font-bold" : "text-gray-700"}`}>
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
