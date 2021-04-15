module.exports = {
  catalogs: [
    {
      path: '<rootDir>/src/locale/{locale}/messages',
      include: ['<rootDir>/src'],
    },
  ],
  sourceLocale: 'en',
  locales: ['en', 'zh-Hans'],
  format: 'po',
  orderBy: 'origin',
}
