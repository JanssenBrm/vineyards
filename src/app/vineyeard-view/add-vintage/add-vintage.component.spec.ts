import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddVintageComponent } from './add-vintage.component';

describe('AddVintageComponent', () => {
  let component: AddVintageComponent;
  let fixture: ComponentFixture<AddVintageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVintageComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddVintageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
