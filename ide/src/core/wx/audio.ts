class WxAudio extends Audio {
  constructor(src?: string) {
    super(src);
    this.onload = () => {
      const ev = new Event('canplay');
      this.dispatchEvent(ev);
    };
  }
  onPlay(cb: any) {
    this.addEventListener('play', cb);
  }
  onPause(cb: any) {
    this.addEventListener('pause', cb);
  }
  onEnded(cb: any) {
    this.addEventListener('ended', cb);
  }
  onCanplay(cb: any) {
    this.addEventListener('canplay', cb);
  }
}

wx.createInnerAudioContext = function () {
  return new WxAudio();
} as any;
