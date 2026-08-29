import React from 'react';
import {
  Scaling,
  Minimize2,
  Crop,
  RefreshCw,
  Wand2,
  Square,
  Stamp,
  UserSquare2,
  Share2,
  Info,
  Pipette,
  Layers,
  Sparkles,
  Sparkle,
  Maximize,
  FileText,
  Eraser,
  Focus,
  Grid,
  Zap,
  Image as ImageIcon,
  Check,
  Video,
  Download,
  Clock,
  Code,
  Eye,
  AtSign,
  Hash,
  Play,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, ...props }) => {
  const iconMap: Record<string, React.FC<LucideProps>> = {
    Scaling,
    Minimize2,
    Crop,
    RefreshCw,
    Wand2,
    Square,
    Stamp,
    UserSquare2,
    Share2,
    Info,
    Pipette,
    Layers,
    Sparkles,
    Sparkle,
    Maximize,
    FileText,
    Eraser,
    Focus,
    Grid,
    Zap,
    ImageIcon,
    Check,
    Video,
    Download,
    Clock,
    Code,
    Eye,
    AtSign,
    Hash,
    Play,
    Youtube: Video,
  };

  const Component = iconMap[name] || ImageIcon;
  return <Component className={className} {...props} />;
};

