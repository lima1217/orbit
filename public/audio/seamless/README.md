# 无缝循环音频文件

这个目录包含经过处理的音频文件，已添加首尾淡入淡出效果，适合无缝循环播放。

## 处理内容

- 淡入时长：150ms（余弦曲线）
- 淡出时长：150ms（余弦曲线）
- 格式：WAV（未压缩）

## 使用方法

### 方案 1：直接使用 WAV（推荐开发阶段）

WAV 文件可以直接在浏览器中播放，文件稍大但循环效果最好。

### 方案 2：转换为 MP3（推荐生产环境）

使用在线工具将 WAV 转为 MP3 以减小文件大小：

1. 访问 [Online Audio Converter](https://online-audio-converter.com/)
2. 上传 WAV 文件
3. 选择 MP3 格式，128kbps 即可
4. 下载并替换原文件

### 方案 3：安装 ffmpeg（推荐批量处理）

```bash
# 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 ffmpeg
brew install ffmpeg

# 批量转换
for f in *.wav; do
  ffmpeg -i "$f" -codec:a libmp3lame -qscale:a 4 "${f%.wav}.mp3"
done
```

## 文件列表

| 文件 | 大小 | 时长 |
|------|------|------|
| cat.wav | 1.5 MB | 8.00s |
| forest.wav | 1.4 MB | 8.00s |
| insects.wav | 768 KB | 8.00s |
| mokugyo.wav | 535 KB | 2.79s |
| ocean.wav | 856 KB | 4.85s |
| rain.wav | 1.3 MB | 7.50s |
| singing-bowl.wav | 768 KB | 8.00s |
| stream.wav | 1.4 MB | 8.00s |
| umbrella.wav | 1.4 MB | 8.00s |

## 技术原理

使用余弦曲线（cosine curve）进行淡入淡出，比线性淡入淡出更自然：

```javascript
// 余弦曲线公式
const cosineMultiplier = (1 - Math.cos(progress * Math.PI)) / 2;
```

这让声音的变化更接近人耳的感知曲线，过渡更加平滑。
