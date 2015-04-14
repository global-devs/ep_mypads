/**
*  # Subscription module
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
*  This module contains the subscription logic and markup.
*/

module.exports = (function () {
  // Dependencies
  var ld = require('lodash');
  var m = require('mithril');
  // Local Dependencies
  var conf = require('../configuration.js');
  var form = require('../helpers/form.js');
  var USER = conf.LANG.USER;
  var notif = require('./notification.js');
  var auth = require('../auth.js');
  var layout = require('./layout.js');
  var user = require('./user.js');

  var subscribe = {};

  /**
  * ## Controller
  *
  * Used for module state and actions.
  * And user submission.
  *
  */

  subscribe.controller = function () {
    var c = user.controller();
    c.profileView = m.prop((m.route() === '/myprofile'));
    if (c.profileView() && !auth.isAuthenticated()) {
      return m.route('/login');
    }
    c.fields = ['login', 'password', 'passwordConfirm', 'email', 'firstname',
      'lastname', 'organization'];
    if (c.profileView()) { c.fields.push('passwordCurrent'); }
    form.initFields(c, c.fields);
    if (c.profileView()) {
      ld.map(c.fields, function (f) {
        if (!ld.startsWith(f, 'password')) {
          c.data[f] = m.prop(auth.userInfo()[f]);
        }
      });
    }

    /**
    * `submit` internal calls the public API to subscribe with given data.
    * It ensures that additionnal validity check is done.
    * It displays errors if needed or success and fixes local cached data for
    * the user. Finally, it authenticates new created user.
    */

    c.submit = {};
    var errfn = function (err) { return notif.error({ body: err.error }); };
    c.submit.subscribe = function (e) {
      e.preventDefault();
      if (c.data.password() !== c.data.passwordConfirm()) {
        notif.warning({ body: USER.ERR.PASSWORD_MISMATCH });
        document.querySelector('input[name="passwordConfirm"]').focus();
      } else {
        m.request({
          method: 'POST',
          url: conf.URLS.USER,
          data: c.data
        }).then(function (resp) {
          auth.isAuthenticated(true);
          auth.userInfo(resp.value);
          notif.success({ body: USER.AUTH.SUBSCRIBE_SUCCESS });
          m.request({
            method: 'POST',
            url: conf.URLS.LOGIN,
            data: c.data
          }).then(m.route.bind(null, '/'), errfn);
        }, errfn);
      }
    };
    var passwordUpdate = function () {
      var pass = c.data.password();
      if (!pass || (pass !== c.data.passwordConfirm())) {
        c.data.password(c.data.passwordCurrent());
      }
    };
    window.cdata = c.data;
    window.userInfo = auth.userInfo;
    c.submit.profileSave = function (e) {
      e.preventDefault();
      m.request({
        method: 'POST',
        url: conf.URLS.CHECK,
        data: { login: auth.userInfo().login, password: c.data.passwordCurrent }
      }).then(function () {
        passwordUpdate();
        m.request({
          method: 'PUT',
          url: conf.URLS.USER + '/' + auth.userInfo().login,
          data: c.data
        }).then(function (resp) {
          auth.userInfo(resp.value);
          notif.success({ body: USER.AUTH.PROFILE_SUCCESS });
        }, errfn);
      }, errfn);
    };
    return c;
  };

  /**
  * ## Views
  *
  * `main` and `aside`, used with layout.
  */

  var view = {};

  view.form = function (c) {
    var fields = ld.reduce(c.fields, function (memo, f) {
      memo[f] = user.view.field[f](c); 
      return memo;
    }, {});
    var requiredFields = [
        fields.password.label, fields.password.input, fields.password.icon,
        fields.passwordConfirm.label, fields.passwordConfirm.input,
        fields.passwordConfirm.icon,
        fields.email.label, fields.email.input, fields.email.icon
    ];
    if (c.profileView()) {
      var passC = user.view.field.passwordCurrent(c);
      requiredFields.splice(0, 0, passC.label, passC.input, passC.icon);
    } else {
      var log = fields.login;
      requiredFields.splice(0, 0, log.label, log.input, log.icon);
    }
    return m('form', {
      id: 'subscribe-form',
      class: 'block ' + c.classes.user.form,
      onsubmit: c.profileView() ? c.submit.profileSave : c.submit.subscribe
      }, [
      m('fieldset.block-group', [
        m('legend', { class: c.classes.user.legend }, USER.MANDATORY_FIELDS),
        m('div', requiredFields)
      ]),
      m('fieldset.block-group', [
        m('legend', { class: c.classes.user.legendopt }, USER.OPTIONAL_FIELDS),
        fields.firstname.label, fields.firstname.input, fields.firstname.icon,
        fields.lastname.label, fields.lastname.input, fields.lastname.icon,
        fields.organization.label, fields.organization.input,
        fields.organization.icon
      ]),
      m('input', {
        class: 'block ' + c.classes.user.inputSubmit,
        form: 'subscribe-form',
        type: 'submit',
        value: c.profileView() ? conf.LANG.ACTIONS.SAVE : USER.REGISTER
      })
    ]);
  };

  view.main = function (c) {
    return m('section', { class: 'block-group ' + c.classes.user.section }, [
      m('h2', {
        class: 'block ' + c.classes.user.h2
      }, c.profileView() ? USER.PROFILE : USER.SUBSCRIBE),
      view.form(c)
    ]);
  };

  subscribe.view = function (c) {
    return layout.view(view.main(c), user.view.aside(c));
  };

  return subscribe;
}).call(this);