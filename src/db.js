import Dexie from 'dexie';

export const db = new Dexie('smsDatabase');

db.version(1).stores({
  sms: '++id, address, date, type, body, contact_name, readable_date, [address+date+body]'
});
