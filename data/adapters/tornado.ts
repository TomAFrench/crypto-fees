import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';

export async function getTornadoData(date: string): Promise<number> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!){
    now: tornado(id: "1", block: {number: $today}) {
      totalFeesUSD
    }
    yesterday: tornado(id: "1", block: {number: $yesterday}) {
      totalFeesUSD
    }
  }`;
  const data = await query(
    'dmihal/tornado-cash',
    graphQuery,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );

  return parseFloat(data.now.totalFeesUSD) - parseFloat(data.yesterday.totalFeesUSD);
}

export default function registerSushiswap(register: any) {
  const tornadoQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return getTornadoData(date);
  };

  register('tornado', tornadoQuery, {
    name: 'Tornado Cash',
    category: 'other',
    description: 'Tornado Cash is a privacy tool for trustless asset mixing.',
    feeDescription: 'Relay fees are paid by withdrawers to relayers.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'tornado',
    tokenTicker: 'TORN',
    tokenCoingecko: 'tornado-cash',
    tokenLaunch: '2021-02-09',
  });
}
