function context(classId) {
  if (wx.getReferralContext) return wx.getReferralContext(classId);
  return require('./consultationService').call('REFERRAL_OVERVIEW');
}
module.exports = {context};
