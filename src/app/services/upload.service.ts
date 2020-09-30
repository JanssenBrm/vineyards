import { Injectable } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {FileChangeEvent} from '@angular/compiler-cli/src/perform_watch';
import {AngularFireStorage} from '@angular/fire/storage';
import {finalize, skipWhile, switchMap, tap} from 'rxjs/operators';
import {UploadTaskSnapshot} from '@angular/fire/storage/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
      private storage: AngularFireStorage
  ) { }

  public readFileList(list: FileList): File[] {
    return [...new Array(list.length)].fill(1).map((val, idx) => list.item(idx));
  }

  public uploadFile(path: string, file: File): Observable<string> {
    const ref = this.storage.ref(path);
    const task = ref.put(file);
    return task.snapshotChanges().pipe(
        skipWhile((change: UploadTaskSnapshot) => change.bytesTransferred !== change.totalBytes),
        switchMap( (change: UploadTaskSnapshot) => ref.getDownloadURL())
    );
  }
}
