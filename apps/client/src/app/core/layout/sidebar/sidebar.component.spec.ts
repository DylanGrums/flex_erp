import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  it('should create the sidebar component', () => {
    TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule],
    });

    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
