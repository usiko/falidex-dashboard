import { httpInterceptor } from './http-interceptor.service';

describe('httpInterceptor', () => {
  it('est exporté comme intercepteur fonctionnel', () => {
    expect(typeof httpInterceptor).toBe('function');
  });
});
