import api from '../lib/api';
import { AxiosResponse } from 'axios';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface LibraryAccess {
  id: string;
  user: string;
  user_display: string;
  library: string;
  library_display: string;
  access_type: string;
  access_type_display: string;
  granted_by: string | null;
  granted_by_display: string | null;
  granted_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface AdminProfile {
  id: string;
  user: string;
  user_display: string;
  managed_library: string | null;
  managed_library_display: string | null;
  permissions: Record<string, any>;
  can_manage_events: boolean;
  can_manage_books: boolean;
  can_view_analytics: boolean;
  created_at: string;
  updated_at: string;
}

// Admin User Management
export const getUsers = async (params?: Record<string, any>): Promise<AxiosResponse<{ results: User[] }>> => {
  return api.get('/auth/users/', { params });
};

export const getUserById = async (userId: string): Promise<AxiosResponse<User>> => {
  return api.get(`/auth/users/${userId}/`);
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<AxiosResponse<User>> => {
  return api.patch(`/auth/users/${userId}/`, userData);
};

export const createUser = async (userData: Partial<User>): Promise<AxiosResponse<User>> => {
  return api.post('/auth/users/', userData);
};

// Library Access Management
export const getLibraryAccess = async (params?: Record<string, any>): Promise<AxiosResponse<{ results: LibraryAccess[] }>> => {
  return api.get('/auth/library-access/', { params });
};

export const getLibraryApplications = async (params?: Record<string, any>): Promise<AxiosResponse<{ results: LibraryAccess[] }>> => {
  return api.get('/auth/library-applications/', { params });
};

export const approveLibraryAccess = async (accessId: string): Promise<AxiosResponse<{ message: string; application: LibraryAccess }>> => {
  return api.post(`/auth/library-access/${accessId}/approve/`);
};

export const rejectLibraryAccess = async (accessId: string, reason: string): Promise<AxiosResponse<{ message: string; application: LibraryAccess }>> => {
  return api.post(`/auth/library-access/${accessId}/reject/`, { reason });
};

// Admin Profile Management
export const getAdminProfiles = async (): Promise<AxiosResponse<{ results: AdminProfile[] }>> => {
  return api.get('/auth/admin-profiles/');
};

export const createAdminProfile = async (profileData: Partial<AdminProfile>): Promise<AxiosResponse<AdminProfile>> => {
  return api.post('/auth/admin-profiles/create/', profileData);
};

export const updateAdminProfile = async (profileId: string, profileData: Partial<AdminProfile>): Promise<AxiosResponse<AdminProfile>> => {
  return api.patch(`/auth/admin-profiles/${profileId}/`, profileData);
};

export const deleteAdminProfile = async (profileId: string): Promise<AxiosResponse<void>> => {
  return api.delete(`/auth/admin-profiles/${profileId}/`);
};

export const getEligibleAdminUsers = async (): Promise<AxiosResponse<{ results: User[] }>> => {
  return api.get('/auth/eligible-admin-users/');
};

export default {
  getUsers,
  getUserById,
  updateUser,
  createUser,
  getLibraryAccess,
  getLibraryApplications,
  approveLibraryAccess,
  rejectLibraryAccess,
  getAdminProfiles,
  createAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  getEligibleAdminUsers
};