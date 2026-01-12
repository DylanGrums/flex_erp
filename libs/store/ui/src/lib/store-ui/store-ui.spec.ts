import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreUi } from './store-ui';

describe('StoreUi', () => {
  let component: StoreUi;
  let fixture: ComponentFixture<StoreUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreUi],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreUi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
