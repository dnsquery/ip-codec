const ipv4 = require('./ipv4-codec.js')
const ipv6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i
const size = 16

function hex (byte) {
  byte = byte.toString(16)
  if (byte.length === 1) {
    return '0' + byte
  }
  return byte
}

module.exports = {
  name: 'ipv6',
  size,
  isFormat: ip => ip.length > 0 && ipv6Regex.test(ip),
  encode (ip, buff, offset) {
    offset = ~~offset
    const sections = ip.split(':', 8)

    for (let i = 0; i < sections.length; i++) {
      if (ipv4.isFormat(sections[i])) {
        const v4Buffer = ipv4.encode(sections[i])
        sections[i] = hex(v4Buffer[0]) + hex(v4Buffer[1])
        if (++i < 8) {
          sections.splice(i, 0, hex(v4Buffer[2]) + hex(v4Buffer[3]))
        }
      }
    }

    if (sections[0] === '') {
      while (sections.length < 8) sections.unshift('0')
    } else if (sections[sections.length - 1] === '') {
      while (sections.length < 8) sections.push('0')
    } else if (sections.length < 8) {
      for (i = 0; i < sections.length && sections[i] !== ''; i++);
      const argv = [i, 1]
      for (i = 9 - sections.length; i > 0; i--) {
        argv.push('0')
      }
      sections.splice.apply(sections, argv)
    }

    const result = buff || new Uint8Array(offset + size)
    for (const section of sections) {
      const word = parseInt(section, 16)
      result[offset++] = (word >> 8) & 0xff
      result[offset++] = word & 0xff
    }
    return result
  },
  decode (buff, offset) {
    const result = []
    for (let i = 0; i < size; i += 2) {
      result.push((buff[offset + i] << 8 | buff[offset + i + 1]).toString(16))
    }
    return result.join(':')
      .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
      .replace(/:{3,4}/, '::')
  }
}
