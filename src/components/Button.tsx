import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button = ({
  variant = "primary",
  size = "default",
  loading = false,
  className,
  textClassName,
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = "flex-row items-center justify-center rounded-2xl active:opacity-80";
  
  const variants = {
    primary: "bg-primary shadow-lg shadow-primary/30",
    secondary: "bg-secondary shadow-lg shadow-secondary/30",
    destructive: "bg-red-500",
    outline: "border-2 border-primary bg-transparent",
  };

  const sizes = {
    default: "h-14 px-6",
    sm: "h-10 px-4",
    lg: "h-16 px-8",
  };

  const textBaseStyles = "font-bold text-base";
  
  const textVariants = {
    primary: "text-white",
    secondary: "text-white",
    destructive: "text-white",
    outline: "text-primary",
  };

  return (
    <TouchableOpacity
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#4F46E5" : "white"} />
      ) : (
        <Text className={cn(textBaseStyles, textVariants[variant], textClassName)}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};
