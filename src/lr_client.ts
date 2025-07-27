import LinkedRecords from 'linkedrecords/browser_sdk';

const linkedRecords: LinkedRecords = new LinkedRecords(new URL('http://localhost:6543'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).lr = linkedRecords;

linkedRecords.setConnectionLostHandler((error: any) => {
  console.log('linkedRecords connection lost error:', error);

  alert('You seem to have a connection problem. Check Your Wifi!')
})

linkedRecords.setUnknownServerErrorHandler(() => {
  alert('server error')
})

linkedRecords.setLoginHandler(() => {
  // const needsVerification = window.location.search.includes('email-not-verified');

  alert('go to: http://localhost:6543/login')
});

export default linkedRecords;