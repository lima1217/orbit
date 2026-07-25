# 无缝循环音频文件

这个目录包含经过处理的音频文件，已添加首尾淡入淡出效果，适合无缝循环播放。

## 处理内容

- 淡入时长：150ms（余弦曲线）
- 淡出时长：150ms（余弦曲线）
- 格式：MP3（生产体积）

## 重新生成

先用 `scripts/process-audio-seamless.mjs` 产出 WAV，再批量转 MP3：

```bash
for f in public/audio/seamless/*.wav; do
  ffmpeg -y -i "$f" -codec:a libmp3lame -qscale:a 4 "${f%.wav}.mp3"
done
rm public/audio/seamless/*.wav
```

## 文件列表

| 文件 | 约大小 |
|------|--------|
| cat.mp3 | 131 KB |
| forest.mp3 | 131 KB |
| insects.mp3 | 47 KB |
| mokugyo.mp3 | 19 KB |
| ocean.mp3 | 50 KB |
| rain.mp3 | 150 KB |
| singing-bowl.mp3 | 76 KB |
| stream.mp3 | 169 KB |
| umbrella.mp3 | 213 KB |
