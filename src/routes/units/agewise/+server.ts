import type { RequestHandler } from './$types';
import Unit from '$lib/server/models/unit.model'
import * as _ from "lodash-es";
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    const ageWiseUnits = (await Unit.aggregate([
      {
        $match: {
          saleDate: {
            $exists: false
          }
        }
      },
      {
        $group: {
          _id: {
            color: "$color",
            day: { $dayOfMonth: "$entryDate" },
            month: { $month: "$entryDate" },
            year: { $year: "$entryDate" },
            model: "$model",
          },
          data: {
            $push: {
              data: "$$ROOT"
            }
          },
          count: { $sum: 1 },
        }
      },
      {
        $project: {
          _id: 0,
          id5: "$_id",
          data: 1,
          count: 1
        }
      },
      {
        $sort: {
          "_id5.color": 1
        }
      },
      {
        $group: {
          _id: {
            day: "$id5.day",
            month: "$id5.month",
            year: "$id5.year",
            model: "$id5.model",
          },
          data: {
            $push: {
              color: "$id5.color",
              data: "$data",
              count: "$count"
            }
          },
          count: { $sum: "$count" },
        }
      },
      {
        $project: {
          _id: 0,
          id4: "$_id",
          data: 1,
          count: 1
        }
      },
      {
        $sort: {
          "_id4.day": 1
        }
      },
      {
        $group: {
          _id: {
            month: "$id4.month",
            year: "$id4.year",
            model: "$id4.model",
          },
          data: {
            $push: {
              day: "$id4.day",
              data: "$data",
              count: "$count"
            }
          },
          count: { $sum: "$count" },
        }
      },
      {
        $project: {
          _id: 0,
          id3: "$_id",
          data: 1,
          count: 1
        }
      },
      {
        $sort: {
          "_id3.month": 1
        }
      },
      {
        $group: {
          _id: {
            year: "$id3.year",
            model: "$id3.model",
          },

          data: {
            $push: {
              month: "$id3.month",
              data: "$data",
              count: "$count"
            }
          },
          count: { $sum: "$count" }
        }
      },
      {
        $project: {
          _id: 0,
          id2: "$_id",
          data: 1,
          count: 1
        }
      },
      {
        $sort: {
          "_id2.year": 1
        }
      },
      {
        $group: {
          _id: {
            model: "$id2.model",
          },
          data: {
            $push: {
              year: "$id2.year",
              data: "$data",
              count: "$count"
            }
          },
          count: { $sum: "$count" }
        }
      },
      {
        $project: {
          _id: 0,
          id1: "$_id",
          data: 1,
          count: 1
        }
      },
      {
        $sort: {
          "_id1.model": 1
        }
      },
      {
        $group: {
          _id: null,
          data: {
            $push: {
              model: "$id1.model",
              data: "$data",
              count: "$count"
            }
          },
          count: { $sum: "$count" }
        }
      },
    ]))[0];

    ageWiseUnits["data"] = _.sortBy(ageWiseUnits["data"], "model");
    ageWiseUnits["data"] = _.forEach(ageWiseUnits["data"], modelData => {
      modelData["data"] = _.forEach(modelData["data"], yearData => {
        yearData["data"] = _.forEach(yearData["data"], monthData => {
          monthData["data"] = _.sortBy(monthData["data"], "day");
          return monthData;
        });
        return yearData
      });
      return modelData;
    });
    return json(JSON.parse(JSON.stringify(ageWiseUnits).replace(/_id/g, "frameNo")));
  } catch (error) {
    return json(error, {status: 502});
  }
};