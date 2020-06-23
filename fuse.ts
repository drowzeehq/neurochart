import { fusebox } from 'fuse-box'

const fuse = fusebox({
  entry: 'src/host.ts',
  sourceMap: { project: true, vendor: true },
  target: 'browser',
  devServer: true,
  webIndex: {
    template: 'src/index.html',
  },
})

fuse.runDev()
