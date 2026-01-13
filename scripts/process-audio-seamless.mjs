/**
 * 🎵 音频无缝循环处理脚本
 * 
 * 为音频文件添加首尾淡入淡出，使其能够无缝循环播放
 * 
 * 使用方法：
 *   node scripts/process-audio-seamless.mjs
 * 
 * Jobs 会说：
 * "音频循环应该像呼吸一样自然。用户不应该感知到循环的存在。"
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import decode from 'audio-decode';
import toWav from 'audiobuffer-to-wav';

// 配置
const FADE_DURATION_MS = 150; // 淡入淡出时长（毫秒）
const INPUT_DIR = 'public/audio';
const OUTPUT_DIR = 'public/audio/seamless';

/**
 * 对音频数据应用淡入淡出
 */
function applyFades(audioBuffer, fadeDurationMs) {
    const sampleRate = audioBuffer.sampleRate;
    const fadeSamples = Math.floor((fadeDurationMs / 1000) * sampleRate);

    // 获取所有声道的数据
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i).slice());
    }

    const length = channels[0].length;

    // 应用淡入淡出到每个声道
    for (const channelData of channels) {
        // 淡入（开头）
        for (let i = 0; i < fadeSamples && i < length; i++) {
            const fadeMultiplier = i / fadeSamples;
            // 使用余弦曲线使淡入更自然
            const cosineMultiplier = (1 - Math.cos(fadeMultiplier * Math.PI)) / 2;
            channelData[i] *= cosineMultiplier;
        }

        // 淡出（结尾）
        for (let i = 0; i < fadeSamples && i < length; i++) {
            const sampleIndex = length - 1 - i;
            const fadeMultiplier = i / fadeSamples;
            // 使用余弦曲线使淡出更自然
            const cosineMultiplier = (1 - Math.cos(fadeMultiplier * Math.PI)) / 2;
            channelData[sampleIndex] *= cosineMultiplier;
        }
    }

    // 创建新的 AudioBuffer
    const processedBuffer = {
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: length,
        duration: audioBuffer.duration,
        getChannelData: (channel) => channels[channel],
    };

    return processedBuffer;
}

/**
 * 处理单个音频文件
 */
async function processAudioFile(inputPath, outputPath) {
    try {
        console.log(`  处理: ${basename(inputPath)}`);

        // 读取并解码音频
        const buffer = readFileSync(inputPath);
        const audioBuffer = await decode(buffer);

        console.log(`    采样率: ${audioBuffer.sampleRate}Hz`);
        console.log(`    声道数: ${audioBuffer.numberOfChannels}`);
        console.log(`    时长: ${audioBuffer.duration.toFixed(2)}s`);

        // 应用淡入淡出
        const processedBuffer = applyFades(audioBuffer, FADE_DURATION_MS);

        // 转换为 WAV 并保存
        const wavData = toWav(processedBuffer);
        const wavOutputPath = outputPath.replace(/\.[^.]+$/, '.wav');
        writeFileSync(wavOutputPath, Buffer.from(wavData));

        console.log(`    ✅ 已保存: ${basename(wavOutputPath)}`);

        return true;
    } catch (error) {
        console.error(`    ❌ 处理失败: ${error.message}`);
        return false;
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🎵 音频无缝循环处理');
    console.log('='.repeat(50));
    console.log(`淡入淡出时长: ${FADE_DURATION_MS}ms`);
    console.log(`输入目录: ${INPUT_DIR}`);
    console.log(`输出目录: ${OUTPUT_DIR}`);
    console.log('');

    // 确保输出目录存在
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 获取所有音频文件
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
    const files = readdirSync(INPUT_DIR).filter(file => {
        const ext = extname(file).toLowerCase();
        return audioExtensions.includes(ext) && file !== 'intro-ambient.mp3';
    });

    if (files.length === 0) {
        console.log('未找到需要处理的音频文件');
        return;
    }

    console.log(`找到 ${files.length} 个音频文件`);
    console.log('');

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const inputPath = join(INPUT_DIR, file);
        const outputPath = join(OUTPUT_DIR, file);

        const success = await processAudioFile(inputPath, outputPath);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount} 个文件`);
    if (failCount > 0) {
        console.log(`❌ 失败: ${failCount} 个文件`);
    }
    console.log('');
    console.log('💡 提示: 处理后的文件保存为 WAV 格式');
    console.log('   建议使用在线工具或其他软件转换回 MP3 以减小文件大小');
}

main().catch(console.error);
