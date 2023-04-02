import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, skipWhile, switchMap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { UploadTaskSnapshot } from '@angular/fire/compat/storage/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private storage: AngularFireStorage) {}

  public readFileList(list: FileList): File[] {
    return [...new Array(list.length)].fill(1).map((_, idx) => list.item(idx));
  }

  public uploadFile(path: string, file: File): Observable<string> {
    const ref = this.storage.ref(path);
    const task = ref.put(file);
    return task.snapshotChanges().pipe(
      skipWhile((change: UploadTaskSnapshot) => change.bytesTransferred !== change.totalBytes),
      delay(1000),
      switchMap(() => ref.getDownloadURL())
    );
  }
}
