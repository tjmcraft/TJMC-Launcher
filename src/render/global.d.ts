type PathLike = string | Buffer | URL;

// Types define
type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;
type AnyFunction = (...args: any[]) => any;
type AnyToVoidFunction = (...args: any[]) => void;
type NoneToVoidFunction = () => void;

// Modules import
declare module "*.module.css";
declare module "*.png";
declare module "*.jpeg";
declare module "*.svg";
// Webpack Define
declare const APP_NAME: string;
declare const APP_ENV: "development" | "production";
declare const APP_VERSION: string;
declare const APP_COPYRIGHT: string;
declare const AUTHOR: string;
declare const HTML_TIMESTAMP: string;

interface TJMCSystem {
  os: "linux" | "osx" | "windows" | "web";
}

interface TJMCNative {
  window: {
    close: Function;
    maximize: Function;
    minimize: Function;
    fullscreen: Function;
  };
  versions: Object;
}

interface ElectronExpose {
  on: Function;
  off: Function;
  invoke: Function;
  send: Function;
}

interface Window {
  GLOBAL_ENV: any;
  buildInfo: any;
  __debug__: boolean;
  __debug_host__: boolean;
  __debug_api__: boolean;
  __STANDALONE__: boolean;
  system: TJMCSystem;
  tjmcNative: TJMCNative;
  electron: ElectronExpose;
  resetCache: Function;
  _gstore: Object;
}

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