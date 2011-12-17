var redirectOfficial;
redirectOfficial = function() {
  var _ref;
  if ((typeof navigator !== "undefined" && navigator !== null ? navigator.onLine : void 0) && ((_ref = window.location) != null ? _ref.host : void 0) !== 'jaliborc.com') {
    return print('');
  }
};
window.onload = function() {
  redirectOfficial();
  window.addEventListener('online', redirectOfficial);
  globals(['FormulaSection', 'Formula', 'Overlay', 'Error', 'OperatorList', 'KeyList', 'AnswerSection', 'AnswerTable', 'NewVersion']);
  initFormula();
  return fillKeys();
};