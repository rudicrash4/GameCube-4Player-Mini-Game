// Evaluator Molang minimal untuk ekspresi di file animasi (mis. "math.sin(query.life_time*245)*0.15-0.15").
// Hanya fungsi/variabel yang benar-benar dibutuhkan; yang tidak dikenal akan melempar error
// (tidak ada nilai karangan).

const DEG = Math.PI / 180;

const FUNCTIONS = {
  'math.sin': (d) => Math.sin(d * DEG), // Molang memakai derajat
  'math.cos': (d) => Math.cos(d * DEG),
  'math.pow': Math.pow,
  'math.abs': Math.abs,
  'math.sqrt': Math.sqrt,
  'math.min': Math.min,
  'math.max': Math.max,
  'math.floor': Math.floor,
  'math.ceil': Math.ceil,
  'math.clamp': (v, a, b) => Math.min(Math.max(v, a), b),
  'math.lerp': (a, b, t) => a + (b - a) * t,
};

const VARIABLES = new Set(['life_time', 'anim_time', 'delta_time', 'is_sprinting']);

function tokenize(src) {
  const tokens = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([A-Za-z_][A-Za-z0-9_.]*)|([-+*/(),]))/y;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) {
      if (src.slice(pos).trim() === '') break;
      throw new Error(`Molang: karakter tidak dikenal di "${src}" posisi ${pos}`);
    }
    pos = re.lastIndex;
    if (m[1] !== undefined) tokens.push({ t: 'num', v: parseFloat(m[1]) });
    else if (m[2] !== undefined) tokens.push({ t: 'id', v: m[2].toLowerCase() });
    else tokens.push({ t: 'op', v: m[3] });
  }
  return tokens;
}

/** Kompilasi ekspresi menjadi fungsi (ctx) => number. ctx berisi life_time, anim_time, dst. */
export function compileMolang(source) {
  const src = String(source);
  const tokens = tokenize(src);
  let i = 0;

  const peek = () => tokens[i];
  const eat = (v) => {
    const tk = tokens[i];
    if (!tk || tk.v !== v) throw new Error(`Molang: diharapkan "${v}" di "${src}"`);
    i++;
  };

  function parseExpr() {
    let left = parseTerm();
    while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
      const op = tokens[i++].v;
      const l = left, r = parseTerm();
      left = op === '+' ? (c) => l(c) + r(c) : (c) => l(c) - r(c);
    }
    return left;
  }

  function parseTerm() {
    let left = parseUnary();
    while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
      const op = tokens[i++].v;
      const l = left, r = parseUnary();
      left = op === '*' ? (c) => l(c) * r(c) : (c) => l(c) / r(c);
    }
    return left;
  }

  function parseUnary() {
    const tk = peek();
    if (tk && tk.t === 'op' && (tk.v === '-' || tk.v === '+')) {
      i++;
      const inner = parseUnary();
      return tk.v === '-' ? (c) => -inner(c) : inner;
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tk = tokens[i++];
    if (!tk) throw new Error(`Molang: ekspresi tidak lengkap "${src}"`);
    if (tk.t === 'num') { const v = tk.v; return () => v; }
    if (tk.t === 'op' && tk.v === '(') {
      const e = parseExpr();
      eat(')');
      return e;
    }
    if (tk.t === 'id') {
      if (peek() && peek().v === '(') {
        const fn = FUNCTIONS[tk.v];
        if (!fn) throw new Error(`Molang: fungsi "${tk.v}" belum didukung ("${src}")`);
        i++; // (
        const args = [];
        if (!(peek() && peek().v === ')')) {
          args.push(parseExpr());
          while (peek() && peek().v === ',') { i++; args.push(parseExpr()); }
        }
        eat(')');
        if (args.length === 1) { const a = args[0]; return (c) => fn(a(c)); }
        if (args.length === 2) { const [a, b] = args; return (c) => fn(a(c), b(c)); }
        return (c) => fn(...args.map((a) => a(c)));
      }
      const name = tk.v.replace(/^(query|q)\./, '');
      if (tk.v !== name && VARIABLES.has(name)) return (c) => c[name] ?? 0;
      throw new Error(`Molang: variabel "${tk.v}" belum didukung ("${src}")`);
    }
    throw new Error(`Molang: token tidak terduga "${tk.v}" di "${src}"`);
  }

  const fn = parseExpr();
  if (i < tokens.length) throw new Error(`Molang: sisa token di "${src}"`);
  return fn;
}
