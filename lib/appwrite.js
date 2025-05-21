import { Client, Account, Avatars, Databases } from 'appwrite';
import Constants from 'expo-constants';

const {
  appwriteEndpoint,
  appwriteProjectId,
} = Constants.expoConfig.extra;

export const client = new Client();

client
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);