import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddvineyardComponent } from './addvineyard.component';

describe('AddvineyardComponent', () => {
  let component: AddvineyardComponent;
  let fixture: ComponentFixture<AddvineyardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddvineyardComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddvineyardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
