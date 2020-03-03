import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VineyeardViewPage } from './vineyeard-view.page';

describe('VineyeardViewPage', () => {
  let component: VineyeardViewPage;
  let fixture: ComponentFixture<VineyeardViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VineyeardViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VineyeardViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
