const ipv4 = require('./ipv4-codec.js')
const ipv6 = require('./ipv6-codec.js')

function sizeOf (ip) {
  if (ipv4.isFormat(ip)) return ipv4.size
  if (ipv6.isFormat(ip)) return ipv6.size
  throw Error(`Invalid ip address: ${ip}`)
}

module.exports = Object.freeze({
  name: 'ip',
  sizeOf,
  familyOf: string => sizeOf(string) === ipv4.size ? 1 : 2,
  v4: ipv4,
  v6: ipv6,
  encode (ip, buff, offset) {
    offset = ~~offset
    const size = sizeOf(ip)
    if (typeof buff === 'function') {
      buff = buff(offset + size)
    }
    if (size === ipv4.size) {
      return ipv4.encode(ip, buff, offset)
    }
    return ipv6.encode(ip, buff, offset)
  },
  decode (buff, offset, length) {
    offset = ~~offset
    length = length || (buff.length - offset)
    if (length === ipv4.size) {
      return ipv4.decode(buff, offset, length)
    }
    if (length === ipv6.size) {
      return ipv6.decode(buff, offset, length)
    }
    throw Error(`Invalid buffer size needs to be ${ipv4.size} for IPv4 or ${ipv6.size} for IPv6.`)
  }
})
