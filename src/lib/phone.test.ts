import { describe, expect, it } from 'vitest'
import { toE164 } from './phone'

describe('toE164', () => {
  it('accepts a valid Canadian number with no formatting', () => {
    expect(toE164('4165550132', 'CA')).toBe('+14165550132')
  })

  it('accepts common human formatting (dashes)', () => {
    expect(toE164('514-555-0199', 'CA')).toBe('+15145550199')
  })

  it('accepts common human formatting (parens + spaces), US', () => {
    expect(toE164('(212) 555-0147', 'US')).toBe('+12125550147')
  })

  it('accepts a valid French number with or without the leading 0', () => {
    expect(toE164('0612345678', 'FR')).toBe('+33612345678')
    expect(toE164('612345678', 'FR')).toBe('+33612345678')
  })

  it('rejects a too-short number', () => {
    expect(toE164('123', 'CA')).toBeNull()
  })

  it('rejects non-numeric input', () => {
    expect(toE164('abc', 'CA')).toBeNull()
  })

  it('rejects an empty string', () => {
    expect(toE164('', 'CA')).toBeNull()
  })

  it('rejects a number with the right length but no real area code', () => {
    // 000 is not an assigned NANP area code.
    expect(toE164('0005550199', 'CA')).toBeNull()
  })
})
