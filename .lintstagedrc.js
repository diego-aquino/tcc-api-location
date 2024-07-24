const lintIgnoredFiles = ['.lintstagedrc.js', '.*', '*.json', 'api/**/*.js'];

module.exports = {
  '*': ['pnpm style:format'],
  [`!(${lintIgnoredFiles.join('|')})`]: ['pnpm lint'],
};
