import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SidepanelComponent } from './sidepanel.component';

describe('SidepanelComponent', () => {
  let component: SidepanelComponent;
  let fixture: ComponentFixture<SidepanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidepanelComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SidepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
