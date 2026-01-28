import axios from "axios";


const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://data-client-backend.vercel.app";
const API_URL = `${API_BASE}/api`;

export const api = axios.create({
  baseURL: API_URL,
});

export interface ClientType {
  id: number;
  name: string;
}

export interface MessageTemplate {
  id: number;
  hasWeb: boolean;
  content: string;
  clientTypeId: number;
  clientType?: ClientType;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  type?: string; 
  clientTypeId?: number;
  clientType?: ClientType;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  hasWeb?: boolean;
  send?: boolean;
  createdAt?: string;
}

export const getClients = async (filter?: { send?: boolean }) => {
  const params = new URLSearchParams();
  if (filter?.send !== undefined) params.append("send", String(filter.send));
  
  const response = await api.get<Client[]>(`/clients?${params.toString()}`);
  return response.data;
};

export const getClient = async (id: number) => {
  const response = await api.get<Client>(`/clients/${id}`);
  return response.data;
};

export const createClient = async (client: Partial<Client>) => {
  const response = await api.post<Client>("/clients", client);
  return response.data;
};

export const updateClient = async (id: number, client: Partial<Client>) => {
  const response = await api.put<Client>(`/clients/${id}`, client);
  return response.data;
};

export const deleteClient = async (id: number) => {
  await api.delete(`/clients/${id}`);
};

export const getClientTypes = async () => {
  const response = await api.get<ClientType[]>("/client-types");
  return response.data;
};

export const createClientType = async (name: string) => {
  const response = await api.post<ClientType>("/client-types", { name });
  return response.data;
};

export const deleteClientType = async (id: number) => {
  await api.delete(`/client-types/${id}`);
};

export const getTemplates = async () => {
  const response = await api.get<MessageTemplate[]>("/message-templates");
  return response.data;
};

export const createTemplate = async (template: { clientTypeId: number, hasWeb: boolean, content: string }) => {
  const response = await api.post<MessageTemplate>("/message-templates", template);
  return response.data;
};

export const deleteTemplate = async (id: number) => {
  await api.delete(`/message-templates/${id}`);
};
