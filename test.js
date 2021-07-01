const test = require('fresh-tape')
const Buffer = require('buffer').Buffer
const { encode, decode, sizeOf, formatOf, familyOf, v4, v6 } = require('.')

test('should convert to buffer IPv4 address', async t => {
  const buf = encode('127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '7f000001')
  t.equal(decode(buf), '127.0.0.1')
})

test('should convert to buffer IPv4 address in-place', async t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('127.0.0.1', buf, offset)
  t.equal(buf.toString('hex', offset, offset + 4), '7f000001')
  t.equal(decode(buf, offset, 4), '127.0.0.1')
})

test('should convert to buffer IPv6 address', async t => {
  const buf = encode('::1')
  t.match(Buffer.from(buf).toString('hex'), /(00){15,15}01/)
  t.equal(decode(buf), '::1')
  t.equal(decode(encode('1::')), '1::')
  t.equal(decode(encode('abcd::dcba')), 'abcd::dcba')
})

test('should convert to buffer IPv6 address in-place', async t => {
  const buf = Buffer.alloc(128)
  const offset = 64
  encode('::1', buf, offset)
  t.ok(/(00){15,15}01/.test(buf.toString('hex', offset, offset + 16)))
  t.equal(decode(buf, offset, 16), '::1')
  t.equal(decode(encode('1::', buf, offset),
    offset, 16), '1::')
  t.equal(decode(encode('abcd::dcba', buf, offset),
    offset, 16), 'abcd::dcba')
})

test('should convert to buffer IPv6 mapped IPv4 address', async t => {
  let buf = encode('::ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')

  buf = encode('ffff::127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), 'ffff000000000000000000007f000001')
  t.equal(decode(buf), 'ffff::7f00:1')

  buf = encode('0:0:0:0:0:ffff:127.0.0.1')
  t.equal(Buffer.from(buf).toString('hex'), '00000000000000000000ffff7f000001')
  t.equal(decode(buf), '::ffff:7f00:1')
})

test('error decoding a buffer of unexpected length', async t => {
  t.throws(() => decode(Buffer.alloc(0)))
})

test('should use on-demand allocation', async t => {
  let buf = encode('127.0.0.1', Buffer.alloc)
  t.equal(buf.toString('hex'), '7f000001')
  buf = encode('127.0.0.1', size => Buffer.alloc(size + 2), 4)
  t.equal(buf.toString('hex'), '000000007f0000010000')
})

test('dedicated encoding v4/v6', async t => {
  t.deepEqual(encode('127.0.0.1'), v4.encode('127.0.0.1'))
  t.deepEqual(encode('::'), v6.encode('::'))
})

test('sizeOf/formatOf test', async t => {
  t.equal(sizeOf('127.0.0.1'), 4)
  t.equal(formatOf('127.0.0.1'), 4)
  t.equal(familyOf('127.0.0.1'), 1)
  t.equal(sizeOf('::'), 16)
  t.equal(formatOf('::'), 6)
  t.equal(familyOf('::'), 2)
  t.throws(() => formatOf(''))
  t.throws(() => sizeOf(''))
  t.throws(() => formatOf('?'))
  t.throws(() => sizeOf('?'))
  t.throws(() => familyOf('?'))
})
