import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, firstValueFrom, of } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { Store } from '@ngxs/store';
import { DefaultLayoutComponent } from './default-layout.component';
import { ThemeService } from '../../../shared/theme/theme.service';

describe('DefaultLayoutComponent', () => {
  let component: DefaultLayoutComponent;
  let events$: Subject<any>;
  let dialogClose$: Subject<any>;
  let dialogService: { open: jest.Mock };
  let childRoute: any;
  let logSpy: jest.SpyInstance;
  let themeService: ThemeService;

  beforeEach(
    waitForAsync(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      events$ = new Subject();
      dialogClose$ = new Subject();
      dialogService = {
        open: jest.fn().mockReturnValue({ onClose: dialogClose$ }),
      };
      childRoute = {
        snapshot: { data: { title: 'Title', subtitle: 'Subtitle' } },
        firstChild: null,
      };
      const activatedRoute = {
        snapshot: { data: {} },
        firstChild: childRoute,
      } as unknown as ActivatedRoute;

      (window as any).matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        media: '',
      }));

      TestBed.configureTestingModule({
        imports: [DefaultLayoutComponent],
        providers: [
          { provide: Router, useValue: { events: events$.asObservable() } },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: DialogService, useValue: dialogService },
          { provide: Store, useValue: { select: () => of(null) } },
        ],
      }).compileComponents();

      themeService = TestBed.inject(ThemeService);
      const fixture = TestBed.createComponent(DefaultLayoutComponent);
      component = fixture.componentInstance;
    }),
  );

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    const route = TestBed.inject(ActivatedRoute) as any;
    route.firstChild = childRoute;
    route.snapshot.data = {};
    childRoute.snapshot.data = { title: 'Title', subtitle: 'Subtitle' };
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('initializes dark mode from localStorage preference', () => {
    localStorage.setItem('theme', 'dark');
    themeService.init();
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark mode when stored preference is false', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');
    themeService.init();

    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('falls back to matchMedia when no preference and toggles mode', () => {
    (window as any).matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      media: '',
    });

    themeService.init();
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.isDarkMode()).toBe(true);

    component.toggleDarkMode();
    expect(component.isDarkMode()).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('handles light system preference when none stored', () => {
    (window as any).matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      media: '',
    });

    themeService.init();
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('exposes page metadata from deepest activated route', async () => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title = await firstValueFrom(component.pageTitle$);
    const subtitle = await firstValueFrom(component.pageSubtitle$);
    expect(title).toBe('Title');
    expect(subtitle).toBe('Subtitle');

    childRoute.snapshot.data = { title: 'New', subtitle: 'Sub' };
    events$.next(new NavigationEnd(1, '/', '/'));
    const updatedTitle = await firstValueFrom(component.pageTitle$);
    expect(updatedTitle).toBe('New');
  });

  it('reads meta from root route when there is no child', async () => {
    const route = TestBed.inject(ActivatedRoute) as any;
    route.firstChild = null;
    route.snapshot.data = { title: 'Root title', subtitle: 'Root sub' };

    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title = await firstValueFrom(component.pageTitle$);
    expect(title).toBe('Root title');
  });

  it('returns empty metadata when route data is missing', async () => {
    const route = TestBed.inject(ActivatedRoute) as any;
    route.firstChild = null;
    route.snapshot.data = undefined;

    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title = await firstValueFrom(component.pageTitle$);
    const subtitle = await firstValueFrom(component.pageSubtitle$);
    expect(title).toBe('');
    expect(subtitle).toBe('');
  });

  it('opens and cleans dialog reference', () => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.openLoginDialog();
    expect(dialogService.open).toHaveBeenCalled();
    expect(component.ref).not.toBeNull();

    dialogClose$.next('closed');
    expect(component.ref).toBeNull();
  });

  it('skips dialog subscription when no dialog ref is returned', () => {
    dialogService.open.mockReturnValueOnce(null);
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.openLoginDialog();
    expect(component.ref).toBeNull();
  });

  it('deduplicates identical metadata emissions', (done) => {
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const emissions: string[] = [];
    const sub = component.pageTitle$.subscribe((title) => emissions.push(title));

    events$.next(new NavigationEnd(1, '/', '/'));
    events$.next(new NavigationEnd(2, '/', '/'));

    setTimeout(() => {
      expect(emissions.length).toBe(1);
      sub.unsubscribe();
      done();
    }, 0);
  });

  it('migrates legacy darkMode preference', () => {
    localStorage.setItem('darkMode', 'true');
    themeService.init();

    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.getItem('darkMode')).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('stores dark mode preference when toggled on', () => {
    document.documentElement.classList.remove('dark');
    themeService.init();
    const fixture = TestBed.createComponent(DefaultLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleDarkMode();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
