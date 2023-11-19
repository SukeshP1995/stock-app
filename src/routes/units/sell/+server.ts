import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({request}) => {
  try {
    const {units} = await request.json();
    // await Unit.updateMany({_id: {'$in': ids}}, {$set: });
    await Promise.all(units.map(async (unit: any) => {
      const { saleType, saleDate, transactionType, financeName, frameNo: _id, checkpoint } = unit;
      let $set: Record<string, unknown> = { saleDate, saleType, checkpoint }  
      if (saleType === "Counter") {
        $set = { saleDate, saleType, transactionType, financeName }  
      }
      await Unit.updateOne({ _id }, { $set }, {upsert: true, setDefaultsOnInsert: true})
    }));

    return json('success')
  } catch (error) {
    return json(error, {status: 502})
  }
};