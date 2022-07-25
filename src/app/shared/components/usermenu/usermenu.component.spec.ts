import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UsermenuComponent } from './usermenu.component';

describe('UsermenuComponent', () => {
  let component: UsermenuComponent;
  let fixture: ComponentFixture<UsermenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsermenuComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(UsermenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
