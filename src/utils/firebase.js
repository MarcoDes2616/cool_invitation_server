const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } = require("firebase/firestore");
const { getStorage } = require("firebase/storage");

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAkbXR014C05XWDNQ9nySplEiCSe1u3HSU",
  authDomain: "webtradingsf.firebaseapp.com",
  projectId: "webtradingsf",
  storageBucket: "webtradingsf.appspot.com",
  messagingSenderId: "657601885222",
  appId: "1:657601885222:web:387b5391b10c13e67c62e7",
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

/**
 * Guarda un formulario en Firestore.
 * @param {Object} formData - Datos del formulario.
 * @returns {Promise<Object>} - Resultado de la operación.
 */
const guardarFormulario = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, "formEntries"), {
      ...formData,
      createdAt: serverTimestamp(),
    });    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error guardando el formulario:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene todos los formularios guardados en la colección "formEntries".
 * @returns {Promise<Array>} - Lista de usuarios.
 */
const obtenerRegistros = async () => {
  try {
    const formEntriesRef = collection(db, "formEntries");
    const q = query(formEntriesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const usuarios = [];
    querySnapshot.forEach((doc) => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, usuarios };
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return { success: false, error: error.message };
  }
};


module.exports = { storage, guardarFormulario, obtenerRegistros };

