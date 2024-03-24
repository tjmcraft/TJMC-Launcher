import { PathLike } from "original-fs";

interface HostConfig {
  java: {
    path: PathLike;
    memory: {
      max: Number;
      min: Number;
    };
    detached: Boolean;
    cwd: PathLike;
    args: String;
  };
  launcher: {
    checkUpdates: boolean;
    checkUpdatesInterval: number; // every 24 hours
    disableHardwareAcceleration: boolean;
    hideOnClose: boolean;
    openDevTools: boolean;
  };
  overrides: {
    path: {
      minecraft: PathLike;
      versions: PathLike;
      gameDirectory: PathLike;
    };
    checkHash: boolean;
    checkFiles: boolean;
  };
  minecraft: {
    launch: {
      fullscreen: boolean;
      width: number;
      height: number;
    };
    autoConnect: boolean;
    hideOnLaunch: boolean;
  };
}

interface HostInstallation {
  created: Date;
  icon?: string;
  type: 'custom';
  gameDir?: PathLike;
  versionDir?: PathLike;
  mcPath?: PathLike;
  javaPath?: PathLike;
  javaArgs?: string;
  lastUsed?: Date;
  lastSync?: Date;
  lastVersionId: string;
  name: string;
  resolution?: {
      width?: number;
      height?: number;
      fullscreen?: boolean;
  };
  checkHash?: boolean;
  checkFiles?: boolean;
  autoConnect?: boolean;
}

type HostInstallationWithHash = HostInstallation & { hash: string, isProcessing?: boolean };
type VersionType = 'release' | 'modified' | 'snapshot' | 'pending' | 'old_beta' | 'old_alpha';
type VersionTypes = Array<{ name: string; type: VersionType; }>;

interface Version {
  id: string;
  releaseTime: string;
  time: string;
  type: VersionType;
  url?: string;
}