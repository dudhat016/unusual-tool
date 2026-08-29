import React, { useState, useEffect } from 'react';
import { Minimize2, Info, Check, Sparkles, Sliders, ChevronDown } from 'lucide-react';
import { formatFileSize } from '../../engine/imageEngine';
import { NumberInput } from '../ui/NumberInput';
import { Select, Slider } from '../ui';

export interface TargetSizeValue {
  value: number; // numeric value in selected unit
  unit: 'KB' | 'MB' | 'Bytes';
  targetBytes: number; // calculated total in bytes
  targetKb: number; // calculated total in KB
}

interface TargetSizeInputProps {
  targetKb: number;
  onChange: (targetKb: number, unit?: 'KB' | 'MB' | 'Bytes', value?: number) => void;
  originalSizeBytes?: number;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
  showSlider?: boolean;
  showComparison?: boolean;
  label?: string;
}

const PRESET_SIZES_KB = [20, 30, 50, 75, 100, 150, 200, 300, 500, 1000];

export const TargetSizeInput: React.FC<TargetSizeInputProps> = ({
  targetKb,
  onChange,
  originalSizeBytes,
  disabled = false,
  className = '',
  showPresets = true,
  showSlider = true,
  showComparison = true,
  label = 'Target File Size',
}) => {
  // Determine initial unit and numeric value based on targetKb
  const isInitialMb = targetKb >= 1000 && targetKb % 1000 === 0;
  const [unit, setUnit] = useState<'KB' | 'MB' | 'Bytes'>(isInitialMb ? 'MB' : 'KB');
  const [inputValue, setInputValue] = useState<number>(isInitialMb ? targetKb / 1000 : targetKb);

  // Sync internal state when external targetKb prop changes
  useEffect(() => {
    if (unit === 'MB') {
      setInputValue(targetKb / 1000);
    } else if (unit === 'Bytes') {
      setInputValue(Math.round(targetKb * 1024));
    } else {
      setInputValue(targetKb);
    }
  }, [targetKb, unit]);

  const calculateTargetKb = (val: number, currentUnit: 'KB' | 'MB' | 'Bytes'): number => {
    if (currentUnit === 'MB') return Math.max(0.01, val * 1000);
    if (currentUnit === 'Bytes') return Math.max(0.1, val / 1024);
    return Math.max(1, val);
  };

  const handleValueChange = (newVal: number) => {
    const sanitized = Math.max(1, newVal);
    setInputValue(sanitized);
    const kb = calculateTargetKb(sanitized, unit);
    onChange(kb, unit, sanitized);
  };

  const handleUnitChange = (newUnit: 'KB' | 'MB' | 'Bytes') => {
    setUnit(newUnit);
    let convertedValue = inputValue;
    if (unit === 'KB' && newUnit === 'MB') {
      convertedValue = Math.max(0.01, Number((targetKb / 1000).toFixed(2)));
    } else if (unit === 'MB' && newUnit === 'KB') {
      convertedValue = Math.round(targetKb);
    } else if (newUnit === 'Bytes') {
      convertedValue = Math.round(targetKb * 1024);
    } else if (unit === 'Bytes' && newUnit === 'KB') {
      convertedValue = Math.round(targetKb);
    }
    setInputValue(convertedValue);
    const kb = calculateTargetKb(convertedValue, newUnit);
    onChange(kb, newUnit, convertedValue);
  };

  const handlePresetSelect = (presetKb: number) => {
    if (presetKb >= 1000 && presetKb % 1000 === 0) {
      setUnit('MB');
      setInputValue(presetKb / 1000);
      onChange(presetKb, 'MB', presetKb / 1000);
    } else {
      setUnit('KB');
      setInputValue(presetKb);
      onChange(presetKb, 'KB', presetKb);
    }
  };

  // Reduction math
  const calculatedBytes = Math.round(targetKb * 1024);
  const reductionPercentage =
    originalSizeBytes && originalSizeBytes > 0
      ? Math.round(((originalSizeBytes - calculatedBytes) / originalSizeBytes) * 100)
      : null;

  return (
    <div
      id="target-size-input-container"
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/90 space-y-4 ${className}`}
    >
      {/* Header with Title and Mode Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Minimize2 className="h-4 w-4" />
          </div>
          <div>
            <label
              htmlFor="target-size-number-input"
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
            >
              {label}
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Precise byte-accurate compression boundary
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Exact {calculatedBytes.toLocaleString()} B
          </span>
        </div>
      </div>

      {/* Main Input Control Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 flex items-center">
          <span className="absolute left-3.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Size:
          </span>
          <NumberInput
            id="target-size-number-input"
            min={1}
            max={unit === 'MB' ? 100 : unit === 'Bytes' ? 104857600 : 100000}
            step={unit === 'MB' ? 0.1 : 1}
            value={inputValue}
            disabled={disabled}
            onChange={(v) => handleValueChange(v || 1)}
            placeholder="e.g. 100"
          />
        </div>

        {/* Unit Selector Dropdown */}
        <div className="shrink-0 w-full sm:w-36">
          <Select
            id="target-size-unit-select"
            value={unit}
            disabled={disabled}
            onChange={(e) => handleUnitChange(e.target.value as 'KB' | 'MB' | 'Bytes')}
            options={[
              { value: 'KB', label: 'KB (Kilobytes)' },
              { value: 'MB', label: 'MB (Megabytes)' },
              { value: 'Bytes', label: 'Bytes (Exact)' },
            ]}
          />
        </div>

        {/* Quick Stepper Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={disabled || inputValue <= 1}
            onClick={() => handleValueChange(Math.max(1, inputValue - (unit === 'MB' ? 0.5 : unit === 'Bytes' ? 1024 : 10)))}
            className="px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
            title="Decrease target size"
          >
            -{unit === 'MB' ? '0.5' : unit === 'Bytes' ? '1K' : '10'}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleValueChange(inputValue + (unit === 'MB' ? 0.5 : unit === 'Bytes' ? 1024 : 10))}
            className="px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
            title="Increase target size"
          >
            +{unit === 'MB' ? '0.5' : unit === 'Bytes' ? '1K' : '10'}
          </button>
        </div>
      </div>

      {/* Slider for smooth visual adjustment */}
      {showSlider && (
        <div className="space-y-1.5 pt-1">
          <Slider
            min={5}
            max={2000}
            step={5}
            value={Math.min(2000, Math.max(5, targetKb))}
            disabled={disabled}
            unit={targetKb >= 1000 ? ' MB' : ' KB'}
            showValueBadge={true}
            onChange={(v) => handlePresetSelect(v)}
          />
        </div>
      )}

      {/* Preset Chips */}
      {showPresets && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Popular Target Limits:</span>
            <span className="text-[10px] text-slate-400">One-click presets</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SIZES_KB.map((sizeKb) => {
              const isSelected = Math.round(targetKb) === sizeKb;
              const labelText = sizeKb >= 1000 ? `${sizeKb / 1000}MB` : `${sizeKb}KB`;
              return (
                <button
                  key={sizeKb}
                  type="button"
                  disabled={disabled}
                  onClick={() => handlePresetSelect(sizeKb)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 font-bold'
                      : 'border-slate-200/80 bg-white text-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison and Reduction Preview Bar */}
      {showComparison && originalSizeBytes && originalSizeBytes > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600 dark:text-slate-400">
              Original: <strong className="text-slate-900 dark:text-white">{formatFileSize(originalSizeBytes)}</strong>
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              Target: <strong className="text-primary">{formatFileSize(calculatedBytes)}</strong>
            </span>
          </div>

          {reductionPercentage !== null && (
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-500">Expected reduction:</span>
              <span
                className={`font-mono font-bold ${
                  reductionPercentage > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {reductionPercentage > 0 ? `-${reductionPercentage}% space saved` : 'Preserves source quality'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
