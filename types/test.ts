import { encode, decode, name, v4, v6, sizeOf, familyOf } from '@leichtgewicht/ip-codec';
import { Buffer } from 'buffer';

const ip: "ip" = name;
let uint8: Uint8Array = encode('127.0.0.1');
uint8 = encode('127.0.0.1', new Uint8Array(v4.size));
uint8 = encode('127.0.0.1', new Uint8Array(v4.size), 3);
uint8 = encode('127.0.0.1', size => new Uint8Array(size));
let str: string = decode(uint8);
str = decode(uint8, 1);
str = decode(uint8, 1, 1);

let buf: Buffer = encode('127.0.0.1', Buffer.alloc(v4.size));
buf = encode('::', Buffer.alloc);
// $ExpectError
buf = encode('127.0.0.1');

const size: 4 | 16 = sizeOf('hi');
const family: 1 | 2 = familyOf('hi');

let bool: boolean = v4.isFormat('127.0.0.1');
bool = v6.isFormat('::ffff');

const _ipv4: "ipv4" = v4.name;
const _ipv6: "ipv6" = v6.name;
