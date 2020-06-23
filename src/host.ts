import { NeuroChart, Samples } from './index'
import { Notion } from '@drowzee/notion-mock'
import biog from '@drowzee/biog'
import { Subject } from 'rxjs'
import { Raw } from './example'
import { Notion } from '@drowzee/notion-mock'
import sample from './sample.json'
console.log('sample: ', sample)

var canvas = document.getElementById('myCanvas')
var ctx: CanvasRenderingContext2D = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const stream = new Subject()

window.onData = (epoch: Raw) => {
  const samples = biog.epochToSamples(epoch)
  stream.next(samples)
}

var flag = false
if (flag) {
  const notion = new Notion()
  notion.sourceData = sample
  notion.brainwaves('raw').subscribe((epoch: Raw) => {
    window.onData({
      ...epoch,
      info: {
        ...epoch.info,
        channelNames: ['as', 'as', 'as', 'as', 'as', 'as', 'as', 'as'],
      },
    })
  })
} else {
  // var ws = new WebSocket('ws://localhost:9941');
  // ws.onopen = () => {
  // 	// connection opened
  // 	ws.send('something'); // send a message
  // };
  // ws.onmessage = (e) => {
  // 	const receivedData = JSON.parse(e.data)
  // 	window.onData(receivedData)
  // };
}

var myNeuroChart = new NeuroChart({
  ctx,
  stream: stream,
})
