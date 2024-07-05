import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'; // Importar para Firebase Storage
import { UtilsService } from './utils.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface Users {
  name: string;
  email: string;
  code: string;
  cicle: string;
  career: string;
  password: string;
  disabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private storage: any;
  auth: any;

  constructor() {
    this.storage = getStorage();
    this.auth = getAuth();
  }

  // Método para obtener el usuario actual
  async getCurrentUser(): Promise<Users | null> {
    const currentUser = await this.auth.currentUser;
    if (currentUser) {
      const userDoc = await this.getUserByEmail(currentUser.email);
      return userDoc ? userDoc : null;
    }
    return null;
  }

  // Método para obtener referencia de almacenamiento
  getStorageReference() {
    return this.storage;
  }

  login = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);

  // Método para obtener referencia de archivo en almacenamiento
  getStorageChildReference(storageRef: any, fileName: string) {
    return ref(storageRef, fileName);
  }

  // Método para subir archivo como string a almacenamiento
  async uploadStringToStorage(ref: any, data: string, format: 'data_url' | 'base64' | 'base64url') {
    await uploadString(ref, data, format);
  }

  // Método para obtener URL de descarga de un archivo en almacenamiento
  async getDownloadURL(ref: any) {
    return await getDownloadURL(ref);
  }

  // Método para tomar una foto con la cámara
  async takePicture(): Promise<string | undefined> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      return undefined;
    }
  }

  // Método para subir la foto a Firebase Storage
  async uploadPhotoToFirebase(dataUrl: string): Promise<string> {
    const storageRef = this.getStorageReference();
    const fileName = `${new Date().getTime()}.jpg`;

    const photoRef = this.getStorageChildReference(storageRef, fileName); // Referencia del archivo en Storage
    await this.uploadStringToStorage(photoRef, dataUrl, 'data_url'); // Subir la foto como string

    const downloadUrl = await this.getDownloadURL(photoRef); // Obtener la URL de descarga
    return downloadUrl; // Devolver la URL de la foto subida
  }

  
  // ===== Enviar email para restablecer contraseña ==========
  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }

  // ========================= Base de Datos ==================

  // ==== Setear un documento ====
  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  // ==== Obtener un documento ===
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // ==== Obtener usuarios con la estructura especificada ====
  async getUsersL(): Promise<Users[]> {
    const snapshot = await getDocs(collection(getFirestore(), 'users'));
    return snapshot.docs.map(doc => doc.data() as Users);
  }

  // ==== Obtener un usuario por email ====

  async getUserByEmail(email: string): Promise<Users | undefined> {
    const q = query(collection(getFirestore(), 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() as Users : undefined;
  }

  // ==== Actualizar un usuario ====
  async updateUser(user: Users) {
    const userRef = doc(getFirestore(), 'users', user.email);
    await setDoc(userRef, user, { merge: true });
  }

  // Nuevo método para guardar incidentes
  async saveIncident(incident: any) {
    const incidentRef = doc(collection(getFirestore(), 'incidents'));
    return setDoc(incidentRef, incident);
  }

  // Nuevo método para obtener incidentes por email de usuario
  async getIncidentsByUserEmail(email: string): Promise<any[]> {
    const q = query(collection(getFirestore(), 'incidents'), where('userEmail', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }
}
