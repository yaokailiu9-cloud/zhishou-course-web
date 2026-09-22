function context(classId,target) {
  if (wx.getReferralContext) return wx.getReferralContext(classId,target);
  return require('./consultationService').call('REFERRAL_OVERVIEW');
}
module.exports = {context};
