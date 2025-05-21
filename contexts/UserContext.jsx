import { createContext, useEffect, useState } from "react";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);
    try {
      await account.createEmailSession(email, password);
      const response = await account.get();
      setUser(response);
      return response;
    } catch (error) {
      throw Error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function register(email, password, name) {
    setLoading(true);
    try {
      // Create user account
      await account.create(ID.unique(), email, password, name);

      // Login after successful registration
      return await login(email, password);
    } catch (error) {
      throw Error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getInitialUserValue() {
    try {
      const res = await account.get();
      setUser(res);
    } catch (error) {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    getInitialUserValue();
  }, []);

  return (
    <UserContext.Provider value={{
      user, 
      login, 
      logout, 
      register, 
      authChecked,
      loading
    }}>
      {children}
    </UserContext.Provider>
  );
}
