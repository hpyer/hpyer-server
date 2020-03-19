
let Utils = {};

Utils.mergeConfig = (cfg1, cfg2) => {
  let cfg = {};
  for (let k in cfg1) {
    cfg[k] = cfg2[k] || cfg1[k];
  }
  for (let k in cfg2) {
    if (typeof cfg1[k] == 'undefined') cfg[k] = cfg2[k];
  }
  return cfg;
}

Utils.isMatch = (reg, str) => {
  return ('' + str).match(reg);
}

Utils.isObject = data => {
  return Object.prototype.toString.call(data) == '[object Object]';
}

Utils.isArray = data => {
  return Object.prototype.toString.call(data) == '[object Array]';
}

Utils.isNumber = data => {
  return Object.prototype.toString.call(data) == '[object Number]';
}

Utils.isString = data => {
  return data && toString.call(data) == '[object String]';
}

Utils.isNumberString = data => {
  return Utils.isString(data) && Utils.isMatch(/^(-?\d+)(\.\d+)?$/i, data);
}

Utils.escape = function (str) {
  if (typeof str == 'object') {
    let arr = []
    for (let i in str) {
      arr[i] = Utils.escape(str[i]);
    }
    return arr;
  }
  else if (typeof str == 'string') {
    return `'${str.replace(/(\'|\")/i, '\\$1')}'`;
  }
  else {
    return str + '';
  }
}

Utils.parseWhereValue = function (k, v) {
  if (Utils.isArray(v[1])) {
    // array eg. ['in', ['value1', 'value2', 'value3']]
    if (v[0].toLowerCase() == 'between') {
      return `\`${k}\` BETWEEN ${Utils.escape(v[1][0])} AND ${Utils.escape(v[1][1])}`;
    }
    else if (v[0].toLowerCase() == 'like') {
      let a = [];
      for (let i=0; i<v[1].length; i++) {
        a.push(`\`${k}\` LIKE ${Utils.escape(v[1][i])}`);
      }
      return a.join(' OR ');
    }
    else {
      return `\`${k}\` ${v[0]} (${Utils.escape(v[1]).join(',')})`;
    }
  }
  else if (v[0] == 'exp') {
    // array eg. ['exp', sql]
    return `\`${k}\` ${v[1]}`;
  }
  else {
    // array eg. ['=', 'value'] or ['like', 'value%']
    return `\`${k}\` ${v[0]} (${Utils.escape(v[1])})`;
  }
}

Utils.parseWhereItem = function (k, v) {
  k = k.replace(/\./, '`.`');
  if (Utils.isArray(v) && v.length == 2) {
    return ' AND ' + Utils.parseWhereValue(k, v);
  }
  else if (Utils.isArray(v) && v.length == 3) {
    // array eg. ['name', 'a', false] or ['name', ['in', ['a', 'b']], 'or']
    let is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
    return (is_and ? ' AND ' : ' OR ') + Utils.parseWhereValue(k, v);
  }
  else {
    return ` AND \`${k}\`=${Utils.escape(v)}`;
  }
}

Utils.parseWhere = function (where) {
  if (!where) return '';

  let whereStrings = [];
  if (Utils.isObject(where)) {
    for (let k in where) {
      let v = where[k];
      if (k.indexOf('|')) {
        // eg. {'name|account': 'test'}
        let is_and = true;
        if (Utils.isArray(v) && v.length == 3) {
          is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
        }
        let ks = k.split('|');
        let items = [];
        for (let j=0; j<ks.length; j++) {
          if (!ks[j]) continue;
          items.push(Utils.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
        }
        whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' OR ') + ')');
      }
      else if (k.indexOf('&')) {
        // eg. {'name&account': 'test'}
        if (Utils.isArray(v) && v.length == 3) {
          is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
        }
        let ks = k.split('&');
        let items = [];
        for (let j=0; j<ks.length; j++) {
          if (!ks[j]) continue;
          items.push(Utils.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
        }
        whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' AND ') + ')');
      }
      else {
        whereStrings.push(Utils.parseWhereItem(k, v));
      }
    }
  }
  else if (Utils.isArray(where)) {
    // array eg. ['`name`=\'a\'', ['`name`=\'b\'', false], ['`status`=1', 'and']]
    for (let i=0; i<where.length; i++) {
      let v = where[i];
      if (Utils.isArray(v) && v.length == 2) {
        // array eg. ['`name`=\'b\'', false], ['`status`=1', 'and']
        let is_and = !(v[1] === false || v[1] == 'OR' || v[1] == 'or');
        whereStrings.push((is_and ? ' AND ' : ' OR ') + v[0]);
      }
      else {
        whereStrings.push(` AND ${v}`);
      }
    }
  }
  else {
    // string
    return ' WHERE ' + where;
  }
  if (whereStrings.length > 0) {
    return ' WHERE ' + whereStrings.join('').replace(/^\s(AND|OR)\s/gi, '');
  }
  return '';
}

module.exports = Utils;
