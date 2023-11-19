import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { hexToUtf8, utf8ToHex } from '$lib/server/utils';

export const GET: RequestHandler = async () => {
  try {
    let code = (new Date()).setHours(0,0,0,0).toString();
    const encoded = utf8ToHex(code);
    const decoded = hexToUtf8(encoded);
    return json([encoded, parseInt(decoded)]);
  } catch (error) {
    return json(error, {status: 502});
  }
};