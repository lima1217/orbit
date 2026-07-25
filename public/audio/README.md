# 环境音效

主界面混音音源目录。运行时路径由 `src/constants/ambientSounds.ts` 决定；本目录只保留被引用的文件。

## 当前在用文件

| 文件 | 用途 |
|------|------|
| `intro-ambient.mp3` | 静心（默认混音） |
| `singing-bowl-raw.mp3` | 颂钵 |
| `mokugyo.mp3` | 木鱼 |
| `spring-mountain.mp3` | 春山 |
| `wind-chime.mp3` | 风铃 |
| `cat-full.mp3` | 猫咪 |
| `umbrella-full.mp3` | 雨伞 |
| `summer-night.mp3` | 夏夜 |
| `water-drop.mp3` | 水滴 |
| `rainfall.mp3` | 落雨 |
| `ocean-coast.mp3` | 海岸 |
| `bonfire.mp3` | 篝火 |

## 音频要求

- 格式：MP3
- 码率：128kbps（环境循环够用；短促敲击类可保留原样）
- 时长：循环段建议 30 秒以上；离散敲击可更短
- 播放：`src/utils/globalAudio.ts` 负责循环与混音音量

## 压缩已有文件

```bash
cd public/audio
ffmpeg -y -i INPUT.mp3 -codec:a libmp3lame -b:a 128k -ar 44100 -ac 2 INPUT.tmp.mp3
mv INPUT.tmp.mp3 INPUT.mp3
```

## 无缝循环处理（可选）

需要首尾淡入淡出时，用仓库根目录脚本产出到临时目录，再按需覆盖本目录对应文件：

```bash
node scripts/process-audio-seamless.mjs
```

勿把未引用的源文件或中间产物留在本目录——它们会进入 Cloudflare Pages 部署包。
