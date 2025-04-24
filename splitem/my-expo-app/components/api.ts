import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const register = (data: { email: string; password: string; name: string }) =>
  api.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

export const getBills = (userId: string, token: string) =>
  api.get(`/bills/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });

export const createBill = (
  bill: { name: string; total: number; createdBy: string; participants: { user: string; amount: number }[] },
  token: string
) => api.post('/bills', bill, { headers: { Authorization: `Bearer ${token}` } });

export const payBill = (
  billId: string,
  userId: string,
  token: string
) => api.post(`/bills/${billId}/pay`, { userId }, { headers: { Authorization: `Bearer ${token}` } });

export const getPaypalLink = (token: string) =>
  api.get('/paypal/link', { headers: { Authorization: `Bearer ${token}` } });

export const linkPaypalCallback = (code: string, userId: string) =>
  api.get(`/paypal/callback?code=${code}&userId=${userId}`);
