App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true
      });
    }
    wx.removeStorageSync("profileDraft");
    wx.removeStorageSync("wechatUserInfo");
    wx.removeStorageSync("wechatLoginRecord");
    wx.removeStorageSync("customerPreviewMode");
    // Migrate the former test switch without carrying a test account into real requests.
    if (wx.getStorageSync("testCustomerPreviewActive")) {
      const backup = wx.getStorageSync("testCustomerPreviewBackup") || {};
      if (backup.userInfo) wx.setStorageSync("userInfo", backup.userInfo);
      else { wx.removeStorageSync("userInfo"); wx.removeStorageSync("zionJwt"); }
      ["testCustomerPreviewActive", "testCustomerPreviewBackup", "consultationSessionId", "consultationOrderId", "customerServiceBinding", "paidUntil"].forEach((key) => wx.removeStorageSync(key));
    }
  },

  globalData: {}
});
