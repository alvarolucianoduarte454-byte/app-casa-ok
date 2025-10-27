"use client";
import { db, storage, serverTimestamp } from "./firebase";
import {
  collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function addProperty(uid: string, data: any) {
  return await addDoc(collection(db, "properties"), {
    ...data, 
    ownerUid: uid, 
    planStatus: data.planId ? "pendente" : "inativo", 
    createdAt: serverTimestamp()
  });
}

export async function listUserProperties(uid: string) {
  const q = query(collection(db, "properties"), where("ownerUid", "==", uid));
  const snap = await getDocs(q); 
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function uploadPhotos(files: File[], ownerUid: string) {
  const urls: string[] = [];
  for (const f of files) {
    const r = ref(storage, `tickets/${ownerUid}/${Date.now()}-${f.name}`);
    await uploadBytes(r, f);
    urls.push(await getDownloadURL(r));
  }
  return urls;
}

async function isCovered(serviceType: string, planId: string | null, planStatus: string | null) {
  if (!planId || planStatus !== "ativo") return false;
  const q = query(collection(db, "services_catalog"), where("name", "==", serviceType));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  const svc = snap.docs[0].data() as any;
  return Array.isArray(svc.coveredBy) && svc.coveredBy.includes(planId);
}

export async function createTicket(payload: {
  ownerUid: string; 
  propertyId: string | null; 
  serviceType: string; 
  title: string; 
  description: string; 
  priority: "normal" | "urgente"; 
  photos?: File[];
  usedAdHocAddress?: boolean;
  adHocAddress?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
}) {
  let planId = null;
  let planStatus = null;
  
  // Se tem propertyId, buscar dados do imóvel
  if (payload.propertyId) {
    const prop = await getDoc(doc(db, "properties", payload.propertyId));
    if (prop.exists()) {
      const propData = prop.data() as any;
      planId = propData.planId ?? null;
      planStatus = propData.planStatus ?? null;
    }
  }
  
  const photoUrls = payload.photos?.length ? await uploadPhotos(payload.photos, payload.ownerUid) : [];
  const covered = await isCovered(payload.serviceType, planId, planStatus);

  const ticketData: any = {
    ownerUid: payload.ownerUid, 
    propertyId: payload.propertyId,
    serviceType: payload.serviceType, 
    title: payload.title, 
    description: payload.description,
    photos: photoUrls, 
    priority: payload.priority,
    includedInPlan: covered, 
    status: covered ? "novo" : "orçamento",
    createdAt: serverTimestamp(), 
    updatedAt: serverTimestamp()
  };

  // Adicionar campos de endereço avulso se aplicável
  if (payload.usedAdHocAddress && payload.adHocAddress) {
    ticketData.usedAdHocAddress = true;
    ticketData.adHocAddress = payload.adHocAddress;
  }

  const ticketRef = await addDoc(collection(db, "tickets"), ticketData);

  // Criar orçamento se não coberto pelo plano
  if (!covered) {
    await addDoc(collection(db, "quotes"), {
      ticketId: ticketRef.id, 
      ownerUid: payload.ownerUid, 
      propertyId: payload.propertyId,
      serviceType: payload.serviceType, 
      descriptionCliente: payload.description,
      estimatedValue: null, 
      status: "aguardando", 
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp()
    });
  }
  return ticketRef.id;
}

export async function listUserTickets(uid: string) {
  const q = query(
    collection(db, "tickets"), 
    where("ownerUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q); 
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listUserQuotes(uid: string) {
  const q = query(
    collection(db, "quotes"), 
    where("ownerUid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q); 
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function approveQuote(quoteId: string) {
  await updateDoc(doc(db, "quotes", quoteId), { 
    status: "aprovado", 
    updatedAt: serverTimestamp() 
  });
}

export async function rejectQuote(quoteId: string) {
  await updateDoc(doc(db, "quotes", quoteId), { 
    status: "recusado", 
    updatedAt: serverTimestamp() 
  });
}