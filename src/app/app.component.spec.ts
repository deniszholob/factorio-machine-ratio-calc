import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent = new AppComponent();

  beforeEach(() => {
    component = new AppComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
