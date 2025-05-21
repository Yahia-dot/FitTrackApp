import { useContext } from "react";
import { UserProfilesContext } from "../contexts/UserProfilesContext";

export function useUserProfiles() {
  const context = useContext(UserProfilesContext);
  
  if (!context) {
    throw new Error("useUserProfiles must be used within a UserProfilesProvider");
  }
  
  return context;
}