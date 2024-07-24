const lintIgnoredFiles = ['.lintstagedrc.js', '.*ignore', '*.json', 'api/**/*.js*'];

module.exports = {
  '*': ['pnpm style:format'],
  [`!(${lintIgnoredFiles.join('|')})`]: ['pnpm lint'],
};
