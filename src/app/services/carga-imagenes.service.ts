import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FileItem } from '../models/file-item';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGENES = 'img';

  constructor(private db: AngularFirestore) { }

  cargarImagenesFirebase(imagenes: FileItem[]) {
    // console.log(imagenes);

    // referencia al storage de firebird donde dejar las imagenes
    const storageRef = firebase.storage().ref();

    for (const item of imagenes) {
      item.estaSubiendo = true;
      if (item.progreso >= 100) {
        continue;
      }

      const uploadTask: firebase.storage.UploadTask =
        storageRef.child(`${this.CARPETA_IMAGENES}/${item.nombreArchivo}`)
          .put(item.archivo);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot: firebase.storage.UploadTaskSnapshot) => item.progreso = (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        (error) => console.log('Error al subir', error),
        () => {
          console.log('Imagen cargada correctamente');
          uploadTask.snapshot.ref.getDownloadURL().then((url: string) => {
            item.url = url;
            item.estaSubiendo = false;
            // Una vez subido la imagen al storage, se guarda en BBDD
            this.guardarImagen({
              nombre: item.nombreArchivo,
              url: item.url
            });
          });
          // item.url = uploadTask.snapshot.downloadURL;
        }
      );
    }

  }

  private guardarImagen(imagen: { nombre: string, url: string }) {
    this.db.collection(`/${this.CARPETA_IMAGENES}`).add(imagen);
  }
}
