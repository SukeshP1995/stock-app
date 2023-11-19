import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model'
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({request}) => {
  try {
    const rows = await request.json();
    const units = await Unit.find({_id: {$in: rows}});
    return json(JSON.parse(JSON.stringify(units).replace("_id", "frameNo")));
  } catch (error) {
    return json(error, {status: 502});
  }
};