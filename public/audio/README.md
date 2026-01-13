# Intro 环境音效

将你选择的环境音效文件放在这个目录下。

## 使用方法

1. 下载你喜欢的音频文件（MP3 或 OGG 格式）
2. 重命名为 `intro-ambient.mp3`
3. 放在这个目录 (`public/audio/`)
4. 刷新页面即可听到效果

## 推荐音频来源 (免费 & 可商用)

### Pixabay (推荐)
- 溪流 + 鸟叫: https://pixabay.com/sound-effects/search/stream%20birds/
- 空灵鼓: https://pixabay.com/sound-effects/search/tongue%20drum/
- 手碟: https://pixabay.com/sound-effects/search/handpan/

### Mixkit
- 自然音效: https://mixkit.co/free-sound-effects/nature/

### Uppbeat
- 冥想音乐: https://uppbeat.io/browse/sfx/meditation

## 音频要求

- 格式: MP3 (推荐) 或 OGG
- 时长: 30秒以上（会自动循环）
- 文件大小: 建议 < 2MB
- 音质: 128kbps 以上即可

## 当前配置

在 `src/components/IntroSequence.tsx` 中可以调整：

```typescript
const { play, fadeOut } = useAmbientSound({
    src: '/audio/intro-ambient.mp3',  // 音频文件路径
    volume: 0.25,           // 音量 (0-1)
    fadeInDuration: 2000,   // 淡入时长 (ms)
    fadeOutDuration: 1000,  // 淡出时长 (ms)
    loop: true,             // 是否循环
});
```
