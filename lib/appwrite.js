import { Client, Account, Avatars, Databases } from 'appwrite';

export const client = new Client()

client 
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('682b4027002ca0d6ae80')

export const account = new Account(client)
export const avatars = new Avatars(client)
export const databases = new Databases(client)