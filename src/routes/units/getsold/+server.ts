import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model'
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({url}) => {
  try {
    const saleDate = url.searchParams.get('date');
    const units = await Unit.find({saleDate});
    return json(JSON.parse(JSON.stringify(units).replace("_id", "frameNo")));
  } catch (error) {
    return json(error, {status: 502});
  }
};