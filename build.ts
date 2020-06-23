import { fusebox } from 'fuse-box'

const fuse = fusebox({
  entry: 'src/host.ts',
  target: 'browser',
  webIndex: {
    template: 'src/index.html',
  },
})

fuse.runProd()
