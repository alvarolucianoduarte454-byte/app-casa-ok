import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const requireRole = (allowedRoles: string[]) => {
  return new Promise<{ user: any; role: string } | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Limpar listener
      
      if (!user) {
        resolve(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.exists() ? userDoc.data().role || "cliente" : "cliente";
        
        if (allowedRoles.includes(userRole)) {
          resolve({ user, role: userRole });
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error("Erro ao verificar role:", error);
        resolve(null);
      }
    });
  });
};

export const getUserRole = async (uid: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role || "cliente" : "cliente";
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    return "cliente";
  }
};

export const redirectToUserPanel = (role: string): string => {
  switch (role) {
    case "cliente":
      return "/dashboard";
    case "imobiliaria":
      return "/imobiliaria";
    case "tecnico":
      return "/tecnico";
    case "admin":
      return "/admin";
    default:
      return "/dashboard";
  }
};