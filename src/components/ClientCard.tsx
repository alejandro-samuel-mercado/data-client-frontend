import { ChevronRight, MapPin, Phone, User } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../lib/utils";
import { Client } from "../services/api";

interface ClientCardProps {
  client: Client;
  onPress: () => void;
}

export const ClientCard = ({ client, onPress }: ClientCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4 flex-row items-center"
    >
      <View className={cn(
        "h-12 w-12 rounded-full items-center justify-center mr-4",
        client.type === "vip" ? "bg-amber-100" : "bg-primary/10"
      )}>
        <User size={24} color={client.type === "vip" ? "#F59E0B" : "#4F46E5"} />
      </View>

      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900">{client.name}</Text>
        <View className="flex-row items-center mt-1">
          <Phone size={14} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-1.5">{client.phone}</Text>
        </View>
        {client.city && (
          <View className="flex-row items-center mt-1">
            <MapPin size={14} color="#9CA3AF" />
            <Text className="text-gray-500 text-sm ml-1.5">{client.city}</Text>
          </View>
        )}
      </View>
      
      {client.type && (
          <View className={cn(
            "px-2.5 py-1 rounded-full mr-2",
             client.type === "vip" ? "bg-amber-100" : "bg-gray-100"
          )}>
            <Text className={cn(
                "text-xs font-semibold capitalize",
                client.type === "vip" ? "text-amber-700" : "text-gray-600"
            )}>
                {client.type}
            </Text>
          </View>
      )}

      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
};
