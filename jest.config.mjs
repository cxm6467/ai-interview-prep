/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: [
    '<rootDir>/src/utils/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/store/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/components/atoms/SkillBubble/*.{test,spec}.{ts,tsx}',
    '<rootDir>/src/main.test.tsx',
    '<rootDir>/src/hooks/useScrollFix.simple.test.{ts,tsx}',
    '<rootDir>/src/hooks/useScrollFix.comprehensive.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'src/utils/*.{ts,tsx}',
    'src/store/*.{ts,tsx}',
    'src/hooks/*.{ts,tsx}',
    'src/main.tsx',
    'src/components/atoms/SkillBubble/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/*.config.*',
    '!src/**/index.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/services/**',
    '!src/hooks/useTextToSpeech.ts',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@atoms/(.*)$': '<rootDir>/src/components/atoms/$1',
    '^@molecules/(.*)$': '<rootDir>/src/components/molecules/$1',
    '^@organisms/(.*)$': '<rootDir>/src/components/organisms/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@test/(.*)$': '<rootDir>/src/test/$1',
  },
  
  // Coverage and reporting configuration
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  collectCoverage: false, // Only collect when explicitly requested
};