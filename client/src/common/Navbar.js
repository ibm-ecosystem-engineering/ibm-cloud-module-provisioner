import React from 'react';
import { Dropdown, Button } from 'carbon-components-react';
import styles from './Navbar.module.css';
import { Settings32 as Settings } from '@carbon/icons-react';
// import Dropdown from "react-dropdown";
import history from '../globalHistory';
import './Dropdown.css';
import './Navbar.css';

const MenuItem = (props) => {
  return (
    <div className={props.stylesx} onClick={props.onClickHandler}>
      {props.label}
    </div>
  );
};

const MenuIcon = (props) => {
  return (
      <Button
        className="menu-icon"
        renderIcon={Settings}
        iconDescription="Settings Page"
        hasIconOnly
        type="button"
        tooltipPosition="bottom"
        size="field"
        kind={props.kind}
        onClick={props.onClickHandler}
      />
  );
};

const Navbar = (props) => {
  const itemToString = (item) => {
    if (item) {
      const { name } = item.entity;
      const softlayerAccountId =
        item.entity.bluemix_subscriptions[0].softlayer_account_id || '';

      return `${name} ${softlayerAccountId}`;
    }
    return 'Unknown';
  };

  const handleCreateClick = () => {
    if(props.selectedItem){
      history.push('/create?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/create');
    }
  };
  const handleScheduleClick = () => {
    if(props.selectedItem){
      history.push('/schedule?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/schedule');
    }
  };
  const handleProvisionerClick = () => {
    if(props.selectedItem){
      history.push('/provisioner?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/Provisioner');
    }
  };
  const handleClusterClick = () => {
    if(props.selectedItem){
      history.push('/cluster?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/cluster');
    }
  };
  const handleSettingsClick = () => {
    if(props.selectedItem){
      history.push('/settings?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/settings');
    }
  };

  const homeClick = () => {
    if(props.selectedItem){
      history.push('/?account='+props.selectedItem.metadata.guid);
    }else{
      history.push('/');
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.title} onClick={homeClick}>
          <span className={styles.bold}>IBM</span> Cloud
        </div>
        <MenuItem
          stylesx={props.path === '/create' ? styles.activeItem : styles.item}
          label="Create"
          onClickHandler={handleCreateClick}
        />
        <MenuItem
          stylesx={props.path === '/schedule' ? styles.activeItem : styles.item}
          label="Schedule"
          onClickHandler={handleScheduleClick}
        />
        <MenuItem
          stylesx={props.path === '/cluster' ? styles.activeItem : styles.item}
          label="Cluster"
          onClickHandler={handleClusterClick}
        />
        <MenuItem
          stylesx={props.path === '/provisioner' ? styles.activeItem : styles.item}
          label="Provisioner"
          onClickHandler={handleProvisionerClick}
        />
        <Dropdown
          disabled={props.accountsLoaded}
          className="navbar-dropdown"
          ariaLabel="Dropdown"
          label="Select Account"
          items={props.items || []}
          onChange={props.accountSelected}
          selectedItem={props.selectedItem}
          itemToString={itemToString}
          id="account-dropdown"
          light={false}
        />
        <MenuIcon
          kind={props.path === '/settings' ? 'primary':'secondary'}
          label="Settings"
          onClickHandler={handleSettingsClick}
        />
      </div>
    </>
  );
};

export default Navbar;
