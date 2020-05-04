import React from 'react';
import StaticServer from 'react-native-static-server';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';

// Typescript does not see declaration file for Uri
import type { default as UriType } from 'epubjs/types/utils/url';

const Uri: typeof UriType = require('epubjs/lib/utils/url');

interface StreamerOptions {
  port: string;
  rootFolder: string;
}

if (!(global as any).Blob) {
  (global as any).Blob = RNFetchBlob.polyfill.Blob;
}

const DIRS = RNFetchBlob.fs.dirs;

export class Streamer {
  _locals: Array<string>;
  _paths: Array<string>;
  _port: string;
  _root: string;
  _started: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  // _server: StaticServer;
  _server: React.RefObject<StaticServer>;
  _serverOrigin: React.RefObject<string>;
  _urls: Array<string>;
  constructor() {
    this._locals = [];
    this._paths = [];
    this._port = `${3000 + Math.round(Math.random() * 1000)}`;
    this._root = 'ebooks';
    this._started = false;
    this._server = React.createRef();
    this._serverOrigin = React.createRef();
    this._urls = [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    //@ts-ignore
    this._serverOrigin.current = 'file://';

    this.add.bind(this);
    this.check.bind(this);
    this.clean.bind(this);
    this.get.bind(this);
    this.filename.bind(this);
    this.kill.bind(this);
    this.remove.bind(this);
    this.setOptions.bind(this);
    this.setup.bind(this);
    this.start.bind(this);
    this.stop.bind(this);
  }
  setOptions(options?: StreamerOptions) {
    if (options?.port) {
      this._port = options.port;
    }
    if (options?.rootFolder) {
      this._root = options.rootFolder;
    }
  }
  async setup() {
    try {
      const folderExists = await RNFetchBlob.fs.exists(
        `${DIRS.DocumentDir}/${this._root}`,
      );
      if (!folderExists) {
        await RNFetchBlob.fs.mkdir(`${DIRS.DocumentDir}/${this._root}`);
      }
      const server = new StaticServer(this._port, this._root, {
        localOnly: true,
      });
      console.log('Server:', server);
      return server;
    } catch (err) {
      console.log('STREAMER.setup', err);
      return Promise.reject(err);
    }
  }
  async start() {
    this._started = true;
    try {
      const server = await this.setup();
      console.log('Start server', server);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this._server.current = server;
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      console.log('Server assigned', this._server.current);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const serverOrigin = await this._server.current.start();
      console.log('Server origin:', serverOrigin);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      //@ts-ignore
      this._serverOrigin.current = serverOrigin;
      return serverOrigin;
    } catch (err) {
      console.log('STREAMER.start', err);
      return Promise.reject(err);
    }
  }
  stop() {
    this._started = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this._server.current?.stop();
  }
  kill() {
    this._started = false;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this._server.current?.kill();
  }
  async add(bookUrl: string) {
    try {
      const filename = this.filename(bookUrl);
      console.log('add - filename:', filename);
      const res = await RNFetchBlob.config({
        fileCache: true,
        path: DIRS.DocumentDir + '/' + filename,
      }).fetch('GET', bookUrl);
      console.log(res, 123);
      const sourcePath = res.path();
      console.log(456);
      const targetPath = `${DIRS.DocumentDir}/${this._root}/${filename}`;
      const url = `${this._serverOrigin.current}/${filename}/`;
      console.log(this._serverOrigin.current, 789);
      const path = await unzip(sourcePath, targetPath);
      console.log(path, 987);
      this._locals.push(url);
      this._paths.push(path);
      this._urls.push(bookUrl);
      return url;
    } catch (err) {
      console.log('STREAMER.add', err);
      return Promise.reject(err);
    }
  }
  check(bookUrl: string) {
    const filename = this.filename(bookUrl);
    const targetPath = `${DIRS.DocumentDir}/${this._root}/${filename}`;
    return RNFetchBlob.fs.exists(targetPath);
  }
  clean() {
    this._paths.forEach((path) => {
      this.remove(path);
    });
  }
  filename(bookUrl: string) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const uri = new Uri(bookUrl);
    let finalFileName;
    if (uri.filename.indexOf('?') > -1) {
      finalFileName = uri.filename.split('?')[0].replace('.epub', '');
    } else {
      finalFileName = uri.filename.replace('.epub', '');
    }
    return finalFileName;
  }
  async get(bookUrl: string) {
    try {
      const exists = await this.check(bookUrl);
      if (exists) {
        const filename = this.filename(bookUrl);
        const url = `${this._serverOrigin.current}/${filename}/`;
        return url;
      }
      return this.add(bookUrl);
    } catch (err) {
      console.log('STREAMER.get', err);
      return Promise.reject(err);
    }
  }
  async remove(path: string) {
    try {
      const stats = await RNFetchBlob.fs.lstat(path);
      if (!stats.length) {
        return;
      }
      const index = this._paths.indexOf(path);
      this._paths.splice(index, 1);
      this._urls.splice(index, 1);
      this._locals.splice(index, 1);
    } catch (err) {
      console.log('STREAMER.remove', err);
      return Promise.reject(err);
    }
  }
}

const StreamerInstance = new Streamer();

Object.freeze(StreamerInstance);

export default StreamerInstance;
