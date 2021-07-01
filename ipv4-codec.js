const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/
const size = 4

module.exports = {
  name: 'ipv4',
  size,
  isFormat: ip => ipv4Regex.test(ip),
  encode (ip, buff, offset) {
    offset = ~~offset
    const result = buff || new Uint8Array(offset + size)
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
