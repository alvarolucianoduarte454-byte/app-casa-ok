"use client";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

async function createUserProfile(uid: string, data: {
  fullName: string; email: string; phone?: string | null; partnerCode?: string | null;
}) {
  await setDoc(doc(db, "users", uid), {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    partnerCode: data.partnerCode ?? null, // código da imobiliária (se houver)
    role: "cliente",
    planId: null,            // ainda sem plano
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function signUpWithEmail(email: string, password: string, fullName: string, phone?: string, partnerCode?: string) {
  try {
    // Verificar se o Firebase está configurado
    if (!auth) {
      throw new Error("Firebase não está configurado. Verifique as variáveis de ambiente.");
    }
    
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) { 
      await updateProfile(res.user, { displayName: fullName }); 
    }
    await createUserProfile(res.user.uid, { fullName, email, phone: phone ?? null, partnerCode: partnerCode ?? null });
    console.log("✅ Cadastro realizado com sucesso");
    return res.user;
  } catch (error: any) {
    console.error("❌ Erro no cadastro:", error);
    throw new Error(getErrorMessage(error.code));
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Verificar se o Firebase está configurado
    if (!auth) {
      throw new Error("Firebase não está configurado. Verifique as variáveis de ambiente.");
    }
    
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login realizado com sucesso");
    return res.user;
  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    throw new Error(getErrorMessage(error.code));
  }
}

export async function signInWithGoogle() {
  try {
    // Verificar se o Firebase está configurado
    if (!auth) {
      throw new Error("Firebase não está configurado. Verifique as variáveis de ambiente.");
    }
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("🔄 Iniciando login com Google...");
    
    // Verificar se estamos em ambiente de desenvolvimento
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname.includes('e2b.app') ||
                  window.location.hostname.includes('vercel.app');
    
    // Para ambientes de desenvolvimento, usar apenas popup com configuração especial
    if (isDev) {
      console.log("🔄 Ambiente de desenvolvimento detectado, configurando popup especial...");
      
      // Configurar provider para ambiente de desenvolvimento
      provider.addScope('email');
      provider.addScope('profile');
      
      try {
        const res = await signInWithPopup(auth, provider);
        // garante que exista perfil no Firestore:
        await createUserProfile(res.user.uid, {
          fullName: res.user.displayName ?? "",
          email: res.user.email ?? "",
          phone: null,
          partnerCode: null
        });
        console.log("✅ Login com Google realizado com sucesso (popup)");
        return res.user;
      } catch (popupError: any) {
        console.log("⚠️ Popup falhou, erro:", popupError.code, popupError.message);
        
        // Se o erro for relacionado ao iframe/URL ilegal, mostrar mensagem específica
        if (popupError.message?.includes('Illegal url') || 
            popupError.message?.includes('iframe') ||
            popupError.code === 'auth/unauthorized-domain') {
          throw new Error("Erro de configuração do Firebase. Verifique se o domínio atual está autorizado no Firebase Console em Authentication > Settings > Authorized domains.");
        }
        
        throw popupError;
      }
    } else {
      // Em produção, tenta popup primeiro, depois redirect
      try {
        const res = await signInWithPopup(auth, provider);
        // garante que exista perfil no Firestore:
        await createUserProfile(res.user.uid, {
          fullName: res.user.displayName ?? "",
          email: res.user.email ?? "",
          phone: null,
          partnerCode: null
        });
        console.log("✅ Login com Google realizado com sucesso (popup)");
        return res.user;
      } catch (popupError: any) {
        console.log("⚠️ Popup falhou, tentando redirect:", popupError.code);
        
        // Se popup falhar por bloqueio ou iframe, usa redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.message?.includes('iframe') || 
            popupError.message?.includes('Illegal url')) {
          
          console.log("🔄 Usando redirect como alternativa...");
          await signInWithRedirect(auth, provider);
          return null; // O redirect vai recarregar a página
        }
        
        throw popupError;
      }
    }
    
  } catch (error: any) {
    console.error("❌ Erro no login com Google:", error);
    throw new Error(getGoogleErrorMessage(error));
  }
}

export async function checkRedirectResult() {
  try {
    if (!auth) {
      return null;
    }
    
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("✅ Login com Google realizado com sucesso (redirect)");
      return result.user;
    }
    return null;
  } catch (error: any) {
    console.error("❌ Erro no redirect result:", error);
    return null;
  }
}

export async function signOutUser() {
  try {
    if (!auth) {
      throw new Error("Firebase não está configurado.");
    }
    
    await signOut(auth);
    console.log("✅ Logout realizado com sucesso");
  } catch (error: any) {
    console.error("❌ Erro ao sair:", error);
    throw new Error("Erro ao fazer logout");
  }
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/operation-not-allowed":
      return "⚠️ O método de autenticação por email/senha não está habilitado no Firebase Console. Acesse Authentication > Sign-in method > Email/Password e ative esta opção.";
    case "auth/api-key-not-valid":
      return "Configuração do Firebase inválida. Clique em 'Aplicar no Sandbox' no banner laranja.";
    case "auth/configuration-not-found":
      return "Firebase não configurado. Verifique as variáveis de ambiente.";
    case "auth/invalid-api-key":
      return "Chave da API do Firebase inválida. Verifique NEXT_PUBLIC_FIREBASE_API_KEY.";
    case "auth/email-already-in-use":
      return "Este email já está em uso.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    default:
      return `Erro inesperado (${errorCode}). Verifique a configuração do Firebase.`;
  }
}

function getGoogleErrorMessage(error: any): string {
  const errorCode = error.code;
  const errorMessage = error.message || "";
  
  switch (errorCode) {
    case "auth/popup-closed-by-user":
      return "Login cancelado pelo usuário.";
    case "auth/popup-blocked":
      return "Popup bloqueado pelo navegador. Tentando método alternativo...";
    case "auth/unauthorized-domain":
      return "Domínio não autorizado no Firebase Console. Adicione o domínio atual em Authentication > Settings > Authorized domains.";
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key":
      return "Configuração do Firebase inválida. Clique em 'Aplicar no Sandbox' no banner laranja.";
    case "auth/configuration-not-found":
      return "Firebase não configurado. Verifique as variáveis de ambiente.";
    default:
      if (errorMessage.includes('iframe') || errorMessage.includes('Illegal url')) {
        return "Erro de configuração do Firebase. O domínio atual precisa ser autorizado no Firebase Console em Authentication > Settings > Authorized domains.";
      }
      return getErrorMessage(errorCode);
  }
}