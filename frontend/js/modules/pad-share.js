/**
*  # Pad sharing module
*
*  ## License
*
*  Licensed to the Apache Software Foundation (ASF) under one
*  or more contributor license agreements.  See the NOTICE file
*  distributed with this work for additional information
*  regarding copyright ownership.  The ASF licenses this file
*  to you under the Apache License, Version 2.0 (the
*  "License"); you may not use this file except in compliance
*  with the License.  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing,
*  software distributed under the License is distributed on an
*  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*  KIND, either express or implied.  See the License for the
*  specific language governing permissions and limitations
*  under the License.
*
*  ## Description
*
*  Short module for pad sharing
*/

module.exports = (function () {
  'use strict';
  // Dependencies
  var m = require('mithril');
  var ld = require('lodash');
  var auth = require('../auth.js');
  var conf = require('../configuration.js');
  var GROUP = conf.LANG.GROUP;
  var model = require('../model/group.js');
  var notif = require('../widgets/notification.js');

  var share = {};

  /**
  * ## Controller
  *
  * Used to display the real etherpad link.
  */
  share.controller = function () {
    if (!auth.isAuthenticated()) { return m.route('/login'); }
      var gkey = m.route.param('group');
      var key = m.route.param('pad');
      var group = model.data()[gkey];
      var link = window.location.protocol + '//' + window.location.host +
        '/p/' + key;
      if (group.visibility === 'private') {
        var password = window.prompt(GROUP.SHARE_PASSWORD);
        link += '?mypadspassword=' + password;
      }
      window.prompt(GROUP.SHARE_LINK, link);
      m.route('/mypads/group/' + gkey + '/view');
  };

  return share;
}).call(this);
