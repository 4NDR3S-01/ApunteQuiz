type Strength = {
  score: number; // 0..4
  label: string;
  color: string;
  percent: number; // 0..100
  suggestions: string[];
};

const commonPasswords = new Set([
  '123456', '123456789', 'password', '12345678', 'qwerty', 'abc123', 'football', '1234567', 'letmein', 'iloveyou', 'admin', 'welcome'
]);

function hasSequentialChars(p: string) {
  const s = p.toLowerCase();
  for (let i = 0; i < s.length - 2; i++) {
    const a = s.codePointAt(i) || 0;
    const b = s.codePointAt(i + 1) || 0;
    const c = s.codePointAt(i + 2) || 0;
    if (b === a + 1 && c === b + 1) return true;
  }
  return false;
}

function hasRepeatedChars(p: string) {
  return /(.)\1\1/.test(p);
}

export function evaluatePassword(pwd: string = ''): Strength {
  const pwdStr = pwd;
  const suggestions: string[] = [];

  if (!pwdStr) {
    suggestions.push('Usa al menos 8 caracteres');
    return { score: 0, label: 'Muy débil', color: 'bg-red-500', percent: 0, suggestions };
  }

  if (commonPasswords.has(pwdStr.toLowerCase())) {
    suggestions.push('Evita contraseñas comunes');
    return { score: 0, label: 'Muy débil', color: 'bg-red-500', percent: 0, suggestions };
  }

  let score = 0;

  // length scoring
  if (pwdStr.length >= 16) score += 3;
  else if (pwdStr.length >= 12) score += 2;
  else if (pwdStr.length >= 8) score += 1;

  // variety
  const hasLower = /[a-z]/.test(pwdStr);
  const hasUpper = /[A-Z]/.test(pwdStr);
  const hasDigit = /\d/.test(pwdStr);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwdStr);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  score += Math.max(0, varietyCount - 1); // reward variety beyond 1 class

  // penalties
  if (hasSequentialChars(pwdStr)) score = Math.max(0, score - 1);
  if (hasRepeatedChars(pwdStr)) score = Math.max(0, score - 1);

  // normalize to 0..4
  const normalized = Math.min(4, Math.max(0, score));

  // build suggestions
  if (pwdStr.length < 12) suggestions.push('Considera usar 12+ caracteres para mayor seguridad');
  if (!hasUpper) suggestions.push('Añade mayúsculas (A, B, C...)');
  if (!hasLower) suggestions.push('Añade minúsculas (a, b, c...)');
  if (!hasDigit) suggestions.push('Incluye números (0-9)');
  if (!hasSymbol) suggestions.push('Incluye símbolos (por ejemplo: !@#$%)');
  if (hasRepeatedChars(pwdStr)) suggestions.push('Evita repetir el mismo carácter muchas veces');
  if (hasSequentialChars(pwdStr)) suggestions.push('Evita secuencias como "123" o "abc"');

  const mapping = [
    { label: 'Muy débil', color: 'bg-red-500' },
    { label: 'Débil', color: 'bg-amber-500' },
    { label: 'Aceptable', color: 'bg-yellow-400' },
    { label: 'Fuerte', color: 'bg-emerald-500' },
    { label: 'Excelente', color: 'bg-teal-500' },
  ];

  const percent = Math.round((normalized / 4) * 100);

  return {
    score: normalized,
    label: mapping[normalized].label,
    color: mapping[normalized].color,
    percent,
    suggestions,
  };
}

export default evaluatePassword;
