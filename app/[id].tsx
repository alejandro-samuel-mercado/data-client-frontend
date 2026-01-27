import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { Client, deleteClient, getClient, updateClient } from "../src/services/api";

export default function ClientDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Partial<Client>>({});

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClient(Number(id));
        setForm(data);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch client");
if (router.canGoBack()) {
  router.back();
} else {
  router.replace("/clients");
}      } finally {
        setFetching(false);
      }
    };
    if (id) fetchClient();
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateClient(Number(id), form);
      Alert.alert("Success", "Client updated successfully");
     if (router.canGoBack()) {
  router.back();
} else {
  router.replace("/clients");
}
    } catch (error) {
      Alert.alert("Error", "Failed to update client");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Client", "Are you sure you want to delete this client?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(Number(id));
            if (router.canGoBack()) {
  router.back();
} else {
  router.replace("/clients");
}
          } catch (error) {
            Alert.alert("Error", "Failed to delete client");
          }
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => handleChange("phone", text)}
          />
          <Input
            label="Type"
            value={form.type || ""}
            onChangeText={(text) => handleChange("type", text)}
          />
          <Input
            label="City"
            value={form.city || ""}
            onChangeText={(text) => handleChange("city", text)}
          />
          <Input
            label="Address"
            value={form.address || ""}
            onChangeText={(text) => handleChange("address", text)}
          />
          
          <View className="mt-6 space-y-3">
             <Button loading={loading} onPress={handleUpdate}>
                Actualizar Cambios
            </Button>
            
            <Button variant="destructive" onPress={handleDelete}>
                Eliminar Cliente
            </Button>
          </View>
         
        </View>
        <View className="h-10" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
