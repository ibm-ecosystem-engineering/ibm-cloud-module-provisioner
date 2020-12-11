import React, { Component,useState } from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {
  Form,
  Grid,
  Row,
  Column,
  FormLabel,
  Tooltip,
  TextInput,
  Button,
  Tile,ClickableTile,InfoSection, InfoCard,
  Header
} from 'carbon-components-react';
// import { Card } from '@carbon/ibmdotcom-react';
// import { ContentBlockCards } from '@carbon/ibmdotcom-react';
// import CardSectionSimple from '@carbon/ibmdotcom-react/es/components/CardSectionSimple/CardSectionSimple';

import './Provisioner.css';
import 'react-notifications/lib/notifications.css';
import cloudmodules from "./cloud-modules";


class Provisioner extends Component {

  state = {
    // tasks: [
    //     {name:"Hit the gym",category:"todo", bgcolor: "#FFB695"},
    //     {name:"Get breakfast", category:"todo", bgcolor:"#96D1CD"},
    //     {name:"Lunch",category:"todo", bgcolor: "#FFB695"},
    //   ]
  }

  getSelectedModulesRequest = () => {

    let selectedModules = cloudmodules.module.filter( function (module) {
      console.log('module.category  ....' + module.category);
        return module.category === "done";    
      });

    console.log('getSelectedModulesRequest ....', selectedModules);

    return selectedModules;
  };
  
  onClickProvision = async () => {

      console.log('onClickProvision ..... ');

      // var referenceName = this.state.referenceName;
      var curTime = new Date().toLocaleString();
      var referenceName = "Provisioner-" + curTime;
      var accountID = localStorage.getItem('accountID');
      var clusterID = localStorage.getItem('clusterID');
      var selectedModulesRequest = this.getSelectedModulesRequest();
      console.log('onClickProvision .....referenceName: ' + referenceName);
      console.log('onClickProvision .....selectedModulesRequest: ' + selectedModulesRequest);

      try {

        const apiResponse = await fetch(
          '/api/v1/provisioner/provision',
          {
            method: 'post',

            body: JSON.stringify({
              referencename: referenceName,
              date: curTime,
              account: accountID,
              cluster: clusterID,
              module: selectedModulesRequest
            }),
          },
          3
        );
        console.log('API Response : ', apiResponse);
        NotificationManager.success('Reequest created successfully', 'Module Provisioner');
       
        this.onClickClearSelections();

        return apiResponse;
      } catch (e) {
        console.log('Error onClickProvision', e);
      }
  };

  shouldProvisionEnabled = () => {
    return true;
  };

  onDragOver = (ev) => {
    ev.preventDefault();
  }

  onDrop = (ev, cat) => {
    let id = ev.dataTransfer.getData("id");

    let modules = cloudmodules.module.filter((module) => {
      if (module.name == id) {
        module.category = cat;
      }
      return module;
    });

    this.setState({
      ...this.state,
      modules
    });
  }

  onClickClearSelections = () => {
    let modules = cloudmodules.module.filter((module) => {
      module.category = "todo";
      return module;
    });

    this.setState({
      ...this.state,
      modules
    });
  }

  onDragStart = (ev, id) => {
    console.log('dragstart:', id);
    ev.dataTransfer.setData("id", id);
  }

  onReferenceNameChange(event) {
    this.state.referenceName = event.target.value;
  }

  render() {
    var tasks = {
      todo: [],
      done: []
    }

    var accountID = localStorage.getItem('accountID');
    var clusterID = localStorage.getItem('clusterID');
    this.state = cloudmodules;

    this.state.module.map((t, i) => {

      tasks[t.category].push(
        <div key={t.name} class="bx--tile bx--tile:hover modulesCard "
          onDragStart={(e) => this.onDragStart(e, t.name)}
          draggable
        >
          <h4>{t.name}</h4>
          <p>
              <span class="labelGrey">Provider : </span>{t.provider}
              <span class="labelGrey">&nbsp;&nbsp;&nbsp;&nbsp;features : </span>{t.features}
          </p>
          <p>
              <span class="labelGrey">Latest Release : </span>{t.latestrelease} &nbsp;&nbsp;&nbsp;&nbsp;<a href={t.location} target="_blank" class="bx--link">Link</a>
          </p>
        </div>
      );
    });

    return (
      <div><Form>
      <div class="bx--grid">
        <h2> Module Provisioner</h2>
        <p  class="labelGrey">The IBM Cloud Modules Provisioner list a collection of terraform modules that can be selected and provisioned to an environment in an IBM Cloud or OpenShift environment.</p>
        <br></br>
        <div className="bx--row">
            <div className="bx--col-md-3">
                <p><span class="labelGrey">Account : </span>{accountID}</p>
            </div>
            <div className="bx--col-md-3">
                <p><span class="labelGrey">Cluster : </span>{clusterID}</p>
            </div>
        </div>
        <br></br>
        <div className="bx--row">
          <div className="bx--col-md-8">
            <NotificationContainer/>
          </div>
        </div>
        <div className="bx--row">
            <div className="bx--col-md-6">
                <div className="bx--tile availableHeader">
                  <h4><span>  Available Modules</span></h4>
                </div>
            </div>
            <div className="bx--col-md-2">
              <div className="bx--tile selectedHeader">
                <h4><span> Selected Modules</span></h4>
              </div>
            </div>
        </div>

        <div className="bx--row">
            <div className="bx--col-md-6">
                <div className="availableBody"
                  onDragOver={(e) => this.onDragOver(e)}
                  onDrop={(e) => { this.onDrop(e, "todo") }}>
                    {tasks.todo}
                </div>
            </div>
            <div className="bx--col-md-2">
              {/* <TextInput
                labelText=""
                id="refereneName"
                className="tag-text-input refereneName"
                placeholder="Reference Name"
                value="this.state.refereneName"
                onChange={(e) => this.onReferenceNameChange(e)}
              /> */}
              <div className="selectedBody"
                onDrop={(e) => this.onDrop(e, "done")}
                onDragOver={(ev) => this.onDragOver(ev)}>
                {tasks.done}
              </div>
            </div>
            <div className="bx--col-md-8">
              <p class="labelGrey">Drag and drop the required terraform modules into the selected modules section</p>
            </div>
        </div>

        <div className="bx--row">
          <div className="bx--col-md-6">
          </div>
          <div className="bx--col-md-2">
            <Button
                enabled={this.shouldProvisionEnabled()}
                onClick={() => this.onClickProvision()}
                size="default"
              > 
                Provision
              </Button>
              &nbsp; &nbsp; &nbsp;
              <Button
                onClick={() => this.onClickClearSelections()}
                size="default"
              > 
                Clear
              </Button>
          </div>
        </div>
    </div></Form>
      </div>
    );
  }
}

export default Provisioner;
