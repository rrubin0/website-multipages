/**
 * check-lead-provider — warn when a Netlify-forms contact path ships on a
 * Cloudflare Pages build, where Netlify's form processing does not exist and
 * submissions would silently go nowhere.
 *
 * Behavior:
 * - CF_PAGES_BRANCH unset (local dev, Netlify builds): silent pass, exit 0.
 * - CF_PAGES_BRANCH set: scan src/ for <ContactForm> usages whose provider
 *   resolves to `netlify` (explicit or defaulted). Any hit prints a loud
 *   warning listing the files. Exit 0 always — this is advisory, not a gate.
 *   (Escalation path, if ever wanted: exit 1 here and the build chain fails.)
 *
 * Dynamic provider values (provider={someVar}) cannot be resolved statically
 * and are skipped with a note — the warning only fires on what it can prove.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function collectAstroFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      collectAstroFiles(full, out);
    } else if (entry.name.endsWith('.astro')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Resolve the provider for each <ContactForm ...> tag in a file.
 * Returns array of { provider: string | null } where null = dynamic/unknown
 * (treated as "cannot prove netlify" and skipped).
 */
function findProviders(source) {
  const results = [];
  const tagRe = /<ContactForm\b([^>]*)\/?>/g;
  let tagMatch;
  while ((tagMatch = tagRe.exec(source)) !== null) {
    const attrs = tagMatch[1];
    const strMatch = /provider\s*=\s*"([^"]*)"/.exec(attrs);
    if (strMatch) {
      results.push({ provider: strMatch[1] });
      continue;
    }
    const exprMatch = /provider\s*=\s*\{([^}]*)\}/.exec(attrs);
    if (exprMatch) {
      const expr = exprMatch[1].trim();
      const literal = /^['"]([^'"]*)['"]$/.exec(expr);
      results.push({ provider: literal ? literal[1] : null });
      continue;
    }
    results.push({ provider: 'netlify' }); // absent prop = default
  }
  return results;
}

function main() {
  const branch = process.env.CF_PAGES_BRANCH;
  if (!branch) return; // not a Cloudflare build — nothing to check

  const offenders = [];
  const unknown = [];
  for (const file of collectAstroFiles(SRC)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const { provider } of findProviders(source)) {
      if (provider === 'netlify') {
        offenders.push(path.relative(ROOT, file));
      } else if (provider === null) {
        unknown.push(path.relative(ROOT, file));
      }
    }
  }

  if (offenders.length === 0) return; // all usages are GHL-backed (or none exist)

  const line = '='.repeat(72);
  console.warn(`\n${line}`);
  console.warn('WARNING: Netlify contact form on a Cloudflare Pages build');
  console.warn(`${line}`);
  console.warn(
    `CF_PAGES_BRANCH=${branch} is set, but these files render <ContactForm>`,
  );
  console.warn('with the Netlify provider (explicit or default):');
  for (const file of offenders) console.warn(`  - ${file}`);
  console.warn('');
  console.warn(
    'Netlify form processing does not run on Cloudflare Pages: submissions',
  );
  console.warn(
    'would redirect to /thank-you without being captured anywhere.',
  );
  console.warn(
    'Fix: set provider="ghl-form" | "ghl-calendar" | "ghl-webhook" (with IDs in',
  );
  console.warn('src/lib/ghl.ts), or deploy this site to Netlify instead.');
  if (unknown.length > 0) {
    console.warn('');
    console.warn('Note: dynamic provider values were skipped (cannot verify):');
    for (const file of unknown) console.warn(`  - ${file}`);
  }
  console.warn(`${line}\n`);
}

main();
