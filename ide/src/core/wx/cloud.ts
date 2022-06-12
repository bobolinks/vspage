wx.cloud = {
  init() {
    return Promise.resolve();
  },
  async downloadFile({ fileID }: RQ<ICloud.DownloadFileParam>): Promise<ICloud.DownloadFileResult> {
    return {
      tempFilePath: fileID.replace(/^cloud:\/\//, 'http://cloud/'),
      statusCode: 200,
      errMsg: 'ok',
    };
  },
} as any;
