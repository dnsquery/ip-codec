const v4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/
const v4Size = 4
const v6Regex = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i
const v6Size = 16

const v4 = {
  name: 'v4',
  size: v4Size,
  isFormat: ip => v4Regex.test(ip),
  encode (ip, buff, offset) {
    offset = ~~offset
    const result = buff || new Uint8Array(offset + v4Size)
    ip.split(/\./g).forEach((byte, index) => {
      result[offset + index] = parseInt(byte, 10) & 0xff
    })
    return result
  },
  decode (buff, offset) {
    offset = ~~offset
    return [
      buff[offset],
      buff[offset + 1],
      buff[offset + 2],
      buff[offset + 3]
    ].join('.')
  }
}

function hex (byte) {
  byte = byte.toString(16)
  if (byte.length === 1) {
    return '0' + byte
  }
  return byte
}

const v6 = {
  name: 'v6',
  size: v6Size,
  isFormat: ip => ip.length > 0 && v6Regex.test(ip),
  encode (ip, buff, offset) {
    offset = ~~offset
    const sections = ip.split(':', 8)

    for (let i = 0; i < sections.length; i++) {
      if (v4.isFormat(sections[i])) {
        const v4Buffer = v4.encode(sections[i])
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
      let i = 0
      while (i < sections.length && sections[i] !== '') i++
      const argv = [i, 1]
      for (i = 9 - sections.length; i > 0; i--) {
        argv.push('0')
      }
      sections.splice.apply(sections, argv)
    }

    const result = buff || new Uint8Array(offset + v6Size)
    for (const section of sections) {
      const word = parseInt(section, 16)
      result[offset++] = (word >> 8) & 0xff
      result[offset++] = word & 0xff
    }
    return result
  },
  decode (buff, offset) {
    const result = []
    for (let i = 0; i < v6Size; i += 2) {
      result.push((buff[offset + i] << 8 | buff[offset + i + 1]).toString(16))
    }
    return result.join(':')
      .replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3')
      .replace(/:{3,4}/, '::')
  }
}

function sizeOf (ip) {
  if (v4.isFormat(ip)) return v4.size
  if (v6.isFormat(ip)) return v6.size
  throw Error(`Invalid ip address: ${ip}`)
}

module.exports = Object.freeze({
  name: 'ip',
  sizeOf,
  familyOf: string => sizeOf(string) === v4.size ? 1 : 2,
  v4,
  v6,
  encode (ip, buff, offset) {
    offset = ~~offset
    const size = sizeOf(ip)
    if (typeof buff === 'function') {
      buff = buff(offset + size)
    }
    if (size === v4.size) {
      return v4.encode(ip, buff, offset)
    }
    return v6.encode(ip, buff, offset)
  },
  decode (buff, offset, length) {
    offset = ~~offset
    length = length || (buff.length - offset)
    if (length === v4.size) {
      return v4.decode(buff, offset, length)
    }
    if (length === v6.size) {
      return v6.decode(buff, offset, length)
    }
    throw Error(`Invalid buffer size needs to be ${v4.size} for v4 or ${v6.size} for v6.`)
  }
})
