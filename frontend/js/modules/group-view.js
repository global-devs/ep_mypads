/**
*  # Group View module
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
*  This module lists all pads linked to the group.
*/

module.exports = (function () {
  'use strict';
  // Global dependencies
  var m = require('mithril');
  var ld = require('lodash');
  // Local dependencies
  var conf = require('../configuration.js');
  var GROUP = conf.LANG.GROUP;
  var layout = require('./layout.js');
  var model = require('../model/group.js');

  var group = {};

  /**
  * ## Controller
  *
  * Used for group and pads data.
  * Ensures that models are already loaded, either load them.
  */

  group.controller = function () {
    var c = {};

    var init = function () {
      var key = m.route.param('key');
      c.group = model.data()[key];
    };

    if (ld.isEmpty(model.data())) { model.fetch(init); } else { init(); }

    return c;
  };

  /**
  * ## Views
  */

  var view = {};

  /*
  * ### group view
  *
  * `properties` section for displaying chodsen options of the group
  */

  view.properties = function (c) {
    return m('section', [
      m('dl.block-group.group', [
        m('dt.block', GROUP.PAD.PADS),
        m('dd.block', ld.size(c.group.pads)),
        m('dt.block', GROUP.PAD.ADMINS),
        m('dd.block', ld.size(c.group.admins)),
        m('dt.block', GROUP.PAD.USERS),
        m('dd.block', ld.size(c.group.users)),
        m('dt.block', GROUP.PAD.VISIBILITY),
        m('dd.block', c.group.visibility),
        m('dt.block', GROUP.FIELD.READONLY),
        m('dd.block', c.group.readonly),
        m('dt.block', GROUP.TAGS.TITLE),
        m('dd.block', c.group.tags.join(', '))
      ])
    ]);
  };

  /**
  * ### pads
  *
  * View for all linked `pads`, name and actions.
  */

  view.pads = function (c) {
    if (ld.size(c.group.pads) === 0) {
      return m('p', GROUP.PAD.NONE);
    } else {
      return m('ul', ld.map(c.group.pads, function (p) { return m('li', p); }));
    }
  };

  /**
  * ### users
  *
  * View for all `users` and admins, displayed with some information and quick
  * actions.
  */

  view.users = function (c) {
    var list = function (field) {
      if (ld.size(field) === 0) {
        return m('p', GROUP.PAD.USERS_NONE);
      } else {
        return m('ul', ld.map(field, function (a) { return m('li', a); }));
      }
    };
    return m('section', [
      m('h4.block', GROUP.PAD.ADMINS),
      list(c.group.admins),
      m('h4.block', GROUP.PAD.USERS),
      list(c.group.users) 
    ]);
  };

  view.main = function (c) {
    return m('section', { class: 'block-group group' }, [
      m('h2.block', GROUP.GROUP + ' ' + c.group.name),
      m('section.block.props', [
        m('h3.title', GROUP.PROPERTIES),
        view.properties(c)
      ]),
      m('section.block.pads', [
        m('h3.title', GROUP.PAD.PADS),
        view.pads(c)
      ]),
      m('section.block.users', [
        m('h3.title', GROUP.PAD.USERS),
        view.users(c)
      ])
    ]);
  };

  view.aside = function () {
    return m('section.user-aside', [
      m('h2', conf.LANG.ACTIONS.HELP),
      m('article', m.trust(GROUP.VIEW_HELP))
    ]);
  };

  group.view = function (c) {
    return layout.view(view.main(c), view.aside(c)); 
  };

  return group;
}).call(this);
