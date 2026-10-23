import type { Meta, StoryObj } from '@storybook/react'
import { tokenSolidColors } from '../../assets/tokens/tokenSolidColors'
import { CwGlsl } from './CwGlsl'

const meta: Meta<typeof CwGlsl> = {
  title: '1. Components/Visualization/CwGlsl',
  component: CwGlsl,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'CwGlsl组件用于显示和渲染GLSL着色器代码，支持实时预览、参数调节和动画播放。',
      },
    },
  },
  argTypes: {
    code: {
      control: { type: 'text' },
      description: 'GLSL片段着色器代码',
    },
    width: {
      control: { type: 'number', min: 100, max: 1024, step: 1 },
      description: '画布宽度',
    },
    height: {
      control: { type: 'number', min: 100, max: 1024, step: 1 },
      description: '画布高度',
    },
    autoPlay: {
      control: { type: 'boolean' },
      description: '是否自动播放动画',
    },
    showControls: {
      control: { type: 'boolean' },
      description: '是否显示控制面板',
    },
    showErrors: {
      control: { type: 'boolean' },
      description: '是否显示错误信息',
    },
    backgroundColor: {
      control: { type: 'color' },
      description: '背景色',
    },
  },
}

export default meta
type Story = StoryObj<typeof CwGlsl>

// 简单的渐变效果
export const SimpleGradient: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(st.x, st.y, abs(sin(u_time)));
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 400,
    height: 400,
    autoPlay: true,
    showControls: true,
    showErrors: true,
    backgroundColor: tokenSolidColors.black,
  },
}

// 动态圆形
export const AnimatedCircle: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = vec2(0.5);
  float dist = distance(st, center);
  float radius = 0.3 + 0.1 * sin(u_time * 2.0);
  
  vec3 color = vec3(0.0);
  if (dist < radius) {
    color = vec3(1.0, 0.5, 0.2);
  }
  
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 300,
    height: 300,
    autoPlay: true,
    showControls: true,
  },
}

// 带自定义uniform的着色器
export const WithUniforms: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform vec3 u_color;
uniform int u_pattern;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  float pattern;
  if (u_pattern == 1) {
    pattern = sin(st.x * 10.0 + u_time * u_speed);
  } else if (u_pattern == 2) {
    pattern = sin(st.y * 10.0 + u_time * u_speed);
  } else {
    pattern = sin((st.x + st.y) * 10.0 + u_time * u_speed);
  }
  
  vec3 color = u_color * (pattern * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 400,
    height: 400,
    autoPlay: true,
    showControls: true,
    uniforms: {
      u_speed: 2.0,
      u_color: tokenSolidColors.fabricShapeFillWarm,
      u_pattern: 1,
    },
  },
}

// 静态图案
export const StaticPattern: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  
  // 创建棋盘图案
  vec2 grid = floor(st * 8.0);
  float checker = mod(grid.x + grid.y, 2.0);
  
  vec3 color = vec3(checker);
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 300,
    height: 300,
    autoPlay: false,
    showControls: false,
  },
}

// 错误示例
export const WithError: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  // 故意的语法错误
  vec3 color = vec3(st.x, st.y, invalid_function());
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 300,
    height: 300,
    autoPlay: false,
    showControls: false,
    showErrors: true,
  },
}

// 复杂动画
export const ComplexAnimation: Story = {
  args: {
    code: `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
  vec2 uv0 = uv;
  vec3 finalColor = vec3(0.0);
  
  for (float i = 0.0; i < 4.0; i++) {
    uv = fract(uv * 1.5) - 0.5;
    
    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);
    
    d = sin(d * 8.0 + u_time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2);
    
    finalColor += col * d;
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}`,
    width: 500,
    height: 500,
    autoPlay: true,
    showControls: true,
    backgroundColor: tokenSolidColors.black,
  },
}

// 百万粒子效果
export const MillionParticles: Story = {
  args: {
    code: `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

// 伪随机函数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 噪声函数
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0);
  
  // 创建数百万个粒子效果
  float scale = 200.0; // 控制粒子密度
  vec2 grid = st * scale;
  vec2 ipos = floor(grid);
  vec2 fpos = fract(grid);
  
  // 为每个网格单元创建粒子
  for(int x = -1; x <= 1; x++) {
    for(int y = -1; y <= 1; y++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random(ipos + neighbor) * vec2(1.0);
      
      // 添加时间动画
      point.x += sin(u_time * 2.0 + random(ipos + neighbor) * 6.28) * 0.3;
      point.y += cos(u_time * 1.5 + random(ipos + neighbor) * 6.28) * 0.3;
      
      vec2 diff = neighbor + point - fpos;
      float dist = length(diff);
      
      // 创建粒子光晕效果
      float particle = 1.0 - smoothstep(0.0, 0.05, dist);
      
      // 根据位置和时间变化颜色
      vec3 particleColor = vec3(
        0.5 + 0.5 * sin(u_time + random(ipos + neighbor) * 6.28),
        0.5 + 0.5 * sin(u_time * 1.3 + random(ipos + neighbor) * 6.28 + 2.0),
        0.5 + 0.5 * sin(u_time * 0.8 + random(ipos + neighbor) * 6.28 + 4.0)
      );
      
      color += particle * particleColor * 0.8;
    }
  }
  
  // 添加背景星空效果
  float stars = noise(st * 100.0 + u_time * 0.1);
  stars = smoothstep(0.95, 1.0, stars);
  color += vec3(stars * 0.3);
  
  // 添加整体色调调整
  color = pow(color, vec3(0.8)); // gamma校正
  
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 800,
    height: 600,
    autoPlay: true,
    showControls: true,
    backgroundColor: tokenSolidColors.black,
  },
}

// 星系模拟
export const GalaxySimulation: Story = {
  args: {
    code: `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = vec2(0.5);
  vec2 pos = st - center;
  
  vec3 color = vec3(0.0);
  
  // 创建螺旋星系效果
  float numArms = 4.0;
  float armWidth = 0.3;
  
  for(float i = 0.0; i < 1000.0; i++) {
    // 生成粒子位置
    float angle = random(vec2(i, 0.0)) * 6.28318;
    float radius = pow(random(vec2(i, 1.0)), 0.5) * 0.4;
    
    // 螺旋臂效果
    float armAngle = angle + radius * 8.0 + u_time * 0.5;
    float armOffset = sin(armAngle * numArms) * armWidth;
    
    vec2 particlePos = vec2(
      cos(angle) * (radius + armOffset * radius),
      sin(angle) * (radius + armOffset * radius)
    );
    
    // 添加轨道运动
    particlePos = rotate(particlePos, u_time * 0.2 + radius * 2.0);
    
    float dist = length(pos - particlePos);
    
    // 粒子大小基于距离中心的远近
    float size = 0.002 + radius * 0.001;
    float particle = 1.0 - smoothstep(0.0, size, dist);
    
    // 颜色基于半径和角度
    vec3 particleColor = vec3(
      0.8 + 0.2 * sin(radius * 10.0 + u_time),
      0.4 + 0.4 * cos(angle + u_time * 0.3),
      0.6 + 0.4 * sin(radius * 15.0 - u_time * 0.5)
    );
    
    // 亮度基于到中心的距离
    float brightness = 1.0 - radius * 1.5;
    brightness = max(0.0, brightness);
    
    color += particle * particleColor * brightness * 0.3;
  }
  
  // 添加中心黑洞效果
  float centerDist = length(pos);
  float blackHole = 1.0 - smoothstep(0.0, 0.05, centerDist);
  color *= (1.0 - blackHole * 0.9);
  
  // 添加发光效果
  color += vec3(0.1, 0.05, 0.2) * (1.0 - centerDist * 2.0);
  
  gl_FragColor = vec4(color, 1.0);
}`,
    width: 800,
    height: 800,
    autoPlay: true,
    showControls: true,
    backgroundColor: tokenSolidColors.black,
  },
}

