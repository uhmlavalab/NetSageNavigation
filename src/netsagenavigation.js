/*
 * (C) 2018 Tyson Seto-Mook, Laboratory for Advanced Visualization and Applications, University of Hawaii at Manoa.
 */


/*
Copyright 2018 The Trustees of Indiana University

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import {
  MetricsPanelCtrl
} from 'app/plugins/sdk';
import _ from 'lodash';
import {
  Scale
} from './scale';
import {
  CustomHover
} from './CustomHover';
import './css/netsagenavigation_styles.css!';


//import './images/logo.png';

//http://tokelau.manoa.hawaii.edu:3000/public/plugins/netsagenavigation/src/images/logo.png


//import d3 from './js/netsagenavigation_d3.v3';

////// place global variables here ////
const panelDefaults = {
  option_1: "netsage",
  option_2: "netsagenavigation",
  option_3: "plugin",
  option_4: 123,
  choices: [],
  array_option_1: [],
  array_option_2: [],
  array_option_3: [],
  array_option_4: [],
  parsed_data: [],
  max_total: 0,
  to_Byte: false,
  color: {
    mode: 'spectrum',
    cardColor: '#b4ff00',
    colorScale: 'linear',
    exponent: 0.5,
    colorScheme: 'interpolateOranges',
    fillBackground: false
  },
  legend: {
    show: true,
    legend_colors: []
  },
  tooltip: {
    show: true,
    showDefault: true,
    content: ' '
  },
  to_si: 1000000000,
  scales: ['linear', 'sqrt'],
  colorScheme: 'NetSage',
  rgb_values: [],
  hex_values: [],
  //colorModes : ['opacity','spectrum'],
  colorModes: ['spectrum'],
  custom_hover: ' '
};

var tempArray = [];


export class Netsagenavigation extends MetricsPanelCtrl {



  constructor($scope, $injector) {
    super($scope, $injector);

    _.defaults(this.panel, panelDefaults);
    this.netsagenavigation_holder_id = 'netsagenavigation_' + this.panel.id;
    this.containerDivId = 'container_' + this.netsagenavigation_holder_id;
    this.custom_hover = new CustomHover(this.panel.tooltip.content);
    this.scale = new Scale(this.colorScheme);
    this.colorSchemes = this.scale.getColorSchemes();
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
  }



  onDataReceived(dataList) {
    this.panel.parsed_data = [];
    this.panel.max_total = 0;
    this.process_data(dataList);
    this.render();
  }



  process_data(dataList) {
    /////////////////////////////////// IMPORTANT NOTE //////////////////////////////////////
    //    datalist == results
    //    each results have (target, datapoints[])
    //    datapoints[0] == dataValue, datapoints[1] == epoch time dataValue was measured at
    //
    //    multiple queries get returned as one result.
    /////////////////////////////////// IMPORTANT NOTE //////////////////////////////////////


    ///////// your data processing code here /////////////
    var self = this;
    //update with the data!
    _.forEach(dataList, function (data) {
      var min;
      var max;
      var avg = 0;
      var avg_count = 0;
      var total;
      var interval;
      var label;

      //get node label
      label = data.target;

      //find the last valid value
      //find the min
      //find the max
      //find the average
      //find the total datapoints
      for (var i = (data.datapoints.length - 1); i >= 0; i--) {
        var value = data.datapoints[i][0];
        if (value !== undefined && value !== null) {
          avg += value;
          avg_count += 1;
          if (min === undefined) {
            min = value;
            max = value;
          }
          if (value < min) {
            min = value;
          }
          if (value > max) {
            max = value;
          }
        }
      }

      //get total duration of data set
      if (total > 1) {
        var start = data.datapoints[0][1];
        var end = data.datapoints[1][1];
        interval = end - start;
      }

      //put all data into object then into array 
      self.panel.parsed_data.push({
        "min": min,
        "max": max,
        "avg": avg / avg_count,
        "total": avg,
        "interval": interval,
        "label": label
      });
      if (avg > self.panel.max_total) {
        self.panel.max_total = avg;
      }

    });
    ///////// your data processing code here /////////////
  }



  onDataError(err) {
    this.dataRaw = [];
  }



  onInitEditMode() {
    //this.addEditorTab('Options', 'public/plugins/netsagenavigation/editor.html', 2);
    //this.addEditorTab('Display', 'public/plugins/netsagenavigation/display_editor.html', 3);
    this.addEditorTab('Navigation', 'public/plugins/netsagenavigation/nav_editor.html', 3);
    tempArray = this.scale.displayColor(this.panel.colorScheme);
    this.render();
  }



  onInitPanelActions(actions) {
    this.render();
  }


  addNewChoice() {
    var num = this.panel.choices.length + 1;
    this.panel.choices.push(num);
    this.panel.array_option_1.push('');
    this.panel.array_option_2.push('');
    this.panel.array_option_3.push('');
    this.panel.array_option_4.push('');
  }


  removeChoice(index) {
    this.panel.choices.splice(index, 1);
    this.panel.array_option_1.splice(index, 1);
    this.panel.array_option_2.splice(index, 1);
    this.panel.array_option_3.splice(index, 1);
    this.panel.array_option_4.splice(index, 1);
  }


  display() {
    this.panel.colors = this.scale.displayColor(this.panel.colorScheme);
    this.panel.rgb_values = this.panel.colors.rgb_values;
    this.panel.hex_values = this.panel.colors.hex_values;
  }



  getHtml(htmlContent) {
    return this.custom_hover.parseHtml(htmlContent);
    ///use in link///
    //             let html_content = ctrl.getHtml(ctrl.panel.tooltip.content);
    //             ctrl.panel.tooltip.content = html_content;
  }

  formatBytes(val) {
    var hrFormat = null;
    var factor = 1024.0
    val = val / 8.0;

    var b = val;
    var k = val / factor;
    var m = ((val / factor) / factor);
    var g = (((val / factor) / factor) / factor);
    var t = ((((val / factor) / factor) / factor) / factor);
    var p = (((((val / factor) / factor) / factor) / factor) / factor);

    if (p > 1) {
      hrFormat = p.toFixed(2) + "(PB)";
    } else if (t > 1) {
      hrFormat = t.toFixed(2) + "(TB)";
    } else if (g > 1) {
      hrFormat = g.toFixed(2) + "(GB)";
    } else if (m > 1) {
      hrFormat = m.toFixed(2) + "(MB)";
    } else if (k > 1) {
      hrFormat = k.toFixed(2) + "(KB)";
    } else {
      hrFormat = b.toFixed(2) + "(Bytes)";
    }

    return hrFormat
  }

  formatBits(val) {
    var hrFormat = null;
    var factor = 1024.0

    var b = val;
    var k = val / factor;
    var m = ((val / factor) / factor);
    var g = (((val / factor) / factor) / factor);
    var t = ((((val / factor) / factor) / factor) / factor);
    var p = (((((val / factor) / factor) / factor) / factor) / factor);

    if (p > 1) {
      hrFormat = p.toFixed(2) + "(Pb)";
    } else if (t > 1) {
      hrFormat = t.toFixed(2) + "(Tb)";
    } else if (g > 1) {
      hrFormat = g.toFixed(2) + "(Gb)";
    } else if (m > 1) {
      hrFormat = m.toFixed(2) + "(Mb)";
    } else if (k > 1) {
      hrFormat = k.toFixed(2) + "(Kb)";
    } else {
      hrFormat = b.toFixed(2) + "(bits)";
    }

    return hrFormat
  }


  navbarOpen() {
    document.getElementById("mySidenav").style.width = "420px";
  }

  navbarClose() {
    document.getElementById("mySidenav").style.width = "0px";
  }


  link(scope, elem, attrs, ctrl) {
    var self = this;
    ctrl.events.on('render', function () {
      if (document.getElementsByTagName("body")) {
        var navItem = document.getElementById("NavBar");
        //Only create if nav doesnt exist.
        if (!navItem) {
          //This sets the logos 
          var navBarLogoPath = ctrl.panel.topLogoPath;
          var sideNavLogoPath = ctrl.panel.sideLogoPath;
          var hamburgerPath = ctrl.panel.hamburgerPath;
          CreateSideNavBar(navBarLogoPath, sideNavLogoPath, hamburgerPath);
          CreateTopNavBar();
        }
      }
      if (document.getElementById(ctrl.netsagenavigation_holder_id)) {
        ctrl.display();

        RemoveGrafanaNav();
        var currNavBar = window.parent.document.getElementById('menuItems');
        currNavBar.innerHTML = "";

        var questions = [];

        if (ctrl.panel.array_option_1.length > 0) {
          for (var i = 0; i < ctrl.panel.array_option_1.length; i++) {
            var quesObj = {
              "Question": ctrl.panel.array_option_1[i],
              "Url": ctrl.panel.array_option_2[i]
            }
            questions.push(quesObj);
          }
        }

        _.forEach(questions, function (data) {
          var aTag = document.createElement('a');
          aTag.setAttribute('href', data.Url);
          aTag.innerHTML = data.Question;
          aTag.onclick = function () {
            document.getElementById("mySidenav").style.width = "0px";
          }
          currNavBar.appendChild(aTag);
        })



      }
    });
  }

}


function RemoveGrafanaNav() {
  var sideMenuBar = document.getElementsByTagName('sidemenu')[0];
  if (sideMenuBar.style.display != 'none') {
    sideMenuBar.style.display = 'none';
  }

}

function CreateTopNavBar() {
  var grafanaApp = document.getElementsByTagName("grafana-app")[0];
  var menuDiv = document.createElement("div");
  menuDiv.setAttribute("id", "NavBar");
  grafanaApp.setAttribute("style", "margin-top:50px;");
  document.getElementsByTagName("body")[0].insertBefore(menuDiv, grafanaApp)

}

function CreateSideNavBar(toppath, sidepath, hamburgerPath) {
  console.log(toppath, sidepath);
  var sideBarHtml = '<div id="mySidenav" class="sidenav"><div style="background-color:#ffffff;">'
  sideBarHtml += '<left style = "padding-left:30px;"><img src="'
  sideBarHtml += sidepath + '" ></left>'
  sideBarHtml += '</div><a href="javascript:void(0)" class="closebtn" '
  sideBarHtml += 'onclick="document.getElementById('
  sideBarHtml += "'mySidenav').style.width = "
  sideBarHtml += "'0px'"
  sideBarHtml += ';";">'
  sideBarHtml += ' &times;</a><div id="menuItems" ><a href="https://portal.netsage.global/grafana/d/000000003/bandwidth-dashboard?refresh=1d&orgId=2">What is the current state of the network?</a><a href="https://portal.netsage.global/grafana/d/000000006/loss-patterns?orgId=2">What are the patterns of loss in the network?</a><a href="https://portal.netsage.global/grafana/d/000000005/latency-patterns?orgId=2">What are the latency patterns in the network?</a></div></div><span style="font-size:30px;cursor:pointer" '
  sideBarHtml += 'onclick="document.getElementById('
  sideBarHtml += "'mySidenav').style.width = "
  sideBarHtml += "'420px'"
  sideBarHtml += ';";"><img src = "' + hamburgerPath + '" style = "width:45px;"> <img src="' + toppath + '" style= "width:200px; "></span>'
  var sideDiv = document.createElement("div");
  sideDiv.setAttribute("id", "SideDiv");
  sideDiv.innerHTML = sideBarHtml;
  var grafanaApp = document.getElementsByTagName("grafana-app")[0];
  document.getElementsByTagName("body")[0].insertBefore(sideDiv, grafanaApp)
}




Netsagenavigation.templateUrl = 'module.html';