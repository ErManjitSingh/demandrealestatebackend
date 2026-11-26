import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDYdmkyt9i5w8oiV7Lr0WbbveuwMp2AAps",
  authDomain: "packagemaker-image.firebaseapp.com",
  projectId: "packagemaker-image",
  storageBucket: "packagemaker-image.firebasestorage.app",
  messagingSenderId: "492030504571",
  appId: "1:492030504571:web:1b14f571c658cc4cdafcde",
  measurementId: "G-SGPN15SB2K",
};

const storage = getStorage(initializeApp(firebaseConfig));
const bucket = firebaseConfig.storageBucket;

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadWithRest(file, path) {
  const endpoint = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(path)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.downloadTokens) {
    throw new Error(data.error?.message || "Image upload failed");
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${data.downloadTokens}`;
}

export async function uploadImage(file, folder) {
  const path = `demandsetu-real-estate/${folder}/${Date.now()}-${safeName(file.name || "image.jpg")}`;
  try {
    const stored = await uploadBytes(ref(storage, path), file, {
      contentType: file.type || "image/jpeg",
    });
    return await getDownloadURL(stored.ref);
  } catch {
    return uploadWithRest(file, path);
  }
}
