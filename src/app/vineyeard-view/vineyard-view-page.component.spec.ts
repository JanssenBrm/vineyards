import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VineyardViewPage } from './vineyard-view-page.component';

describe('VineyeardViewPage', () => {
  let component: VineyardViewPage;
  let fixture: ComponentFixture<VineyardViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VineyardViewPage],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(VineyardViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
