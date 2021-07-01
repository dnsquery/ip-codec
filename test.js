const test = require('fresh-tape')
const Buffer = require('buffer').Buffer
const { encode, decode, sizeOf, familyOf, v4, v6 } = require('.')

test('should convert to buffer IPv4 address', t => {
  const buf = encode('127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '7f000001')
  t.equal(decode(buf), '127.0.0.1')
  t.end()
})

test('should convert to buffer IPv4 address in-place', t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('127.0.0.1', buf, offset)
  t.equal(buf.toString('hex', offset, offset + 4), '7f000001')
  t.equal(decode(buf, offset, 4), '127.0.0.1')
  t.end()
})

test('should convert to buffer IPv6 address', t => {
  const buf = encode('::1')
  t.match(Buffer.from(buf).toString('hex'), /(00){15,15}01/)
  t.equal(decode(buf), '::1')
  t.equal(decode(encode('1::')), '1::')
  t.equal(decode(encode('abcd::dcba')), 'abcd::dcba')
  t.equal(decode(encode('::ffff:c0a8:100')), '::ffff:c0a8:100')
  t.equal(decode(encode('::ffff:ff00')), '::ffff:ff00')
  t.end()
})

test('should convert to buffer IPv6 address in-place', t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('::1', buf, offset)
  t.ok(/(00){15,15}01/.test(buf.toString('hex', offset, offset + 16)))
  t.equal(decode(buf, offset, 16), '::1')
  t.equal(decode(encode('1::', buf, offset),
    offset, 16), '1::')
  t.equal(decode(encode('abcd::dcba', buf, offset),
    offset, 16), 'abcd::dcba')
  t.end()
})

test('should convert to buffer IPv6 mapped IPv4 address', t => {
  let buf = encode('::ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')

  buf = encode('ffff::127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), 'ffff000000000000000000007f000001')
  t.equal(decode(buf), 'ffff::7f00:1')

  buf = encode('0:0:0:0:0:ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')
  t.end()
})

test('error decoding a buffer of unexpected length', t => {
  t.throws(() => decode(Buffer.alloc(0)))
  t.end()
})

test('should use on-demand allocation', t => {
  let buf = encode('127.0.0.1', Buffer.alloc)
  t.equal(buf.toString('hex'), '7f000001')
  buf = encode('127.0.0.1', size => Buffer.alloc(size + 2), 4)
  t.equal(buf.toString('hex'), '000000007f0000010000')
  t.end()
})

test('dedicated encoding v4/v6', t => {
  t.deepEqual(encode('127.0.0.1'), v4.encode('127.0.0.1'))
  t.deepEqual(encode('::'), v6.encode('::'))
  t.end()
})

test('sizeOf/familyOf test', t => {
  t.equal(sizeOf('127.0.0.1'), 4)
  t.equal(familyOf('127.0.0.1'), 1)
  t.equal(sizeOf('::'), 16)
  t.equal(familyOf('::'), 2)
  t.throws(() => sizeOf(''))
  t.throws(() => familyOf(''))
  t.throws(() => sizeOf('?'))
  t.throws(() => familyOf('?'))
  t.end()
})
