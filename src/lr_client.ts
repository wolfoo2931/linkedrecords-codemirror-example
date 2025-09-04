import LinkedRecords from 'linkedrecords/browser_sdk';

const oidcConfig = {
  redirect_uri: window.location.origin + '/callback',
};

const linkedRecords: LinkedRecords = new LinkedRecords(new URL('https://us1.api.linkedrecords.com'), oidcConfig);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).lr = linkedRecords;

linkedRecords.setConnectionLostHandler((error: any) => {
  console.error('linkedRecords connection lost error:', error);

  // alert('You seem to have a connection problem. Check Your Wifi!')
})

linkedRecords.setUnknownServerErrorHandler(() => {
  console.error('server error')
  // alert('server error')
})

linkedRecords.setLoginHandler(() => {
  // const needsVerification = window.location.search.includes('email-not-verified');
  console.log('redirect to login')
  // linkedRecords.login();
});

export default linkedRecords;