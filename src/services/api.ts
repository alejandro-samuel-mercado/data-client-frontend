import axios from "axios";
import { Platform } from "react-native";

const API_URL = Platform.OS === "android" 
  ? process.env.API_URL + "/api/clients"
  : "http://localhost:3001/api/clients";

export const api = axios.create({
  baseURL: API_URL,
});

export interface Client {
  id: number;
  name: string;
  phone: string;
  type?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  hasWeb?: boolean;
  send?: boolean;
  createdAt?: string;
}

export const getClients = async () => {
  const response = await api.get<Client[]>("/");
  return response.data;
};

export const getClient = async (id: number) => {
  const response = await api.get<Client>(`/${id}`);
  return response.data;
};

export const createClient = async (client: Partial<Client>) => {
  const response = await api.post<Client>("/", client);
  return response.data;
};

export const updateClient = async (id: number, client: Partial<Client>) => {
  const response = await api.put<Client>(`/${id}`, client);
  return response.data;
};

export const deleteClient = async (id: number) => {
  await api.delete(`/${id}`);
};
