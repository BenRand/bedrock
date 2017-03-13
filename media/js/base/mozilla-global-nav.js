/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var _closeButton = document.getElementById('nav-drawer-close-button');
    var _drawer = document.getElementById('moz-global-nav-drawer');
    var _langPickerForm = document.getElementById('nav-language-picker-form');
    var _menuButton = document.getElementById('nav-button-menu');
    var _nav = document.getElementById('moz-global-nav');
    var _navLinks = document.querySelectorAll('.nav-primary-links > li > a');
    var _page = document.getElementsByTagName('html')[0];

    var mozGlobalNav = {

        cutsTheMustard: function() {
            return 'querySelector' in document &&
                   'querySelectorAll' in document &&
                   'addEventListener' in window;
        },

        toggleDrawer: function() {
            var action;

            // Toggle the drawer state.
            _page.classList.toggle('moz-nav-open');

            // If the drawer opens, shift focus to the close button.
            if (_page.classList.contains('moz-nav-open')) {
                action = 'open';
                _closeButton.focus();

                document.addEventListener('keydown', mozGlobalNav.handleEscKey, false);
                _drawer.addEventListener('focusout', mozGlobalNav.handleDrawerFocusOut, false);
            }
            // If the drawer closes, clear previously open & selected items and then shift
            // focus back to the menu button
            else {
                action = 'close';

                mozGlobalNav.clearSelectedNavLink();
                mozGlobalNav.closeSecondaryMenuItems();
                _menuButton.focus();

                document.removeEventListener('keydown', mozGlobalNav.handleEscKey, false);
                _drawer.removeEventListener('focusout', mozGlobalNav.handleDrawerFocusOut, false);
            }

            window.dataLayer.push({
                'event': 'global-nav',
                'interaction': 'menu-' + action
            });
        },

        handleDrawerFocusOut: function() {
            // TODO stop focus leaving nav when open.
            // TODO skip child focus when headings are closed.
        },

        toggleDrawerMenu: function(id) {
            var link = document.querySelector('.nav-menu-primary-links > li > .summary > a[data-id="'+ id +'"]');
            var heading = link.parentNode;
            var interaction;

            if (link && heading && heading.classList.contains('summary')) {
                link.focus();

                if (!heading.classList.contains('selected')) {
                    mozGlobalNav.selectNavLink(id);
                    mozGlobalNav.closeSecondaryMenuItems();
                    interaction = 'expand';
                } else {
                    interaction = 'collapse';
                }

                heading.classList.toggle('selected');

                window.dataLayer.push({
                    'event': 'global-nav',
                    'interaction': 'secondary-nav-' + interaction,
                    'secondary-nav-heading': id
                });
            }
        },

        closeSecondaryMenuItems: function() {
            var menuLinks = document.querySelectorAll('.nav-menu-primary-links > li > .summary');

            for (var i = 0; i < menuLinks.length; i++) {
                menuLinks[i].classList.remove('selected');
            }
        },

        selectNavLink: function(id) {
            var target = document.querySelector('.nav-primary-links > li > a[data-id="' + id + '"]');

            if (target) {
                mozGlobalNav.clearSelectedNavLink();
                target.classList.add('selected');
            }
        },

        clearSelectedNavLink: function() {
            // Remove currently selected nav link class
            for (var i = 0; i < _navLinks.length; i++) {
                _navLinks[i].classList.remove('selected');
            }
        },

        handleEscKey: function(e) {
            var isEscape = false;
            e = e || window.event;

            if ('key' in e) {
                isEscape = (e.key === 'Escape' || e.key === 'Esc');
            } else {
                isEscape = (e.keyCode === 27);
            }

            if (isEscape && _page.classList.contains('moz-nav-open')) {
                mozGlobalNav.toggleDrawer();
            }
        },
        // Handle clicks on vertical drawer nav links.
        handleDrawerLinkClick: function(e) {
            e.preventDefault();
            var target = e.target.getAttribute('data-id');

            if (target) {
                mozGlobalNav.toggleDrawerMenu(target);
            }
        },
        // Handle clicks on horozontal primary nav links.
        handleNavLinkClick: function(e) {
            e.preventDefault();
            var id = e.target.getAttribute('data-id');

            if (id) {
                mozGlobalNav.selectNavLink(id);

                if (!_page.classList.contains('moz-nav-open')) {
                    mozGlobalNav.toggleDrawer();
                }

                mozGlobalNav.toggleDrawerMenu(id);
            }
        },

        initNavLangSwitcher: function() {
            var language = document.getElementById('nav-language-picker');
            var previousLanguage = language.value;

            language.addEventListener('change', function() {
                window.dataLayer.push({
                    'event': 'global-nav',
                    'interaction': 'change-language',
                    'languageSelected': language.value,
                    'previousLanguage': previousLanguage
                });

                _langPickerForm.setAttribute('action', window.location.hash || '#');
                _langPickerForm.submit();
            }, false);
        },

        bindEvents: function() {
            var menuLinks = document.querySelectorAll('.nav-menu-primary-links > li > .summary > a');

            for (var i = 0; i < menuLinks.length; i++) {
                menuLinks[i].addEventListener('click', mozGlobalNav.handleDrawerLinkClick, false);
            }

            for (var j = 0; j < _navLinks.length; j++) {
                _navLinks[j].addEventListener('click', mozGlobalNav.handleNavLinkClick, false);
            }

            _menuButton.addEventListener('click', mozGlobalNav.toggleDrawer, false);
            _closeButton.addEventListener('click', mozGlobalNav.toggleDrawer, false);

            var mask = document.getElementById('moz-global-nav-page-mask');
            mask.addEventListener('click', mozGlobalNav.toggleDrawer, false);
        },

        createNavMask: function() {
            var mask = document.createElement('div');
            mask.id = mask.className = 'moz-global-nav-page-mask';
            document.body.appendChild(mask);
        },

        init: function() {
            _menuButton.classList.remove('nav-hidden');

            mozGlobalNav.createNavMask();
            mozGlobalNav.bindEvents();

            if (_langPickerForm) {
                mozGlobalNav.initNavLangSwitcher();
            }
        }
    };

    if (_nav && mozGlobalNav.cutsTheMustard()) {
        mozGlobalNav.init();
    }

})();
