// services/authService.js
import { getAuth, onAuthStateChanged } from "firebase/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function getCurrentUserUID() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    // Un JWT tiene tres partes separadas por puntos: header.payload.signature
    const payload = token.split(".")[1];

    // Base64URL a JSON
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return decodedPayload.user_id || decodedPayload.uid || null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
}
export const getUserToken = async () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const uid = user.uid;
          const response = await fetch(`${BACKEND_URL}/api/token/${uid}`);
          if (!response.ok) throw new Error("Error al obtener el token");

          const data = await response.json();
          resolve({ uid, token: data.token });
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("No hay usuario autenticado"));
      }
    });
  });
};
