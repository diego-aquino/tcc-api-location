const lintIgnoredFiles = ['.lintstagedrc.js', '.*', '*.json'];

module.exports = {
  '*': ['pnpm style:format'],
  [`!(${lintIgnoredFiles.join('|')})`]: ['pnpm lint'],
};
