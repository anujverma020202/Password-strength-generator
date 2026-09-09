const controls = {
  password: document.getElementById('password'),
  length: document.getElementById('length'),
  lengthValue: document.getElementById('lengthValue'),
  meter: document.getElementById('meter'),
  strengthText: document.getElementById('strengthText'),
  entropy: document.getElementById('entropy'),
  toast: document.getElementById('toast')
};
const characterSets = {
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  numbers: '23456789',
  symbols: '!@#$%^&*()-_=+[]{}?'
};

function secureRandom(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

function generatePassword() {
  const selected = Object.keys(characterSets).filter((name) => document.getElementById(name).checked);
  if (!selected.length) {
    document.getElementById('lowercase').checked = true;
    selected.push('lowercase');
  }
  const pools = selected.map((name) => characterSets[name]);
  const allCharacters = pools.join('');
  const length = Number(controls.length.value);
  const passwordCharacters = pools.map((pool) => pool[secureRandom(pool.length)]);
  while (passwordCharacters.length < length) passwordCharacters.push(allCharacters[secureRandom(allCharacters.length)]);
  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandom(index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] = [passwordCharacters[swapIndex], passwordCharacters[index]];
  }
  controls.password.textContent = passwordCharacters.join('');
  controls.lengthValue.textContent = length;
  const entropy = Math.round(length * Math.log2(allCharacters.length));
  controls.entropy.textContent = `Estimated entropy: ${entropy} bits`;
  updateStrength(entropy);
}

function updateStrength(entropy) {
  const segments = [...controls.meter.children];
  const strength = entropy < 45 ? 'Weak' : entropy < 70 ? 'Fair' : entropy < 100 ? 'Strong' : 'Excellent';
  const activeCount = entropy < 45 ? 2 : entropy < 70 ? 3 : entropy < 100 ? 4 : 5;
  segments.forEach((segment, index) => {
    segment.className = index < activeCount ? 'active' : '';
    if (strength === 'Fair' && index < activeCount) segment.classList.add('orange');
    if (strength === 'Weak' && index < activeCount) segment.classList.add('red');
  });
  controls.strengthText.textContent = strength;
  controls.strengthText.style.color = strength === 'Weak' ? 'var(--red)' : strength === 'Fair' ? 'var(--orange)' : 'var(--teal)';
}

async function copyPassword() {
  await navigator.clipboard.writeText(controls.password.textContent);
  controls.toast.classList.add('show');
  window.setTimeout(() => controls.toast.classList.remove('show'), 1800);
}

document.getElementById('generateButton').addEventListener('click', generatePassword);
document.getElementById('copyButton').addEventListener('click', copyPassword);
controls.length.addEventListener('input', generatePassword);
Object.keys(characterSets).forEach((name) => document.getElementById(name).addEventListener('change', generatePassword));
generatePassword();
