import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserbuttonComponent } from './userbutton.component';

describe('UserbuttonComponent', () => {
  let component: UserbuttonComponent;
  let fixture: ComponentFixture<UserbuttonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserbuttonComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserbuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
