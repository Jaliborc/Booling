var Char, Parser, parseSyntax, showFormula, toBolean;
Char = (function() {
  function Char(text) {
    this.text = text;
    this.type = this.getType();
    this[this.type] = true;
  }
  Char.prototype.getType = function() {
    var operator, _i, _len, _ref;
    if (this.text === ' ' || this.text === '') {
      return 'ignore';
    } else if (this.text === '(') {
      return 'open';
    } else if (this.text === ')') {
      return 'close';
    } else if (this.text === NOT) {
      return 'not';
    } else if ((65 <= (_ref = this.text.charCodeAt(0)) && _ref <= 122)) {
      return 'var';
    } else {
      for (_i = 0, _len = Keys.length; _i < _len; _i++) {
        operator = Keys[_i];
        if (this.text === operator[0]) {
          return 'oper';
        }
      }
    }
  };
  return Char;
})();
Parser = (function() {
  var errors;
  errors = {
    "var": {
      "var": 'DOUBLE VAR',
      close: 'MISSING OPER'
    },
    oper: {
      oper: 'DOUBLE OPER',
      open: 'MISSING VAR'
    },
    open: {
      "var": 'MISSING OPER',
      close: 'MISSING OPER'
    },
    close: {
      oper: 'MISSING VAR',
      open: 'EMPTY BRACKET'
    }
  };
  function Parser(formula) {
    this.formula = formula;
    if (this.error = this.parseFormula()) {
      return;
    }
    this.result = '';
    this.writeVars();
    this.connectChars();
    this.writeFormula();
  }
  Parser.prototype.parseFormula = function() {
    var brackets, char, error, i, last, size, _base, _name, _ref;
    size = this.formula.length;
    if (size === 0) {
      return 'EMPTY';
    } else if (size < 3) {
      return 'SHORT';
    }
    this.list = [];
    this.vars = {};
    last = false;
    brackets = 0;
    for (i = 0, _ref = size - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      char = new Char(this.formula.charAt(i));
      if (char.ignore) {
        continue;
      }
      this.i = i;
      if (error = errors[char.type][last != null ? last.type : void 0]) {
        return error;
      }
      if (char["var"]) {
        (_base = this.vars)[_name = char.text] || (_base[_name] = []);
        char.values = this.vars[char.text];
      } else if (char.open) {
        brackets++;
      } else if (char.close) {
        brackets--;
        last.text += ')';
        if (brackets < 0) {
          return 'NUM BRACKETS';
        }
      }
      if (last.open) {
        char.text = '(' + char.text;
      }
      this.list.push(char);
      last = char;
    }
    if (brackets !== 0) {
      return 'NUM BRACKETS';
    }
  };
  Parser.prototype.writeVars = function() {
    var id, numVars, v, vars, x, y, _ref, _ref2, _results;
    vars = (function() {
      var _results;
      _results = [];
      for (id in this.vars) {
        _results.push(id);
      }
      return _results;
    }).call(this);
    numVars = vars.length;
    this.lines = pow(2, numVars) - 1;
    _results = [];
    for (x = 0, _ref = numVars - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
      id = vars[x];
      this.result += '<li><h1>' + id + '</h1><ul>';
      for (y = 0, _ref2 = this.lines; 0 <= _ref2 ? y <= _ref2 : y >= _ref2; 0 <= _ref2 ? y++ : y--) {
        v = floor(y / pow(2, x)) % 2;
        this.result += '<li>' + toBolean(v) + '</li>';
        this.vars[id][y] = v;
      }
      _results.push(this.result += '</ul></li>');
    }
    return _results;
  };
  Parser.prototype.writeFormula = function() {
    var char, i, _ref, _results;
    _ref = this.list;
    _results = [];
    for (i in _ref) {
      char = _ref[i];
      _results.push(!(char.open || char.close || char.not) ? this.result += '<li><h1>' + char.text + '</h1></li>' : void 0);
    }
    return _results;
  };
  Parser.prototype.connectChars = function() {
    return 't';
  };
  return Parser;
})();
toBolean = function(n) {
  if (n === 0) {
    return T;
  } else {
    return F;
  }
};
parseSyntax = function() {
  var parser;
  parser = new Parser(Formula.value);
  if (parser.error) {
    return print(parser.error);
  } else {
    return switchFrames(FormulaSection, AnswerSection, TIME, function() {
      return AnswerArea.innerHTML = parser.result;
    });
  }
};
showFormula = function() {
  return switchFrames(AnswerSection, FormulaSection, TIME);
};