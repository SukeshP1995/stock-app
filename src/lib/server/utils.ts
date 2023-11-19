import Unit from '$lib/server/models/unit.model'
type Type<T> = { value: T}


type UnwrapObject<T> = {
  [P in keyof T] : Unwrap<T[P]>
}
type Unwrap<T> =  T extends Type<infer U> ? 
  U extends object ? UnwrapObject<U> : U: 
  T extends object ? UnwrapObject<T> : T

async function getDailySaleInfo(date: Date) {
  let [
    openingArr, 
    soldArr, 
    closingArr, 
    receivedArr, 
    transactionTypesArr, 
    checkpointsArr, 
    financeNamesArr, 
    saleTypesArr, 
    counterSoldArr, 
    networkSoldArr
  ] = await Promise.all([
    Unit.aggregate([
      {
        $match: {
          entryDate: { $lt: date },
          $or: [
            { saleDate: { $exists: false } },
            { saleDate: { $gte: date } }
          ]
        }
      },
      {
        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date
        }
      },
      {
        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          entryDate: { $lte: date },
          $or: [
            { saleDate: { $exists: false } },
            { saleDate: { $gt: date } }
          ]
        }
      },
      {
        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 },

        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          entryDate: date,
        }
      },
      {
        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
          transactionType: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            transactionType: "$transactionType"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
          checkpoint: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$checkpoint"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
          financeName: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            financeName: "$financeName"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
        }
      },
      {
        $group: {
          _id: {
            saleType: "$saleType"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
          saleType: "Counter"
        }
      },
      {

        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: date,
          saleType: "Network"
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$checkpoint",
            color: "$color",
            model: "$model",
          },
          count: { $sum: 1 },
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$_id.checkpoint",
            model: "$_id.model",
          },
          count: { $sum: "$count" },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$_id.checkpoint",
          },
          count: { $sum: "$count" },
          models: {
            $push: {
              model: '$_id.model',
              count: '$count',
              colors: '$colors'
            }
          }
        }
      },
    ])
  ]);

  const opening = Object.assign({}, ...openingArr.map(getModelColorCount));
  const sold = Object.assign({}, ...soldArr.map(getModelColorCount));
  const closing = Object.assign({}, ...closingArr.map(getModelColorCount));
  const received = Object.assign({}, ...receivedArr.map(getModelColorCount));
  const saleTypes = Object.assign({}, ...saleTypesArr.map(ele => ({[ele["_id"]["saleType"]]: ele["count"]})));
  const transactionTypes = Object.assign({}, ...transactionTypesArr.map(ele => ({[ele["_id"]["transactionType"]]: ele["count"]})));
  const checkpoints = Object.assign({}, ...checkpointsArr.map(ele => ({[ele["_id"]["checkpoint"]]: ele["count"]})));
  const financeNames = Object.assign({}, ...financeNamesArr.map(ele => ({[ele["_id"]["financeName"]]: ele["count"]})));

  networkSoldArr.push({
    _id: { checkpoint: 'counter' },
    models: counterSoldArr.map(data => ({
      model: data["_id"]["model"],
      count: data["count"],
      colors: data["colors"]
    })),
    count: await Unit.countDocuments({
      saleType: "Counter",
      saleDate: date,
    })
  });

  const networkSold = Object.assign({}, ...networkSoldArr.map(checkpointData => {
    checkpointData["models"] = Object.assign({}, ...checkpointData["models"].map((modelData: any) => {
      const colors = Object.assign({}, ...modelData["colors"].map((colorData: any) => ({
        [colorData["color"]]: colorData["count"] 
      })));
      const { count } = modelData;
      return { [modelData["model"]]: { count, colors } };
    }));
    const { count, models } = checkpointData;
    return { [checkpointData["_id"]["checkpoint"]]: { count, models } }
  }));

  const models = Array.from(new Set([
    ...Object.keys(opening),
    ...Object.keys(sold),
    ...Object.keys(closing),
    ...Object.keys(received)
  ]));

  return {
    models,
    opening, 
    sold, 
    closing, 
    received, 
    transactionTypes, 
    checkpoints, 
    financeNames, 
    saleTypes, 
    networkSold
  }
}

async function getMonthlySaleInfo(date: Date) {
  let [
    soldArr, 
    receivedArr, 
    transactionTypesArr, 
    checkpointsArr, 
    financeNamesArr, 
    saleTypesArr, 
    counterSoldArr, 
    networkSoldArr
  ] = await Promise.all([
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          }
        },
      },
      {
        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          entryDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
        }
      },
      {

        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
          transactionType: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            transactionType: "$transactionType"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
          checkpoint: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$checkpoint"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
          financeName: { $nin: [null, ""], }
        }
      },
      {
        $group: {
          _id: {
            financeName: "$financeName"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
        }
      },
      {
        $group: {
          _id: {
            saleType: "$saleType"
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
          saleType: "Counter"
        }
      },
      {

        $group: {
          _id: {
            model: '$model',
            color: '$color'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            model: '$_id.model'
          },
          count: { $sum: '$count' },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      }
    ]),
    Unit.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lte: date
          },
          saleType: "Network"
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$checkpoint",
            color: "$color",
            model: "$model",
          },
          count: { $sum: 1 },
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$_id.checkpoint",
            model: "$_id.model",
          },
          count: { $sum: "$count" },
          colors: {
            $push: {
              color: '$_id.color',
              count: '$count'
            }
          }
        }
      },
      {
        $group: {
          _id: {
            checkpoint: "$_id.checkpoint",
          },
          count: { $sum: "$count" },
          models: {
            $push: {
              model: '$_id.model',
              count: '$count',
              colors: '$colors'
            }
          }
        }
      },
    ])
  ]);
  const sold = Object.assign({}, ...soldArr.map(getModelColorCount));
  const received = Object.assign({}, ...receivedArr.map(getModelColorCount));
  const saleTypes = Object.assign({}, ...saleTypesArr.map(ele => ({[ele["_id"]["saleType"]]: ele["count"]})));
  const transactionTypes = Object.assign({}, ...transactionTypesArr.map(ele => ({[ele["_id"]["transactionType"]]: ele["count"]})));
  const checkpoints = Object.assign({}, ...checkpointsArr.map(ele => ({[ele["_id"]["checkpoint"]]: ele["count"]})));
  const financeNames = Object.assign({}, ...financeNamesArr.map(ele => ({[ele["_id"]["financeName"]]: ele["count"]})));

  networkSoldArr.push({
    _id: { checkpoint: 'counter' },
    models: counterSoldArr.map(data => ({
      model: data["_id"]["model"],
      count: data["count"],
      colors: data["colors"]
    })),
    count: await Unit.countDocuments({
      saleType: "Counter",
      saleDate: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lte: date
      },
    })
  });

  const networkSold = Object.assign({}, ...networkSoldArr.map(checkpointData => {
    checkpointData["models"] = Object.assign({}, ...checkpointData["models"].map((modelData: any) => {
      const colors = Object.assign({}, ...modelData["colors"].map((colorData: any) => ({
        [colorData["color"]]: colorData["count"] 
      })));
      const { count } = modelData;
      return { [modelData["model"]]: { count, colors } };
    }));
    const { count, models } = checkpointData;
    return { [checkpointData["_id"]["checkpoint"]]: { count, models }
    };
  }))

  const models = Array.from(new Set([
    ...Object.keys(sold),
    ...Object.keys(received)
  ]));

  return {
    models,
    sold, 
    received, 
    transactionTypes, 
    checkpoints, 
    financeNames, 
    saleTypes, 
    networkSold
  }
}

export async function getSaleInfo(date: Date) {
  return {
    daily: await getDailySaleInfo(date),
    monthly: await getMonthlySaleInfo(date)
  }
}

export function getModelColorCount(ele: any) {
  const colors = Object.assign({}, ...ele["colors"].map((e: Record<string, unknown>) => ({ [`${e["color"]}`]: e["count"] })));
  const { count } = ele;
  return { [ele["_id"]["model"]]: { count, colors } };
}

export const convert = (from: 'hex' | 'utf8', to: 'hex' | 'utf8') => ((str: string) => Buffer.from(str, from).toString(to))
export const utf8ToHex = convert('utf8', 'hex') 
export const hexToUtf8 = convert('hex', 'utf8') 