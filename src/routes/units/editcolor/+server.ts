import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({request}) => {
  try {
    const {color, frameNo} = await request.json();
    await Unit.updateOne({_id: frameNo}, {$set: {color} });
    return json('success')
  } catch (error) {
    return json(error, {status: 502})
  }
};