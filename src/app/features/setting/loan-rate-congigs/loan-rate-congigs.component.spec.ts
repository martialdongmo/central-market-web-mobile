import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoanRateCongigsComponent } from './loan-rate-congigs.component';

describe('LoanRateCongigsComponent', () => {
  let component: LoanRateCongigsComponent;
  let fixture: ComponentFixture<LoanRateCongigsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanRateCongigsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanRateCongigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
