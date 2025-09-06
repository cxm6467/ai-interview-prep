/**
 * Commitlint Configuration
 * 
 * Ensures consistent commit message formatting using conventional commits.
 * 
 * @see https://commitlint.js.org/
 * @see https://www.conventionalcommits.org/
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the following
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that do not affect the meaning of the code
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvements
        'test',     // Adding missing tests or correcting existing tests
        'build',    // Changes that affect the build system or external dependencies
        'ci',       // Changes to CI configuration files and scripts
        'chore',    // Other changes that don't modify src or test files
        'revert'    // Reverts a previous commit
      ]
    ],
    // Subject case can be any case (allow flexibility for AI-generated commits)
    'subject-case': [0],
    // Allow longer subject lines for detailed commit messages
    'subject-max-length': [2, 'always', 100],
    // Body line length limit
    'body-max-line-length': [2, 'always', 100],
    // Footer line length limit  
    'footer-max-line-length': [2, 'always', 100],
    // Allow empty scope
    'scope-empty': [0],
    // Header max length
    'header-max-length': [2, 'always', 100]
  }
};