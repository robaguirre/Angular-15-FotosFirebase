import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import { FileItem } from '../models/file-item';

@Directive({
  selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {

  @Input() archivos: FileItem[] = [];
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  @HostListener('dragover', ['$event'])
  public onDrangEnter(event: any) {
    this.mouseSobre.emit(true);
    this._prevenirDetener(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDrangLeave(event: any) {
    this.mouseSobre.emit(false);
    // this._prevenirDetener(event);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any) {

    const transferencia = this._getTranferencia(event);

    if (!transferencia) {
      return;
    }

    this._extraerArchivos(transferencia.files);

    this._prevenirDetener(event);

    this.mouseSobre.emit(false);

  }

  // Segun navegadores se trata diferente el drag&drop
  private _getTranferencia(event: any) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
  }

  private _extraerArchivos(archivosLista: FileList) {
    // console.log(archivosLista);
    // tslint:disable-next-line: forin
    for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
      const archivoTemporal = archivosLista[propiedad];
      if (this._archivoPuedeSerCargado(archivoTemporal)) {
        const nuevoArchivo = new FileItem(archivoTemporal);
        this.archivos.push(nuevoArchivo);
      }
    }

    console.log(this.archivos);
  }

  // Validaciones
  private _archivoPuedeSerCargado(archivo: File): boolean {
    if (!this._archivoYaFueDroppeado(archivo.name) && this._esImagen(archivo.type)) {
      return true;
    } else {
      return false;
    }
  }


  private _prevenirDetener(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _archivoYaFueDroppeado(nombreArchivo: string): boolean {

    for (const archivo of this.archivos) {
      if (archivo.nombreArchivo === nombreArchivo) {
        console.log('el archivo ' + nombreArchivo + 'ya esta agregado');
        return true;
      }
    }
    return false;
  }

  // Interpreta el -1 de startWith como false
  private _esImagen(tipoArchivo: string): boolean {
    return (tipoArchivo === '' || tipoArchivo === undefined) ? false : tipoArchivo.startsWith('image');
  }

}
