// @flow

export const postMessage = async (type: string, ...args: Array<any>) => {
  if (!self.clients) {
    return;
  }
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  for (const client of clients) {
    client.postMessage({ type, args });
  }
};
