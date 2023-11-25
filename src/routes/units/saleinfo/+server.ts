import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model'
import { json } from '@sveltejs/kit';
import { getSaleInfo } from '$lib/server/utils';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const date = new Date(url.searchParams.get('date')!);

    const saleInfo = await getSaleInfo(date);

    const data: Record<string, unknown> = {
      total: {
        daily: [
          await Unit.countDocuments({
            entryDate: { $lt: date },
            $or: [
              { saleDate: { $exists: false } },
              { saleDate: { $gte: date } }
            ]
          }),
          await Unit.countDocuments({
            saleDate: date
          }),
          await Unit.countDocuments({
            entryDate: { $lte: date },
            $or: [
              { saleDate: { $exists: false } },
              { saleDate: { $gt: date } }
            ]
          }),
          await Unit.countDocuments({
            entryDate: date,
          })
        ],
        monthly: [
          await Unit.countDocuments({
            saleDate: {
              $gte: new Date(date.getFullYear(), date.getMonth(), 1),
              $lte: date
            }
          }),
          await Unit.countDocuments({
            entryDate: {
              $gte: new Date(date.getFullYear(), date.getMonth(), 1),
              $lte: date
            }
          }),
        ]
      },
      saleInfo: {
        daily: Object.assign({}, ...saleInfo.daily.models.map(model => {
          const counts = [
            saleInfo.daily.opening[model],
            saleInfo.daily.sold[model],
            saleInfo.daily.closing[model],
            saleInfo.daily.received[model]
          ]
          const colors = Array.from(new Set(([] as string[])
                                .concat(Object.keys(saleInfo.daily.opening[model] ? saleInfo.daily.opening[model]["colors"] : {}))
                                .concat(Object.keys(saleInfo.daily.sold[model] ? saleInfo.daily.sold[model]["colors"] : {}))
                                .concat(Object.keys(saleInfo.daily.closing[model] ? saleInfo.daily.closing[model]["colors"] : {}))
                                .concat(Object.keys(saleInfo.daily.received[model] ? saleInfo.daily.received[model]["colors"] : {}))));
          
          return { [model]: { counts, colors } };
        })),
        monthly: Object.assign({}, ...saleInfo.monthly.models.map(model => ({
          [model]: {
            counts: [
              saleInfo.monthly.sold[model],
              saleInfo.monthly.received[model]
            ],
            colors: Array.from(new Set(([] as string[])
                      .concat(Object.keys(saleInfo.monthly.sold[model] ? saleInfo.monthly.sold[model]["colors"] : {}))
                      .concat(Object.keys(saleInfo.monthly.received[model] ? saleInfo.monthly.received[model]["colors"] : {}))))
          }
        })))
      },
      saleTypes: { daily: saleInfo.daily.saleTypes, monthly: saleInfo.monthly.saleTypes },
      transactionTypes: { daily: saleInfo.daily.transactionTypes, monthly: saleInfo.monthly.transactionTypes },
      checkpoints: { daily: saleInfo.daily.checkpoints, monthly: saleInfo.monthly.checkpoints },
      financeNames: { daily: saleInfo.daily.financeNames, monthly: saleInfo.monthly.financeNames },
      networkSold: { daily: saleInfo.daily.networkSold, monthly: saleInfo.monthly.networkSold }
    };

    return json(data);
  } catch (error) {
    return json(error, { status: 502 });
  }
};