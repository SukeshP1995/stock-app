import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    console.log()
    await Unit.find({ transactionType: "Finance", financeName: { $ne: null } }, { financeName: 1 });
    return json('success');
  } catch (error) {
    return json(error);
  }
  return new Response();
};