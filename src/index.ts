import * as Konva from 'konva'
import { filter, bufferCount, scan } from 'rxjs/operators'
import { from, Observable } from 'rxjs'
import './index.css'
const keycode = require('keycode')

export type Sample = {
  timestamp: number
  data: number[]
}

interface SamplesPerElectrode extends Array<number[]> {}

export interface Samples extends Array<Sample> {}

interface Props {
  ctx: CanvasRenderingContext2D
  stream: Observable<Sample>
}

export class NeuroChart {
  samples: Samples
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  origampl: number
  ampl: number
  sampleWidth: number = 1000
  down: number

  constructor(props: Props) {
    // super();
    this.ctx = props.ctx
    this.init(props.stream)
    window.addEventListener(
      'keydown',
      (e) => {
        if (keycode(e) == 'down') {
          this.ampl *= 0.8
        } else if (keycode(e) == 'up') {
          this.ampl *= 1.2
        }
      },
      true,
    )

    window.addEventListener(
      'mousedown',
      (e) => {
        this.down = e.screenY
        window.addEventListener('mousemove', move, true)
        window.addEventListener('mouseup', (e) => {
          this.origampl = this.ampl
          window.removeEventListener('mousemove', move, true)
        })
      },
      true,
    )
    const move = (e) => {
      // console.log(e.screenY - this.down)
      this.ampl = (this.origampl + (e.screenY - this.down)) * 0.1
      console.log('this.ampl: ', this.ampl)
    }
  }

  init(stream) {
    var width = (this.width = this.ctx.canvas.offsetWidth)
    var height = (this.height = this.ctx.canvas.offsetHeight)

    this.ctx.strokeStyle = 'white'
    this.ctx.lineWidth = 2

    this.origampl = 200
    this.ampl = 200

    stream
      .pipe(
        scan((acc, val: Array<number>) => {
          acc.push(...val)
          return acc.slice(-this.sampleWidth)
        }, []),
      )
      .subscribe((samples: Samples) => {
        this.draw(samples)
      })
  }

  draw = (samples: Samples) => {
    const { ctx } = this
    const startLocation: number = this.width - (samples.length / this.sampleWidth) * this.width
    ctx.beginPath()

    const numElectrodes = samples[0].data.length
    const heightEach = this.height / numElectrodes

    const samplesPerElectrode: SamplesPerElectrode = samples.reduce((acc, cur) => {
      cur.data.forEach((a, i) => {
        if (!acc[i]) {
          acc[i] = []
        }
        acc[i].push(a)
      })
      return acc
    }, [])

    samplesPerElectrode.forEach((electrodeSamples, i) => {
      const average = electrodeSamples.reduce((acc, cur) => acc + cur) / electrodeSamples.length
      const baseHeight = i * heightEach + heightEach / 2
      ctx.moveTo(startLocation, baseHeight)
      electrodeSamples.forEach((value, i2) => {
        const width = startLocation + (i2 / this.sampleWidth) * this.width
        ctx.lineTo(width, baseHeight - ((value - average / 2) / this.ampl) * (i + 1) * (heightEach / 2))
      })
    })

    this.clear()
    ctx.stroke()
  }

  clear = () => {
    this.ctx.clearRect(0, 0, this.width, this.ctx.canvas.height)
  }

  addDataPoint = (dp) => {
    const { viewPort } = this.props
    this.ctx.beginPath()
    if (this.lastPoint) {
      this.ctx.moveTo(...this.lastPoint)
    }
    this.ctx.lineTo(
      ((dp.timestamp - viewPort.start) / this.totalTime) * this.width,
      this.height / 2 - (dp.value / this.ampl) * (this.height / 2),
    )

    this.lastPoint = [
      ((dp.timestamp - viewPort.start) / this.totalTime) * this.width,
      this.height / 2 - (dp.value / this.ampl) * (this.height / 2),
    ]

    this.ctx.stroke()

    this.layer.batchDraw()
  }

  drawAll = () => {
    const { viewPort } = this.props
    if (typeof this.props.data == 'undefined') {
      return
    }
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.beginPath()

    from(this.props.data)
      .pipe(
        filter((d) => d.electrode == this.props.electrode),
        filter((d) => d.timestamp > viewPort.start && d.timestamp < viewPort.end),
      )
      .subscribe((dataFromStream) => {
        dataFromStream.samples.forEach((sample, ii) => {
          if (ii % 12) {
            const timestamp = dataFromStream.timestamp + (READING_DELTA / 12) * ii
            this.ctx.lineTo(
              ((timestamp - viewPort.start) / this.totalTime) * this.width,
              this.height / 2 - (sample / this.ampl) * (this.height / 2),
            )
          }
        })
      })

    this.ctx.stroke()

    this.layer.batchDraw()
  }

  xToProgress = (x) => {
    return x / this.width
  }
}
