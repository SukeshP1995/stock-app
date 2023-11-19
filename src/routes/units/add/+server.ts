import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model'
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({request}) => {
  try {
    const rows = await request.json();
    await Promise.all(rows!.map(async (row: unknown[]) => {
      await Unit.updateOne({_id: row[2]}, {$set: { 
        engineNo: row[3],
        model: row[1],
        color: row[4],
        entryDate: row[5]}}, {upsert : true, setDefaultsOnInsert: true});
      }
    ));

    return json('success');
  } catch (error) {
    return json(error, {status: 502});
  }
};