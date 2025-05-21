import { createContext, useState, useEffect } from "react";
import { databases } from "../lib/appwrite";
import { useUser } from "../hooks/useUser";
import { Query } from "appwrite";
import Constants from "expo-constants";

const {
  appwriteDatabaseId,
  userProfiles,
} = Constants.expoConfig.extra;

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user } = useUser()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch profile
  async function loadProfileData() {
    if (!user) return
    setLoading(true)

    try {
      const res = await databases.listDocuments(
        appwriteDatabaseId,
        userProfiles,
        [Query.equal("userId", user.$id)]
      )

      if (res.documents.length > 0) {
        setProfile(res.documents[0])
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error("Error loading profile:", err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  async function updateProfile(updates) {
    if (!profile) return

    try {
      const res = await databases.updateDocument(
        appwriteDatabaseId,
        userProfiles,
        profile.$id,
        { ...updates }
      )

      setProfile(res)
    } catch (err) {
      console.error("Error updating profile:", err.message)
      setError(err.message)
    }
  }

  // Create profile (if needed)
  async function createProfile(data) {
    try {
      const res = await databases.createDocument(
        appwriteDatabaseId,
        userProfiles,
        ID.unique(),
        { ...data, userId: user.$id },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      )
      setProfile(res)
    } catch (err) {
      console.error("Error creating profile:", err.message)
      setError(err.message)
    }
  }

  // Delete profile
  async function deleteProfile() {
    if (!profile) return

    try {
      await databases.deleteDocument(
        appwriteDatabaseId,
        userProfiles,
        profile.$id
      )
      setProfile(null)
    } catch (err) {
      console.error("Error deleting profile:", err.message)
      setError(err.message)
    }
  }

  useEffect(() => {
    loadProfileData()
  }, [user])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        loadProfileData,
        updateProfile,
        createProfile,
        deleteProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export default ProfileContext;
