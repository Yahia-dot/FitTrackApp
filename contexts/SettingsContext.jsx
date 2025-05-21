import { createContext, useState, useEffect } from "react"
import { databases } from "../lib/appwrite"
import { useUser } from "../hooks/useUser"
import { ID, Query, Permission, Role } from "appwrite"
import Constants from "expo-constants"

const {
  appwriteDatabaseId,
  userSettings,
} = Constants.expoConfig.extra;

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
  const { user } = useUser()

  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load settings
  async function loadSettings() {
    if (!user) return
    setLoading(true)

    try {
      const res = await databases.listDocuments(
        appwriteDatabaseId,
        userSettings,
        [Query.equal("userId", user.$id)]
      )

      if (res.documents.length > 0) {
        setSettings(res.documents[0])
      } else {
        setSettings(null)
      }
    } catch (err) {
      console.error("Error loading settings:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create settings if not exists
  async function createSettings(data) {
    try {
      const res = await databases.createDocument(
        appwriteDatabaseId,
        userSettings,
        ID.unique(),
        { ...data, userId: user.$id },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      )
      setSettings(res)
    } catch (err) {
      console.error("Error creating settings:", err.message)
      setError(err.message)
    }
  }

  // Update settings
  async function updateSettings(updates) {
    if (!settings) return

    try {
      const res = await databases.updateDocument(
        appwriteDatabaseId,
        userSettings,
        settings.$id,
        { ...updates }
      )
      setSettings(res)
    } catch (err) {
      console.error("Error updating settings:", err.message)
      setError(err.message)
    }
  }

  // Delete settings
  async function deleteSettings() {
    if (!settings) return

    try {
      await databases.deleteDocument(
        appwriteDatabaseId,
        userSettings,
        settings.$id
      )
      setSettings(null)
    } catch (err) {
      console.error("Error deleting settings:", err.message)
      setError(err.message)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [user])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        loadSettings,
        createSettings,
        updateSettings,
        deleteSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext
