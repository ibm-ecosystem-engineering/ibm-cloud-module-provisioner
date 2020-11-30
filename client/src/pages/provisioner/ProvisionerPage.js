import React from 'react';
import { Loading } from 'carbon-components-react';
import Provisioner from './Provisioner';

const ProvisionerPage = ({ hasChosenAccount, tokenUpgraded, accountID }) => {
  if (!hasChosenAccount) {
    return <h6>Please select account</h6>;
  } else if (tokenUpgraded) {
    console.log('ProvisionerPage ...... Provisioner');
    return <Provisioner accountID={accountID} />;
  }
  console.log('ProvisionerPage ...... Loading');
  return <Loading />;
};

export default ProvisionerPage;
