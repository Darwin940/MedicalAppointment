import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MedicoComponent } from './medico-component';

describe('MedicoComponent', () => {
  let component: MedicoComponent;
  let fixture: ComponentFixture<MedicoComponent>;
  let httpTesting: HttpTestingController;
  const medico = {
    id: 1,
    nombre_completo: 'Ana Médica',
    especialidad_id: 2,
    especialidad_nombre: 'Cardiología',
    licencia: 'LIC-123',
    telefono: '8888-1234',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicoComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne((request) => request.url.endsWith('/api/medicos/filter/0/5'))
      .flush({ data: [medico], pagination: { offset: 0, limit: 5, total: 1 } });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the doctors returned by the API', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Ana Médica');
    expect(rows[0].textContent).toContain('Cardiología');
    expect(rows[0].textContent).toContain('LIC-123');
  });
});
