import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VintagesComponent } from './vintages.component';

describe('VintagesComponent', () => {
  let component: VintagesComponent;
  let fixture: ComponentFixture<VintagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VintagesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VintagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
