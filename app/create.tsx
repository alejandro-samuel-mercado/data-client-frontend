import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { createClient } from "../src/services/api";

export default function CreateClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    type: "",
    address: "",
    city: "",
    province: "",
    country: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.phone.trim()) newErrors.phone = "El teléfono es obligatorio";
    if (!form.type.trim()) newErrors.type = "El tipo es obligatorio";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createClient(form);
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
          <Input
            label="Tipo de local (obligatorio)"
            placeholder=""
            value={form.type}
            onChangeText={(text) => handleChange("type", text)}
            error={errors.type}
          />
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
    </KeyboardAvoidingView>
  );
}
