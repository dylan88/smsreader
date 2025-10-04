import { XMLParser } from 'fast-xml-parser';

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: true,
  trimValues: true
};

const parser = new XMLParser(options);

export function parseXMLFile(xmlContent) {
  try {
    const result = parser.parse(xmlContent);

    if (!result.smses || !result.smses.sms) {
      return [];
    }

    // Si c'est un seul SMS, le mettre dans un tableau
    const smsArray = Array.isArray(result.smses.sms)
      ? result.smses.sms
      : [result.smses.sms];

    return smsArray.map(sms => ({
      address: sms.address || '',
      date: parseInt(sms.date) || 0,
      type: parseInt(sms.type) || 0,
      body: sms.body || '',
      contact_name: sms.contact_name || '(Unknown)',
      readable_date: sms.readable_date || '',
      protocol: sms.protocol || '',
      subject: sms.subject || '',
      toa: sms.toa || '',
      sc_toa: sms.sc_toa || '',
      service_center: sms.service_center || '',
      read: sms.read || '0',
      status: sms.status || '',
      locked: sms.locked || '0',
      date_sent: parseInt(sms.date_sent) || 0,
      sub_id: sms.sub_id || ''
    }));
  } catch (error) {
    console.error('Erreur lors du parsing XML:', error);
    throw new Error('Fichier XML invalide');
  }
}

export function removeDuplicates(smsArray) {
  const uniqueMap = new Map();

  smsArray.forEach(sms => {
    const key = `${sms.address}-${sms.date}-${sms.body}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, sms);
    }
  });

  return Array.from(uniqueMap.values());
}
