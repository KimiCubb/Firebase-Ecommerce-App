import type { Mock } from 'jest';

declare global {
  // allow assigning jest mocks to global.fetch in tests
  var fetch: Mock;
}

export {};