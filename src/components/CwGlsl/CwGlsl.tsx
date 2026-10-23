import { useEffect, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import type {
  CwGlslEmits,
  CwGlslProps,
  CwGlslUniformControl,
} from './types'

export interface CwGlslComponentProps
  extends CwGlslProps,
    CwGlslEmits,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onError'> {
  className?: string
}

// 默认顶点着色器
const defaultVertexShader = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`

const emptyUniforms: Record<string, unknown> = {}

// 颜色转换工具函数
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 }
}

// 解析GLSL代码中的uniform声明，生成控制器
function parseUniformControls(
  code: string,
  uniforms: Record<string, unknown>,
  overrides: Record<string, number | string>,
): Record<string, CwGlslUniformControl> {
  const controls: Record<string, CwGlslUniformControl> = {}

  const uniformRegex = /uniform\s+(\w+)\s+(\w+);/g
  let match: RegExpExecArray | null

  while ((match = uniformRegex.exec(code)) !== null) {
    const type = match[1]
    const name = match[2]

    if (name === 'u_time' || name === 'u_resolution') continue

    const provided = overrides[name] !== undefined ? overrides[name] : uniforms[name]

    if (type === 'float') {
      controls[name] = {
        type: 'float',
        value: typeof provided === 'number' ? provided : 0.5,
        min: 0,
        max: 1,
        step: 0.01
      }
    } else if (type === 'int') {
      controls[name] = {
        type: 'int',
        value: typeof provided === 'number' ? provided : 1,
        min: 0,
        max: 10
      }
    } else if (type === 'vec3') {
      controls[name] = {
        type: 'color',
        value: typeof provided === 'string' ? provided : tokenSolidColors.errorColor6
      }
    }
  }

  return controls
}

export function CwGlsl(props: CwGlslComponentProps) {
  const {
    code,
    width = 512,
    height = 512,
    autoPlay = true,
    showControls = false,
    uniforms = emptyUniforms,
    vertexShader,
    showErrors = true,
    backgroundColor = tokenSolidColors.grayColor15,
    onCompiled,
    onError,
    onUniformUpdate,
    onPlayStateChange,
    className,
    style,
    ...rest
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const startTimeRef = useRef(Date.now())
  const isPlayingRef = useRef(autoPlay)
  const renderRef = useRef<() => void>(() => {})

  const onCompiledRef = useRef(onCompiled)
  onCompiledRef.current = onCompiled
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const onUniformUpdateRef = useRef(onUniformUpdate)
  onUniformUpdateRef.current = onUniformUpdate
  const onPlayStateChangeRef = useRef(onPlayStateChange)
  onPlayStateChangeRef.current = onPlayStateChange

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [errorMessage, setErrorMessage] = useState('')
  const [uniformOverrides, setUniformOverrides] = useState<Record<string, number | string>>({})

  const uniformControls = useMemo(
    () => parseUniformControls(code, uniforms, uniformOverrides),
    [code, uniforms, uniformOverrides],
  )
  const uniformControlsRef = useRef(uniformControls)
  uniformControlsRef.current = uniformControls

  const emitError = (message: string) => {
    setErrorMessage(message)
    onErrorRef.current?.(message)
  }

  // 创建着色器
  const createShader = (type: number, source: string) => {
    const gl = glRef.current
    if (!gl) return null

    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(error || '着色器编译失败')
    }

    return shader
  }

  // 创建程序
  const createProgram = () => {
    const gl = glRef.current
    if (!gl) return

    try {
      const vertexShaderObject = createShader(
        gl.VERTEX_SHADER,
        vertexShader || defaultVertexShader
      )
      const fragmentShaderObject = createShader(gl.FRAGMENT_SHADER, code)

      if (!vertexShaderObject || !fragmentShaderObject) return

      const program = gl.createProgram()
      programRef.current = program
      if (!program) return

      gl.attachShader(program, vertexShaderObject)
      gl.attachShader(program, fragmentShaderObject)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program)
        throw new Error(error || '程序链接失败')
      }

      gl.useProgram(program)

      // 设置顶点数据
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      )

      const positionLocation = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      setErrorMessage('')
      onCompiledRef.current?.()
    } catch (error) {
      emitError(error instanceof Error ? error.message : '未知错误')
    }
  }

  // 更新uniform变量
  const applyUniform = (name: string, value: unknown) => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program) return

    const location = gl.getUniformLocation(program, name)
    if (!location) return

    const control = uniformControlsRef.current[name]
    if (!control) return

    if (control.type === 'float') {
      gl.uniform1f(location, typeof value === 'number' ? value : Number(value))
    } else if (control.type === 'int') {
      gl.uniform1i(location, typeof value === 'number' ? value : Number(value))
    } else if (control.type === 'color') {
      // 将颜色值转换为RGB
      const text = String(value)
      const hex = text.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      gl.uniform3f(location, r, g, b)
    }

    if (typeof value === 'number' || typeof value === 'string') {
      onUniformUpdateRef.current?.(name, value)
    }
  }

  // 渲染循环
  renderRef.current = () => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program || !isPlayingRef.current) return

    // 设置视口
    gl.viewport(0, 0, width, height)

    // 清除画布
    const bgColor = hexToRgb(backgroundColor)
    gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // 更新时间uniform
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    if (timeLocation) {
      const currentTime = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLocation, currentTime)
    }

    // 更新分辨率uniform
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, width, height)
    }

    // 绘制
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    animationIdRef.current = requestAnimationFrame(() => renderRef.current())
  }

  // 切换播放状态
  const togglePlay = () => {
    const next = !isPlayingRef.current
    isPlayingRef.current = next
    setIsPlaying(next)
    onPlayStateChangeRef.current?.(next)

    if (next) {
      startTimeRef.current = Date.now()
      renderRef.current()
    } else if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
  }

  const handleUniformChange = (name: string, value: number | string) => {
    setUniformOverrides((prev) => ({ ...prev, [name]: value }))
    applyUniform(name, value)
  }

  // 初始化WebGL
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    glRef.current = canvas.getContext('webgl')
    if (!glRef.current) {
      emitError('WebGL不支持')
      return
    }

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current)
        animationIdRef.current = null
      }
    }
    // 仅初始化一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 监听代码变化：编译着色器
  useEffect(() => {
    createProgram()

    if (isPlayingRef.current && animationIdRef.current === null) {
      renderRef.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // 监听uniform变化
  useEffect(() => {
    const entries = Object.entries(uniforms)
    entries.forEach(([name, value]) => {
      applyUniform(name, value)
    })

    setUniformOverrides((prev) => {
      let next = prev
      entries.forEach(([name, value]) => {
        if ((typeof value === 'number' || typeof value === 'string') && prev[name] !== value) {
          if (next === prev) next = { ...prev }
          next[name] = value
        }
      })
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniforms])

  return (
    <div
      {...rest}
      className={['relative inline-block border border-[var(--border-color)] rounded overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ width: `${width}px`, height: `${height}px`, ...style }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block w-full h-full"
      />

      {/* 控制面板 */}
      {showControls ? (
        <div className="absolute top-2.5 right-2.5 bg-[var(--overlay-scrim-dim)] p-2.5 rounded text-[var(--text-color-anti)] text-xs">
          <div
            onClick={togglePlay}
            className={[
              'border-none px-2.5 py-1 rounded cursor-pointer mb-2.5 text-[var(--text-color-anti)] transition-colors duration-200',
              isPlaying
                ? 'bg-[var(--error-color-6)] hover:bg-[var(--error-color-hover)]'
                : 'bg-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
            ].filter(Boolean).join(' ')}
          >
            {isPlaying ? '暂停' : '播放'}
          </div>

          {/* Uniform控制器 */}
          {Object.keys(uniformControls).length > 0 ? (
            <div className="flex flex-col gap-2">
              {Object.entries(uniformControls).map(([name, control]) => (
                <div key={name} className="flex flex-col gap-1">
                  <div className="text-xs text-[var(--text-color-placeholder)]">{name}</div>
                  {control.type === 'float' ? (
                    <input
                      type="range"
                      min={control.min || 0}
                      max={control.max || 1}
                      step={control.step || 0.01}
                      value={typeof control.value === 'number' ? control.value : 0}
                      onChange={(event) => handleUniformChange(name, parseFloat(event.target.value))}
                      className="w-30"
                    />
                  ) : control.type === 'int' ? (
                    <input
                      type="range"
                      min={control.min || 0}
                      max={control.max || 10}
                      step={1}
                      value={typeof control.value === 'number' ? control.value : 0}
                      onChange={(event) => handleUniformChange(name, parseInt(event.target.value, 10))}
                      className="w-30"
                    />
                  ) : control.type === 'color' ? (
                    <input
                      type="color"
                      value={typeof control.value === 'string' ? control.value : ''}
                      onChange={(event) => handleUniformChange(name, event.target.value)}
                      className="w-10 h-5 border-none rounded-sm"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 错误信息 */}
      {showErrors && errorMessage ? (
        <div className="absolute bottom-0 left-0 right-0 bg-[var(--error-color-6)] opacity-90 text-[var(--text-color-anti)] p-2.5 font-mono text-xs max-h-36 overflow-y-auto">
          <pre className="m-0 whitespace-pre-wrap">{errorMessage}</pre>
        </div>
      ) : null}
    </div>
  )
}

export default CwGlsl
