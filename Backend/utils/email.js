/** Pragmatic format: local@domain.tld (requires @ and at least one dot in the domain). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const s = value.trim().toLowerCase();
    return s.length > 0 && EMAIL_RE.test(s);
}

module.exports = { EMAIL_RE, isValidEmail };
