const variant = process.env.APP_VARIANT === 'buildflow' ? 'buildflow' : 'conflow';
const isBuildFlow = variant === 'buildflow';

module.exports = {
  appId: isBuildFlow ? 'com.dimixkoj.buildflow1' : 'com.dimixkoj.conflow1',
  productName: isBuildFlow ? 'BuildFlow 1' : 'ConFlow 1',
  directories: { output: isBuildFlow ? 'release/buildflow' : 'release/conflow' },
  files: ['desktop/**/*', 'renderer/**/*', 'package.json'],
  win: { target: [{ target: 'nsis', arch: ['x64'] }] },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: isBuildFlow ? 'BuildFlow 1' : 'ConFlow 1'
  },
  extraMetadata: { main: 'desktop/main.cjs' }
};
