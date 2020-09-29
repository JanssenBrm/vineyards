import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddNoteComponent } from './add-note.component';

describe('AddNoteComponent', () => {
  let component: AddNoteComponent;
  let fixture: ComponentFixture<AddNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNoteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
