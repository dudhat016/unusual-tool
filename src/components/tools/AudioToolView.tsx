import React, { useState } from 'react';
import { ToolDefinition } from '../../types';
import { UploadZone } from '../common/UploadZone';
import { AudioEngine, AudioInspectionResult } from '../../engine/audio/AudioEngine';
import { Music, Download, RefreshCw, Volume2, ShieldCheck, Sliders, CheckCircle, Play, Pause } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AudioToolViewProps {
  tool: ToolDefinition;
}

export const AudioToolView: React.FC<AudioToolViewProps> = ({ tool }) => {
  const { showToast } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [inspection, setInspection] = useState<AudioInspectionResult | null>(null);

  // Conversion options
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'm4a' | 'ogg'>('mp3');
  const [bitrateKbps, setBitrateKbps] = useState<128 | 192 | 256 | 320>(192);
  const [channelsMode, setChannelsMode] = useState<1 | 2>(2);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Result state
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('converted.mp3');
  const [resultStats, setResultStats] = useState<{
    originalSize: number;
    outputSize: number;
    duration: number;
  } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);

  const handleFilesDrop = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const mediaFile = newFiles[0];
    setFiles([mediaFile]);
    setResultBlob(null);
    setResultUrl(null);
    setResultStats(null);

    try {
      const inspect = await AudioEngine.inspectFile(mediaFile);
      setInspection(inspect);
    } catch {
      setInspection(null);
    }
  };

  const handleExecuteConvert = async () => {
    if (files.length === 0) {
      showToast('Please upload a video or audio file to convert', 'error');
      return;
    }

    const primaryFile = files[0];
    setIsProcessing(true);
    setProgress(5);
    setStatusText('Extracting audio streams...');

    try {
      const res = await AudioEngine.convertToMp3(
        primaryFile,
        {
          format: targetFormat,
          bitrateKbps,
          channels: channelsMode,
        },
        (p) => {
          setProgress(p);
          if (p < 40) setStatusText('Decoding media stream...');
          else if (p < 80) setStatusText(`Encoding to ${targetFormat.toUpperCase()} (${bitrateKbps}kbps)...`);
          else setStatusText('Finalizing audio stream...');
        }
      );

      const url = URL.createObjectURL(res.blob);
      setResultBlob(res.blob);
      setResultUrl(url);
      setResultFileName(res.fileName);
      setResultStats({
        originalSize: primaryFile.size,
        outputSize: res.outputSize,
        duration: res.duration,
      });

      showToast(`Successfully converted to ${res.fileName}`, 'success');
    } catch (err: any) {
      console.error('Audio conversion error:', err);
      showToast(err.message || 'Audio conversion failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAudioPlay = () => {
    if (!resultUrl) return;
    if (!audioElem) {
      const audio = new Audio(resultUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElem(audio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElem.pause();
        setIsPlaying(false);
      } else {
        audioElem.play();
        setIsPlaying(true);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = Math.floor(sec % 60);
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800">
          <Music className="w-3.5 h-3.5" />
          <span>100% In-Browser Audio Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
          {tool.shortDescription || 'Convert MP4, WebM, MOV, and audio files to MP3 or WAV directly in your browser.'}
        </p>
      </div>

      {/* Main Upload & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Zone & Results */}
        <div className="lg:col-span-7 space-y-6">
          {files.length === 0 ? (
            <UploadZone
              onFilesSelected={(items) => handleFilesDrop(items.map((i) => i.file))}
              accept="video/*,audio/*,.mp4,.mov,.avi,.webm,.mkv,.mp3,.wav,.m4a,.aac,.flac,.ogg"
              maxFiles={1}
            />
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                      <Music className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                        {files[0].name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {formatBytes(files[0].size)} • {inspection ? `${formatSeconds(inspection.durationSeconds)} duration` : 'Ready'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setResultBlob(null);
                    }}
                    className="text-xs text-rose-500 hover:underline font-semibold"
                  >
                    Change File
                  </button>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{statusText}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Conversion Output Result Card */}
              {resultBlob && resultStats && (
                <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-base">
                      <CheckCircle className="w-5 h-5" />
                      <span>Conversion Complete!</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      {formatBytes(resultStats.outputSize)}
                    </span>
                  </div>

                  {/* Audio Player Preview */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900">
                    <button
                      onClick={toggleAudioPlay}
                      className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md shrink-0"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {resultFileName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatSeconds(resultStats.duration)} • {targetFormat.toUpperCase()} @ {bitrateKbps}kbps
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <a
                    href={resultUrl!}
                    download={resultFileName}
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {resultFileName}</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-600" />
            <span>Audio Conversion Settings</span>
          </h3>

          {/* Target Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Output Audio Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['mp3', 'wav', 'm4a', 'ogg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                    targetFormat === fmt
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Bitrate */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Audio Quality / Bitrate
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: 128, label: '128 kbps (Standard)' },
                { val: 192, label: '192 kbps (High Quality)' },
                { val: 256, label: '256 kbps (Very High)' },
                { val: 320, label: '320 kbps (Maximum)' },
              ] as const).map((b) => (
                <button
                  key={b.val}
                  onClick={() => setBitrateKbps(b.val)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-left ${
                    bitrateKbps === b.val
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Channels Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setChannelsMode(2)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  channelsMode === 2
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Stereo (2 Channels)
              </button>
              <button
                onClick={() => setChannelsMode(1)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  channelsMode === 1
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Mono (1 Channel)
              </button>
            </div>
          </div>

          {/* Execute Convert Button */}
          <button
            disabled={files.length === 0 || isProcessing}
            onClick={handleExecuteConvert}
            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              files.length === 0 || isProcessing
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Converting Audio...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Convert to {targetFormat.toUpperCase()}</span>
              </>
            )}
          </button>

          {/* Privacy Guarantee */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% In-Browser Privacy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your video and audio files are processed entirely in your web browser memory. No media files are ever uploaded to external servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
