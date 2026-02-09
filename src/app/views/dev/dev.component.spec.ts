import { DevComponent } from './dev.component';

describe('DevComponent', () => {
  let component: DevComponent;

  beforeEach(() => {
    component = new DevComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
