import React from "react";
import { Text, TextInput, View } from "react-native";
import { cn } from "../lib/utils";

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = ({
  label,
  error,
  containerClassName,
  className,
  ...props
}: InputProps) => {
  return (
    <View className={cn("space-y-2", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-gray-600 ml-1">{label}</Text>
      )}
      <TextInput
        placeholderTextColor="#9CA3AF"
        className={cn(
          "w-full h-14 bg-white border border-gray-200 rounded-2xl px-4 text-base text-gray-800 shadow-sm focus:border-primary focus:border-2",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <Text className="text-sm text-red-500 ml-1">{error}</Text>}
    </View>
  );
};
